import { apiService } from './api';
import { ApiResponse, Account, Transaction, TransferRequest } from '../types';

class TransactionService {
  async getAccounts(): Promise<ApiResponse<Account[]>> {
    return apiService.get<ApiResponse<Account[]>>('/api/transactions/accounts');
  }

  async getTransactionHistory(): Promise<ApiResponse<Transaction[]>> {
    return apiService.get<ApiResponse<Transaction[]>>('/api/transactions/history');
  }

  async transfer(request: TransferRequest): Promise<ApiResponse<Transaction>> {
    return apiService.post<ApiResponse<Transaction>>('/api/transactions/transfer', request);
  }

  async searchAccount(accountNumber: string): Promise<ApiResponse<any>> {
    return apiService.get<ApiResponse<any>>(`/api/transactions/search?accountNumber=${accountNumber}`);
  }

  async createAccount(request: { account_type: 'SAVINGS' | 'CHECKING' | 'TIME_DEPOSIT'; maturity_date?: string }): Promise<ApiResponse<Account>> {
    return apiService.post<ApiResponse<Account>>('/api/transactions/accounts', request);
  }
}

export const transactionService = new TransactionService();