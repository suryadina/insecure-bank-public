export interface User {
  customerId: string;
  phoneNumber: string;
  fullName: string;
  ktpNumber: string;
  dateOfBirth: string;
  isVerified: boolean;
}

export interface Account {
  id: string;
  customer_id: string;
  account_number: string;
  account_type: 'SAVINGS' | 'CHECKING' | 'TIME_DEPOSIT';
  balance: string;
  maturity_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  transaction_id: string;
  from_account?: string;
  to_account: string;
  amount: string;
  transaction_type: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  description?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  processed_at?: string;
  fromAccountHolderName?: string;
  toAccountHolderName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
  deviceId: string;
  deviceName: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  ktpNumber: string;
  fullName: string;
  dateOfBirth: string;
  selfiePath?: string;
}

export interface TransferRequest {
  from_account: string;
  to_account: string;
  amount: number;
  pin: string;
  description?: string;
  from?: string | null;
  to?: string | null;
}

export interface SetPinRequest {
  phoneNumber: string;
  pin: string;
}

export interface ValidatePinRequest {
  customerId: string;
  pin: string;
}

export interface AccountInquiryRequest {
  accountNumber: string;
}