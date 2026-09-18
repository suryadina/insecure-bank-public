import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { transactionService } from '../services/transactionService';
import { Account, Transaction } from '../types';

const DashboardScreen: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [accountsResponse, transactionsResponse] = await Promise.all([
        transactionService.getAccounts(),
        transactionService.getTransactionHistory()
      ]);

      if (accountsResponse.success) {
        setAccounts(accountsResponse.data || []);
      }

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data || []);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTransactionAmount = (transaction: Transaction): { amount: number; isPositive: boolean } => {
    const userAccountNumbers = accounts.map(acc => acc.account_number);
    const isIncoming = userAccountNumbers.includes(transaction.to_account);
    const isOutgoing = transaction.from_account && userAccountNumbers.includes(transaction.from_account);

    if (isIncoming && !isOutgoing) {
      return { amount: parseFloat(transaction.amount), isPositive: true };
    } else if (isOutgoing && !isIncoming) {
      return { amount: parseFloat(transaction.amount), isPositive: false };
    } else if (isIncoming && isOutgoing) {
      return { amount: parseFloat(transaction.amount), isPositive: true };
    }
    
    return { amount: parseFloat(transaction.amount), isPositive: false };
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="navbar">
        <div>
          <h1>🏦 Insecure Bank</h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#e0e0e0' }}>We trust our customers, like they trust us</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => navigate('/profile')}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #007bff', 
              backgroundColor: 'transparent', 
              color: '#007bff',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Profile
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">Welcome back, {user?.fullName}!</div>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Phone: {user?.phoneNumber}
        </p>
      </div>

      <div className="card">
        <div className="card-header">Your Accounts</div>
        {accounts.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            No accounts found
          </p>
        ) : (
          accounts.map((account) => (
            <div key={account.id} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '5px' }}>
                    {account.account_type === 'TIME_DEPOSIT' ? 'Time Deposit' : 
                     account.account_type === 'CHECKING' ? 'Checking Account' : 'Savings Account'}
                  </div>
                  <div className="account-number">{account.account_number}</div>
                  {account.account_type === 'TIME_DEPOSIT' && account.maturity_date && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Maturity: {formatDate(account.maturity_date)}
                    </div>
                  )}
                </div>
                <div className="balance">
                  {formatCurrency(parseFloat(account.balance))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={() => navigate('/account-inquiry')}
        >
          Transfer Money
        </button>
        <button
          className="btn btn-success"
          style={{ flex: 1 }}
          onClick={() => navigate('/create-account')}
        >
          Create Account
        </button>
      </div>

      <div className="card">
        <div className="card-header">Recent Transactions</div>
        {transactions.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            No transactions found
          </p>
        ) : (
          transactions.slice(0, 10).map((transaction) => {
            const { amount, isPositive } = getTransactionAmount(transaction);
            return (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                    {(() => {
                      const userAccountNumbers = accounts.map(acc => acc.account_number);
                      const isIncoming = userAccountNumbers.includes(transaction.to_account);
                      const isOutgoing = transaction.from_account && userAccountNumbers.includes(transaction.from_account);
                      
                      if (transaction.transaction_type === 'TRANSFER') {
                        if (isIncoming && !isOutgoing) {
                          return `From: ${transaction.from_account || 'Unknown'}`;
                        } else if (isOutgoing && !isIncoming) {
                          return `To: ${transaction.to_account}`;
                        } else if (isIncoming && isOutgoing) {
                          return `${transaction.from_account} → ${transaction.to_account}`;
                        }
                      }
                      return transaction.transaction_type;
                    })()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {formatDate(transaction.created_at)}
                  </div>
                  {(() => {
                    const userAccountNumbers = accounts.map(acc => acc.account_number);
                    const isIncoming = userAccountNumbers.includes(transaction.to_account);
                    const isOutgoing = transaction.from_account && userAccountNumbers.includes(transaction.from_account);
                    
                    let nameDisplay = '';
                    if (transaction.transaction_type === 'TRANSFER') {
                      if (isIncoming && !isOutgoing) {
                        nameDisplay = `${transaction.fromAccountHolderName || 'Unknown'}`;
                      } else if (isOutgoing && !isIncoming) {
                        nameDisplay = `${transaction.toAccountHolderName || 'Unknown'}`;
                      } else if (isIncoming && isOutgoing) {
                        nameDisplay = 'Internal Transfer';
                      }
                    } else if (transaction.transaction_type === 'DEPOSIT') {
                      nameDisplay = 'Bank Deposit';
                    } else if (transaction.transaction_type === 'WITHDRAWAL') {
                      nameDisplay = 'Cash Withdrawal';
                    }
                    
                    return nameDisplay && (
                      <div style={{ fontSize: '12px', color: '#007bff', fontWeight: '500' }}>
                        {nameDisplay}
                      </div>
                    );
                  })()}
                  {transaction.description && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {transaction.description}
                    </div>
                  )}
                </div>
                <div className={`transaction-amount ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? '+' : '-'}{formatCurrency(amount)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Security Guarantee Footer */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
        borderRadius: '10px',
        border: '1px solid #dee2e6',
        textAlign: 'center'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '8px' 
        }}>
          <span style={{ 
            background: 'linear-gradient(135deg, #28a745, #20c997)', 
            color: 'white', 
            padding: '6px 12px', 
            borderRadius: '12px', 
            fontSize: '14px', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🔒 Security Guaranteed
          </span>
        </div>
        <p style={{ 
          fontSize: '12px', 
          color: '#6c757d', 
          margin: '0', 
          lineHeight: '1.4' 
        }}>
          Your Security, Guaranteed. Military-grade encryption protects your data.<br/>
          Unauthorized access is illegal and will be prosecuted.
        </p>
      </div>
    </div>
  );
};

export default DashboardScreen;