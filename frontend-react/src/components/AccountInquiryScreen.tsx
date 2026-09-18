import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { normalizePhoneNumber, getPhoneNumberPlaceholder } from '../utils/phoneUtils';

const AccountInquiryScreen: React.FC = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAccountInfo(null);

    if (!accountNumber) {
      setError('Please enter an account number or phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if input looks like a phone number and normalize it
      let searchTerm = accountNumber;
      
      // If it contains digits only or starts with +, 08, or 62, try to normalize as phone number
      if (/^[\d\+\s\-\(\)\.]+$/.test(accountNumber.trim())) {
        const normalized = normalizePhoneNumber(accountNumber);
        if (normalized) {
          searchTerm = normalized;
        }
      }
      
      const response = await authService.accountInquiry(searchTerm);
      
      if (response.success && response.data) {
        console.log('Account inquiry response:', response.data);
        setAccountInfo(response.data);
      } else {
        setError('Account not found or inquiry failed');
      }
    } catch (error) {
      setError('Failed to perform account inquiry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setAccountNumber('');
    setAccountInfo(null);
    setError('');
  };

  return (
    <div className="container">
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ← Back
      </button>

      <div className="header" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        padding: '25px 20px',
        borderRadius: '15px',
        marginBottom: '25px',
        boxShadow: '0 8px 25px rgba(30, 58, 138, 0.3)'
      }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: '0' }}>🏦 Insecure Bank</h1>
        <p style={{ color: '#e0f2fe', fontSize: '14px', margin: '5px 0 15px 0' }}>We trust our customers, like they trust us</p>
        <h2 style={{ marginTop: '15px', color: 'white', fontSize: '20px' }}>Account Inquiry</h2>
        <p style={{ fontSize: '12px', color: '#bfdbfe', margin: '5px 0 0 0' }}>Check account details and balance</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="accountNumber">Account Number or Phone Number</label>
          <input
            id="accountNumber"
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder={`Enter account number (e.g., ACC1001234567891) or phone number (e.g., ${getPhoneNumberPlaceholder()})`}
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !accountNumber}
            style={{ flex: 1 }}
          >
            {isLoading ? <div className="spinner"></div> : 'Search'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </button>
        </div>
      </form>

      {accountInfo && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">Account Information</div>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '500' }}>Account Number:</span>
              <span className="account-number">{accountInfo.accountNumber}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '500' }}>Account Holder:</span>
              <span>{accountInfo.accountHolderName || accountInfo.fullName || accountInfo.customerName || accountInfo.name || 'N/A'}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '500' }}>Account Type:</span>
              <span>{accountInfo.accountType}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '500' }}>Status:</span>
              <span style={{ color: accountInfo.isActive ? '#28a745' : '#dc3545' }}>
                {accountInfo.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {accountInfo.balance !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '500' }}>Balance:</span>
                <span className="balance">{formatCurrency(accountInfo.balance)}</span>
              </div>
            )}
            
            {accountInfo.phoneNumber && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '500' }}>Phone Number:</span>
                <span>{accountInfo.phoneNumber}</span>
              </div>
            )}
            
            {accountInfo.ktpNumber && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '500' }}>KTP Number:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{accountInfo.ktpNumber}</span>
              </div>
            )}
            
            {accountInfo.dateOfBirth && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '500' }}>Date of Birth:</span>
                <span>{accountInfo.dateOfBirth}</span>
              </div>
            )}
            
            {accountInfo.isVerified !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '500' }}>Account Verified:</span>
                <span style={{ color: accountInfo.isVerified ? '#28a745' : '#dc3545' }}>
                  {accountInfo.isVerified ? 'Yes' : 'No'}
                </span>
              </div>
            )}
            
            {accountInfo.createdAt && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '500' }}>Account Created:</span>
                <span style={{ fontSize: '12px' }}>{new Date(accountInfo.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/transfer', { 
              state: { prefilledToAccount: accountInfo.accountNumber } 
            })}
            style={{ width: '100%' }}
          >
            Transfer to This Account
          </button>
        </div>
      )}

      <div className="alert alert-info" style={{ marginTop: '20px' }}>
        <strong>Note:</strong> You can search for any account number or phone number to view basic account information.
        This feature helps you verify recipient details before making transfers.
        <br/><br/>
        <strong>Examples:</strong>
        <br/>• Account Number: ACC1001234567891
        <br/>• Phone Number: {getPhoneNumberPlaceholder()}
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

export default AccountInquiryScreen;