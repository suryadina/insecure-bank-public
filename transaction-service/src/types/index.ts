export interface Account {
    id: number;
    customer_id: string;
    account_number: string;
    account_type: 'SAVINGS' | 'CHECKING' | 'TIME_DEPOSIT';
    balance: number;
    maturity_date?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: number;
    transaction_id: string;
    from_account?: string;
    to_account: string;
    amount: number;
    transaction_type: string;
    description?: string;
    status: string;
    created_at: string;
    processed_at?: string;
}

export interface TransactionLog {
    id: number;
    customer_id: string;
    action: string;
    details: string;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface CreateAccountRequest {
    customer_id: string;
    account_type: 'SAVINGS' | 'CHECKING' | 'TIME_DEPOSIT';
    maturity_date?: string;
}

export interface TransferRequest {
    from_account: string;
    to_account: string;
    amount: number;
    description?: string;
    pin: string;
    // Vulnerable backward compatibility parameters
    from?: string;  // customer_id of sender (backward compatibility)
    to?: string;    // customer_id of recipient (backward compatibility)
}

export interface DepositRequest {
    account_number: string;
    amount: number;
    description?: string;
}

export interface WithdrawRequest {
    account_number: string;
    amount: number;
    description?: string;
    pin: string;
}

export interface JwtPayload {
    customerId: string;
    deviceId: string;
    iat: number;
    exp: number;
}