import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import { AuthenticatedRequest } from '../middleware/auth';
import { CreateAccountRequest, TransferRequest, DepositRequest, WithdrawRequest } from '../types';

export class TransactionController {
    private transactionService: TransactionService;

    constructor() {
        this.transactionService = new TransactionService();
    }

    createAccount = async (req: AuthenticatedRequest, res: Response) => {
        try {
            // Sanitize input: trim whitespace from string fields
            const request: CreateAccountRequest = {
                customer_id: req.user!.customerId,
                account_type: req.body.account_type?.trim(),
                maturity_date: req.body.maturity_date?.trim()
            };

            const result = await this.transactionService.createAccount(request);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error
            });
        }
    };

    getAccounts = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const customerId = req.user!.customerId;
            const accounts = await this.transactionService.getAccountsByCustomerId(customerId);
            
            res.json({
                success: true,
                message: 'Accounts retrieved successfully',
                data: accounts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve accounts',
                error: error
            });
        }
    };

    transfer = async (req: AuthenticatedRequest, res: Response) => {
        try {
            // Sanitize input: trim whitespace from all string fields
            const request: TransferRequest = {
                ...req.body,
                from_account: req.body.from_account?.trim(),
                to_account: req.body.to_account?.trim(),
                description: req.body.description?.trim(),
                pin: req.body.pin?.trim(),
                from: req.body.from?.trim(), // Legacy API field
                to: req.body.to?.trim()      // Legacy API field
            };
            
            const authenticatedCustomerId = req.user!.customerId;
            
            const result = await this.transactionService.transfer(request, authenticatedCustomerId);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Transfer failed',
                error: error
            });
        }
    };

    deposit = async (req: Request, res: Response) => {
        try {
            // Sanitize input: trim whitespace from string fields
            const request: DepositRequest = {
                ...req.body,
                account_number: req.body.account_number?.trim(),
                description: req.body.description?.trim()
            };
            
            const result = await this.transactionService.deposit(request);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Deposit failed',
                error: error
            });
        }
    };

    withdraw = async (req: AuthenticatedRequest, res: Response) => {
        try {
            // Sanitize input: trim whitespace from string fields
            const request: WithdrawRequest = {
                ...req.body,
                account_number: req.body.account_number?.trim(),
                description: req.body.description?.trim(),
                pin: req.body.pin?.trim()
            };
            
            const result = await this.transactionService.withdraw(request);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Withdrawal failed',
                error: error
            });
        }
    };

    getTransactionHistory = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const customerId = req.user!.customerId;
            const transactions = await this.transactionService.getTransactionHistory(customerId);
            
            res.json({
                success: true,
                message: 'Transaction history retrieved successfully',
                data: transactions
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve transaction history',
                error: error
            });
        }
    };

    // Account inquiry for transfer validation
    accountInquiry = async (req: Request, res: Response) => {
        try {
            const { accountNumber } = req.params;
            
            if (!accountNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Account number is required'
                });
            }

            const account = await this.transactionService.getAccountByNumber(accountNumber);
            
            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found'
                });
            }
            
            // Return only safe information for inquiry
            res.json({
                success: true,
                message: 'Account found',
                data: {
                    customerId: account.customer_id,
                    accountNumber: account.account_number,
                    accountType: account.account_type,
                    isActive: account.is_active
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Account inquiry failed',
                error: error
            });
        }
    };

    // Get accounts by customer ID (for service-to-service calls)
    getAccountsByCustomerId = async (req: Request, res: Response) => {
        try {
            const { customerId } = req.params;
            
            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Customer ID is required'
                });
            }

            const accounts = await this.transactionService.getAccountsByCustomerId(customerId);
            
            res.json({
                success: true,
                message: 'Accounts retrieved successfully',
                data: accounts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve accounts',
                error: error
            });
        }
    };

    // Vulnerable: Search by account number with SQL injection
    searchAccount = async (req: Request, res: Response) => {
        try {
            const { account_number } = req.query;
            
            if (!account_number) {
                return res.status(400).json({
                    success: false,
                    message: 'Account number is required'
                });
            }

            const account = await this.transactionService.getAccountByNumber(account_number as string);
            
            res.json({
                success: true,
                message: 'Account search completed',
                data: account
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Search failed',
                error: error
            });
        }
    };
}