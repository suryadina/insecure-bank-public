import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../services/transactionService';

const CreateAccountScreen: React.FC = () => {
  const [accountType, setAccountType] = useState<'SAVINGS' | 'CHECKING' | 'TIME_DEPOSIT'>('SAVINGS');
  const [maturityDate, setMaturityDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const getMinimumDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (accountType === 'TIME_DEPOSIT' && !maturityDate) {
      setError('Please select a maturity date for time deposit');
      return;
    }

    if (accountType === 'TIME_DEPOSIT') {
      const selectedDate = new Date(maturityDate);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 30);
      
      if (selectedDate < minDate) {
        setError('Maturity date must be at least 30 days from today');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      const requestData: any = {
        account_type: accountType
      };
      
      if (accountType === 'TIME_DEPOSIT') {
        requestData.maturity_date = maturityDate;
      }

      const response = await transactionService.createAccount(requestData);

      if (response.success) {
        setSuccess('Account created successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(response.message || 'Failed to create account');
      }
    } catch (error) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container">
        <div className="alert alert-success" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h2>✓ Account Created Successfully!</h2>
          <p>{success}</p>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

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
        <h2 style={{ marginTop: '15px', color: 'white', fontSize: '20px' }}>Create New Account</h2>
        <p style={{ fontSize: '12px', color: '#bfdbfe', margin: '5px 0 0 0' }}>Add a new bank account to your profile</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="accountType">Account Type</label>
          <select
            id="accountType"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as 'SAVINGS' | 'CHECKING' | 'TIME_DEPOSIT')}
            disabled={isLoading}
          >
            <option value="SAVINGS">Savings Account</option>
            <option value="CHECKING">Checking Account</option>
            <option value="TIME_DEPOSIT">Time Deposit</option>
          </select>
        </div>

        {accountType === 'TIME_DEPOSIT' && (
          <div className="form-group">
            <label htmlFor="maturityDate">Maturity Date</label>
            <input
              id="maturityDate"
              type="date"
              value={maturityDate}
              onChange={(e) => setMaturityDate(e.target.value)}
              min={getMinimumDate()}
              disabled={isLoading}
              required
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Minimum 30 days from today. Transfer money to this account after creation.
            </small>
          </div>
        )}

        <div className="alert alert-info">
          <h4>Account Information:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li><strong>Savings Account:</strong> Earns interest, limited transactions</li>
            <li><strong>Checking Account:</strong> No interest, unlimited transactions</li>
            <li><strong>Time Deposit:</strong> High interest, locked until maturity, transfer funds after creation</li>
          </ul>
          <p><strong>Initial Balance:</strong> Rp 0,00</p>
          <p><strong>Account Number:</strong> Will be automatically generated</p>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
          style={{ width: '100%' }}
        >
          {isLoading ? <div className="spinner"></div> : 'Create Account'}
        </button>
      </form>

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

export default CreateAccountScreen;