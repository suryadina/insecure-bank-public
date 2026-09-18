import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Make sure we can use CSS classes

interface Agent {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

interface Customer {
  id: string;
  phoneNumber: string;
  ktpNumber: string;
  fullName: string;
  dateOfBirth: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomerWithAccounts extends Customer {
  accounts: Array<{
    id: number;
    customerId: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    maturityDate?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface Transaction {
  id: number;
  transactionId: string;
  fromAccount?: string;
  toAccount?: string;
  amount: number;
  transactionType: string;
  description?: string;
  status: string;
  createdAt: string;
  processedAt?: string;
}

interface AuditLog {
  id: number;
  agent_id: string;
  username: string;
  full_name: string;
  action: string;
  customer_affected?: string;
  details: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

const CustomerServiceDashboard: React.FC = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithAccounts | null>(null);
  const [customerTransactions, setCustomerTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'customer-details' | 'audit'>('customers');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('csAuthToken');
    
    if (!token) {
      navigate('/cu5st0m3r-z3rv!c3sss');
      return;
    }

    initializeDashboard(token);
  }, [navigate]);

  const initializeDashboard = async (token: string) => {
    try {
      await checkUserRole(token);
      
      const userRole = localStorage.getItem('csUserRole');
      setAgent({
        id: 'service-user',
        username: 'service-user',
        email: 'service@bank.com',
        fullName: 'Customer Service User',
        role: userRole || 'CUSTOMER'
      });
      
      // Load customers
      loadCustomers();
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
      setError('Failed to initialize dashboard');
    }
  };

  const checkUserRole = async (token: string) => {
    try {
      const loginSession = localStorage.getItem('csLoginSession');
      
      const response = await fetch(`${window.location.origin}/api/cs/auth/role`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(loginSession && { 'X-Login-Session': loginSession }),
        },
      });

      if (response.ok) {
        const roleData = await response.json();
        
        localStorage.setItem('csUserRole', roleData.role);
        
        if (roleData.flag) {
          console.log('🚩 Flag:', roleData.flag);
          console.log('💬 Message:', roleData.message);
          
          setError(`🚩 ${roleData.flag} - ${roleData.message}`);
          setTimeout(() => setError(''), 5000);
        }
      }
    } catch (error) {
      console.error('Failed to check user role:', error);
    }
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('csAuthToken');
    
    const response = await fetch(`${window.location.origin}/api/cs${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('csAuthToken');
      localStorage.removeItem('csUserRole');
      navigate('/cu5st0m3r-z3rv!c3sss');
      return null;
    }

    return response.json();
  };

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const result = await apiCall('/dashboard/customers');
      
      if (result?.success) {
        setCustomers(result.data);
      } else {
        setError('Failed to load customers');
      }
    } catch (error) {
      setError('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const searchCustomers = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      loadCustomers();
      return;
    }

    try {
      setIsLoading(true);
      const result = await apiCall(`/dashboard/customers/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (result?.success) {
        setCustomers(result.data);
      } else {
        setError('Search failed');
      }
    } catch (error) {
      setError('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: string) => {
    try {
      setIsLoading(true);
      const result = await apiCall(`/dashboard/customers?customer=${customerId}`);
      
      if (result?.success) {
        setSelectedCustomer(result.data);
        setActiveTab('customer-details');
        
        // Load customer transactions
        const transactionsResult = await apiCall(`/dashboard/customers/${customerId}/transactions`);
        if (transactionsResult?.success) {
          setCustomerTransactions(transactionsResult.data);
        }
      } else {
        setError('Failed to load customer details');
      }
    } catch (error) {
      setError('Failed to load customer details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      const result = await apiCall('/dashboard/audit/logs');
      
      if (result?.success) {
        setAuditLogs(result.data);
        setActiveTab('audit');
      } else {
        setError('Failed to load audit logs');
      }
    } catch (error) {
      setError('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('csAuthToken');
    localStorage.removeItem('csUserRole');
    navigate('/cu5st0m3r-z3rv!c3sss');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!agent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="cs-container">
      <div className="cs-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1>🏢 Customer Service Dashboard</h1>
            <p>Welcome, {agent.fullName} • Role: {agent.role}</p>
          </div>
          <button
            className="cs-btn-danger"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {error && <div className="cs-alert-error">{error}</div>}

      <div className="cs-tab-nav">
        <button
          className={activeTab === 'customers' ? 'active' : ''}
          onClick={() => {
            setActiveTab('customers');
            setSelectedCustomer(null);
            setError('');
          }}
        >
          👥 All Customers
        </button>
        {(() => {
          const userRole = localStorage.getItem('csUserRole');
          return userRole === 'ADMIN' && (
            <button
              className={activeTab === 'audit' ? 'active' : ''}
              onClick={loadAuditLogs}
            >
              📋 Audit Logs
            </button>
          );
        })()}
      </div>

      {activeTab === 'customers' && (
        <div>
          <div className="cs-search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search by name, phone, or KTP number..."
              onKeyPress={(e) => e.key === 'Enter' && searchCustomers()}
            />
            <button className="cs-btn-primary" onClick={searchCustomers}>
              🔍 Search
            </button>
            <button className="cs-btn-secondary" onClick={() => {
              setSearchQuery('');
              loadCustomers();
            }}>
              🔄 Clear
            </button>
          </div>

          {isLoading ? (
            <div className="cs-card">
              <div className="cs-card-body" style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                <h3>Loading customers...</h3>
                <p style={{ color: '#6c757d' }}>Please wait while we fetch the customer data</p>
              </div>
            </div>
          ) : (
            <div className="cs-card">
              <div className="cs-card-header">
                👥 Customers Database ({customers.length} records)
              </div>
              <div className="cs-data-grid">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="cs-customer-item"
                    onClick={() => loadCustomerDetails(customer.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <div style={{ fontWeight: '700', fontSize: '18px', color: '#212529' }}>
                            {customer.fullName}
                          </div>
                          {customer.isVerified && (
                            <span className="cs-badge cs-badge-success">✓ Verified</span>
                          )}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>
                          📱 {customer.phoneNumber} • 🆔 {customer.ktpNumber}
                        </div>
                        <div style={{ fontSize: '12px', color: '#adb5bd' }}>
                          📅 Joined: {formatDate(customer.createdAt)}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#dc3545', fontWeight: '600' }}>
                        View Details →
                      </div>
                    </div>
                  </div>
                ))}
                {customers.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#6c757d' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
                    <h3>No customers found</h3>
                    <p>Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'customer-details' && selectedCustomer && (
        <div>
          <button
            className="cs-btn-secondary"
            onClick={() => setActiveTab('customers')}
            style={{ marginBottom: '25px' }}
          >
            ← Back to Customers
          </button>

          <div className="cs-card">
            <div className="cs-card-header">
              👤 Customer Profile: {selectedCustomer.fullName}
            </div>
            <div className="cs-card-body">
              <div className="cs-grid cs-grid-2" style={{ marginBottom: '30px' }}>
                <div>
                  <h3 style={{ color: '#dc3545', marginBottom: '20px', fontSize: '20px' }}>📋 Personal Information</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>Full Name:</strong> <span>{selectedCustomer.fullName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>Phone:</strong> <span>{selectedCustomer.phoneNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>KTP Number:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedCustomer.ktpNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>Date of Birth:</strong> <span>{new Date(selectedCustomer.dateOfBirth).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>Status:</strong> 
                      <span className={selectedCustomer.isVerified ? 'cs-badge cs-badge-success' : 'cs-badge cs-badge-warning'}>
                        {selectedCustomer.isVerified ? '✓ Verified' : '⚠ Not Verified'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>Joined:</strong> <span>{formatDate(selectedCustomer.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 style={{ color: '#dc3545', marginBottom: '20px', fontSize: '20px' }}>💰 Account Summary</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #dc3545, #c82333)', color: 'white', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{selectedCustomer.accounts.length}</div>
                      <div style={{ opacity: '0.9' }}>Total Accounts</div>
                    </div>
                    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #28a745, #20c997)', color: 'white', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700' }}>{formatCurrency(selectedCustomer.accounts.reduce((sum, acc) => sum + acc.balance, 0))}</div>
                      <div style={{ opacity: '0.9' }}>Total Balance</div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 style={{ color: '#dc3545', marginBottom: '20px', fontSize: '20px' }}>🏦 Account Portfolio</h3>
              <div className="cs-grid" style={{ gap: '15px', marginBottom: '30px' }}>
                {selectedCustomer.accounts.map((account) => (
                  <div key={account.id} style={{ 
                    background: 'white', 
                    border: '1px solid #e9ecef', 
                    padding: '20px', 
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: '#212529', marginBottom: '8px' }}>
                          💳 {account.accountNumber}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span className="cs-badge cs-badge-success">
                            {account.accountType}
                          </span>
                          <span className={account.isActive ? 'cs-badge cs-badge-success' : 'cs-badge cs-badge-warning'}>
                            {account.isActive ? '🟢 Active' : '🟡 Inactive'}
                          </span>
                          {account.maturityDate && (
                            <span className="cs-badge" style={{ background: '#fff3cd', color: '#856404' }}>
                              📅 Maturity: {new Date(account.maturityDate).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', fontSize: '20px', color: '#28a745' }}>
                          {formatCurrency(account.balance)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ color: '#dc3545', marginBottom: '20px', fontSize: '20px' }}>💸 Transaction History</h3>
              <div className="cs-data-grid">
                {customerTransactions.map((transaction) => (
                  <div key={transaction.id} style={{ 
                    padding: '20px', 
                    borderBottom: '1px solid #e9ecef',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <div style={{ fontWeight: '700', fontSize: '16px', color: '#212529' }}>
                            {transaction.transactionType}
                          </div>
                          <span className={`cs-badge ${
                            transaction.status === 'COMPLETED' ? 'cs-badge-success' : 
                            transaction.status === 'PENDING' ? 'cs-badge-warning' : 'cs-badge'
                          }`} style={{ 
                            background: transaction.status === 'FAILED' ? '#f8d7da' : undefined,
                            color: transaction.status === 'FAILED' ? '#721c24' : undefined
                          }}>
                            {transaction.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>
                          🆔 {transaction.transactionId}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>
                          {transaction.fromAccount && `📤 From: ${transaction.fromAccount}`}
                          {transaction.fromAccount && transaction.toAccount && ' → '}
                          {transaction.toAccount && `📥 To: ${transaction.toAccount}`}
                        </div>
                        {transaction.description && (
                          <div style={{ fontSize: '12px', color: '#adb5bd', marginBottom: '4px' }}>
                            📝 {transaction.description}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: '#adb5bd' }}>
                          🕒 {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', fontSize: '18px', color: '#dc3545' }}>
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div>
          <div className="cs-card">
            <div className="cs-card-header">
              📋 Security Audit Trail ({auditLogs.length} events)
            </div>
            <div className="cs-data-grid">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '20px',
                    borderBottom: '1px solid #e9ecef'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: '#dc3545' }}>
                          🔍 {log.action}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>
                        👤 <strong>Agent:</strong> {log.full_name} ({log.username})
                      </div>
                      <div style={{ fontSize: '14px', color: '#212529', marginBottom: '8px', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
                        📝 {log.details}
                      </div>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', color: '#adb5bd' }}>
                        {log.customer_affected && (
                          <span>
                            🎯 <strong>Customer:</strong> {log.customer_affected}
                          </span>
                        )}
                        {log.ip_address && (
                          <span>
                            🌐 <strong>IP:</strong> {log.ip_address}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', textAlign: 'right', minWidth: '120px' }}>
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerServiceDashboard;