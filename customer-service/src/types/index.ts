export interface CustomerServiceAgent {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'AGENT' | 'SUPERVISOR' | 'ADMIN';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerServiceSession {
  id: number;
  agentId: string;
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CustomerServiceLog {
  id: number;
  agentId: string;
  action: string;
  customerAffected?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    agent: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: string;
    };
  };
}

export interface Customer {
  id: string;
  phoneNumber: string;
  ktpNumber: string;
  fullName: string;
  dateOfBirth: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: number;
  customerId: string;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CHECKING' | 'TIME_DEPOSIT';
  balance: number;
  maturityDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  transactionId: string;
  fromAccount?: string;
  toAccount?: string;
  amount: number;
  transactionType: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  description?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  processedAt?: string;
}

export interface CustomerWithAccounts extends Customer {
  accounts: Account[];
}

export interface JwtPayload {
  agentId: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}