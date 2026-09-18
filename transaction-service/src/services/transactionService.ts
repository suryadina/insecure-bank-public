import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../config/database';
import { 
    Account, 
    Transaction, 
    TransactionLog, 
    CreateAccountRequest, 
    TransferRequest, 
    DepositRequest, 
    WithdrawRequest,
    ApiResponse 
} from '../types';

export class TransactionService {
    
    async createAccount(request: CreateAccountRequest): Promise<ApiResponse<Account>> {
        try {
            // Generate account number (vulnerable: predictable pattern)
            const accountNumber = `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;
            
            let query: string;
            let params: any[];
            
            if (request.account_type === 'TIME_DEPOSIT') {
                query = `
                    INSERT INTO accounts (customer_id, account_number, account_type, balance, maturity_date)
                    VALUES ($1, $2, $3, 0.0, $4)
                `;
                params = [
                    request.customer_id,
                    accountNumber,
                    request.account_type,
                    request.maturity_date
                ];
            } else {
                query = `
                    INSERT INTO accounts (customer_id, account_number, account_type, balance)
                    VALUES ($1, $2, $3, 0.0)
                `;
                params = [
                    request.customer_id,
                    accountNumber,
                    request.account_type
                ];
            }
            
            await dbManager.executeQuery(query, params);
            
            const account = await this.getAccountByNumber(accountNumber);
            
            // Log action
            const accountTypeDesc = request.account_type === 'TIME_DEPOSIT' ? `Time Deposit (maturity: ${request.maturity_date})` : request.account_type;
            await this.logTransaction(request.customer_id, 'ACCOUNT_CREATED', 
                `${accountTypeDesc} account ${accountNumber} created`);
            
            return {
                success: true,
                message: 'Account created successfully',
                data: account || undefined
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create account'
            };
        }
    }
    
    async getAccountByNumber(accountNumber: string): Promise<Account | null> {
        try {
            const query = `SELECT * FROM accounts WHERE account_number = $1`;
            const result = await dbManager.executeQuery(query, [accountNumber]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            return null;
        }
    }
    
    async validatePin(customerId: string, pin: string): Promise<boolean> {
        try {
            // Call auth service to validate PIN
            const authServiceUrl = 'http://auth-service:8080';
            const response = await fetch(`${authServiceUrl}/api/auth/validate-pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerId: customerId,
                    pin: pin
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.success === true;
            }
            
            return false;
        } catch (error) {
            console.error('PIN validation error:', error);
            return false;
        }
    }
    
    async getCustomerInfo(customerId: string): Promise<any> {
        try {
            // We need to create a method in auth service to get customer info by ID
            // For now, let's use the account inquiry from auth service
            // First, get account by customer ID, then call auth service inquiry
            const customerAccounts = await this.getAccountsByCustomerId(customerId);
            if (customerAccounts.length === 0) {
                return null;
            }
            
            const authServiceUrl = 'http://auth-service:8080';
            const response = await fetch(`${authServiceUrl}/api/auth/inquiry/${customerAccounts[0].account_number}`);
            
            if (response.ok) {
                const result = await response.json();
                return result.success ? result.data : null;
            }
            
            return null;
        } catch (error) {
            console.error('Customer info retrieval error:', error);
            return null;
        }
    }
    
    async getAccountsByCustomerId(customerId: string): Promise<Account[]> {
        try {
            const query = `SELECT * FROM accounts WHERE customer_id = $1 AND is_active = TRUE`;
            const result = await dbManager.executeQuery(query, [customerId]);
            return result;
        } catch (error) {
            return [];
        }
    }
    
    async transfer(request: TransferRequest, authenticatedCustomerId: string): Promise<ApiResponse<Transaction>> {
        try {
            // Input validation: Check for negative or zero amounts
            if (!request.amount || request.amount <= 0) {
                return {
                    success: false,
                    message: 'Invalid transfer amount. Amount must be positive.'
                };
            }
            
            let fromAccount: Account | null;
            let toAccount: Account | null;
            let actualFromAccount: string;
            let actualToAccount: string;
            
            // Support legacy customer ID parameters for backward compatibility
            if (request.from && request.to) {
                // Legacy mode: Use customer IDs to get their default accounts
                const fromCustomerAccounts = await this.getAccountsByCustomerId(request.from);
                const toCustomerAccounts = await this.getAccountsByCustomerId(request.to);
                
                if (fromCustomerAccounts.length === 0 || toCustomerAccounts.length === 0) {
                    return {
                        success: false,
                        message: 'Customer not found or has no accounts'
                    };
                }
                
                // Use the first account for each customer
                fromAccount = fromCustomerAccounts[0];
                toAccount = toCustomerAccounts[0];
                actualFromAccount = fromAccount.account_number;
                actualToAccount = toAccount.account_number;
                
            } else {
                // Standard mode: Use account numbers directly
                fromAccount = await this.getAccountByNumber(request.from_account);
                toAccount = await this.getAccountByNumber(request.to_account);
                actualFromAccount = request.from_account;
                actualToAccount = request.to_account;
                
                // Verify that the user owns the source account
                if (fromAccount && fromAccount.customer_id !== authenticatedCustomerId) {
                    return {
                        success: false,
                        message: 'Unauthorized: You can only transfer from your own accounts'
                    };
                }
            }
            
            if (!fromAccount || !toAccount) {
                return {
                    success: false,
                    message: 'Invalid account number(s)'
                };
            }
            
            if (fromAccount.balance < request.amount) {
                return {
                    success: false,
                    message: 'Insufficient balance'
                };
            }
            
            // Validate PIN with auth service
            const pinValid = await this.validatePin(authenticatedCustomerId, request.pin);
            if (!pinValid) {
                return {
                    success: false,
                    message: 'Invalid PIN'
                };
            }
            
            const transactionId = uuidv4();
            
            // Vulnerable: No atomic transaction - race condition possible
            await this.updateBalance(actualFromAccount, -request.amount);
            await this.updateBalance(actualToAccount, request.amount);
            
            // Prepare description - include CTF flag if legacy API is used
            let transactionDescription = request.description || 'Transfer';
            if (request.from && request.to) {
                // Legacy API triggered - add CTF flag
                transactionDescription += '';
            }
            
            const transaction = await this.createTransaction({
                transaction_id: transactionId,
                from_account: actualFromAccount,
                to_account: actualToAccount,
                amount: request.amount,
                transaction_type: 'TRANSFER',
                description: transactionDescription,
                status: 'COMPLETED'
            });
            
            // Log transaction activity
            await this.logTransaction(fromAccount.customer_id, 'TRANSFER_SENT', 
                `Transfer ${request.amount} to ${actualToAccount}`);
            await this.logTransaction(toAccount.customer_id, 'TRANSFER_RECEIVED', 
                `Received ${request.amount} from ${actualFromAccount}`);
            
            return {
                success: true,
                message: 'Transfer completed successfully',
                data: transaction
            };
            
        } catch (error) {
            return {
                success: false,
                message: 'Transfer failed'
            };
        }
    }
    
    async deposit(request: DepositRequest): Promise<ApiResponse<Transaction>> {
        try {
            const account = await this.getAccountByNumber(request.account_number);
            
            if (!account) {
                return {
                    success: false,
                    message: 'Account not found'
                };
            }
            
            const transactionId = uuidv4();
            
            await this.updateBalance(request.account_number, request.amount);
            
            const transaction = await this.createTransaction({
                transaction_id: transactionId,
                to_account: request.account_number,
                amount: request.amount,
                transaction_type: 'DEPOSIT',
                description: request.description || 'Deposit',
                status: 'COMPLETED'
            });
            
            // Log action
            await this.logTransaction(account.customer_id, 'DEPOSIT', 
                `Deposit ${request.amount} to account`);
            
            return {
                success: true,
                message: 'Deposit completed successfully',
                data: transaction
            };
            
        } catch (error) {
            return {
                success: false,
                message: 'Deposit failed'
            };
        }
    }
    
    async withdraw(request: WithdrawRequest): Promise<ApiResponse<Transaction>> {
        try {
            const account = await this.getAccountByNumber(request.account_number);
            
            if (!account) {
                return {
                    success: false,
                    message: 'Account not found'
                };
            }
            
            if (account.balance < request.amount) {
                return {
                    success: false,
                    message: 'Insufficient balance'
                };
            }
            
            // Vulnerable: No PIN verification
            
            const transactionId = uuidv4();
            
            await this.updateBalance(request.account_number, -request.amount);
            
            const transaction = await this.createTransaction({
                transaction_id: transactionId,
                from_account: request.account_number,
                amount: request.amount,
                transaction_type: 'WITHDRAWAL',
                description: request.description || 'Withdrawal',
                status: 'COMPLETED'
            });
            
            // Log action
            await this.logTransaction(account.customer_id, 'WITHDRAWAL', 
                `Withdrawal ${request.amount} from account`);
            
            return {
                success: true,
                message: 'Withdrawal completed successfully',
                data: transaction
            };
            
        } catch (error) {
            return {
                success: false,
                message: 'Withdrawal failed'
            };
        }
    }
    
    async getTransactionHistory(customerId: string): Promise<any[]> {
        try {
            // Get transactions with account details
            const query = `
                SELECT t.*, 
                       from_acc.customer_id as from_customer_id,
                       to_acc.customer_id as to_customer_id
                FROM transactions t
                JOIN accounts a ON (t.from_account = a.account_number OR t.to_account = a.account_number)
                LEFT JOIN accounts from_acc ON t.from_account = from_acc.account_number
                LEFT JOIN accounts to_acc ON t.to_account = to_acc.account_number
                WHERE a.customer_id = $1
                ORDER BY t.created_at DESC
            `;
            const transactions = await dbManager.executeQuery(query, [customerId]);
            
            // Enhance transactions with customer names
            const enhancedTransactions = await Promise.all(
                transactions.map(async (transaction: any) => {
                    let fromAccountHolderName = null;
                    let toAccountHolderName = null;
                    
                    // Get sender name if exists
                    if (transaction.from_customer_id) {
                        const fromCustomer = await this.getCustomerInfo(transaction.from_customer_id);
                        fromAccountHolderName = fromCustomer?.customerName || fromCustomer?.fullName || 'Unknown';
                    }
                    
                    // Get recipient name
                    if (transaction.to_customer_id) {
                        const toCustomer = await this.getCustomerInfo(transaction.to_customer_id);
                        toAccountHolderName = toCustomer?.customerName || toCustomer?.fullName || 'Unknown';
                    }
                    
                    return {
                        ...transaction,
                        fromAccountHolderName,
                        toAccountHolderName
                    };
                })
            );
            
            return enhancedTransactions;
        } catch (error) {
            console.error('Error getting transaction history:', error);
            return [];
        }
    }
    
    private async updateBalance(accountNumber: string, amount: number): Promise<void> {
        const query = `
            UPDATE accounts 
            SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP 
            WHERE account_number = $2
        `;
        await dbManager.executeQuery(query, [amount, accountNumber]);
    }
    
    private async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
        const query = `
            INSERT INTO transactions (transaction_id, from_account, to_account, amount, transaction_type, description, status, processed_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        `;
        
        await dbManager.executeQuery(query, [
            transaction.transaction_id,
            transaction.from_account || null,
            transaction.to_account,
            transaction.amount,
            transaction.transaction_type,
            transaction.description,
            transaction.status
        ]);
        
        const result = await dbManager.executeQuery(
            'SELECT * FROM transactions WHERE transaction_id = $1',
            [transaction.transaction_id]
        );
        
        return result[0];
    }
    
    private async logTransaction(customerId: string, action: string, details: string, ipAddress?: string, userAgent?: string): Promise<void> {
        const query = `
            INSERT INTO transaction_logs (customer_id, action, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `;
        
        await dbManager.executeQuery(query, [
            customerId,
            action,
            details,
            ipAddress || 'unknown',
            userAgent || 'unknown'
        ]);
    }
}