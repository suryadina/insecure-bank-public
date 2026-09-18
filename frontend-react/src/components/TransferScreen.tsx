import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { transactionService } from '../services/transactionService';
import { authService } from '../services/authService';
import { Account } from '../types';

const TransferScreen: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: ''
  });
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = PIN entry
  const [recipientInfo, setRecipientInfo] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadAccounts();
    
    // Check if there's prefilled account data from navigation state
    const state = location.state as { prefilledToAccount?: string };
    if (state?.prefilledToAccount) {
      setFormData(prev => ({
        ...prev,
        toAccount: state.prefilledToAccount || ''
      }));
    }
  }, [location.state]);

  const loadAccounts = async () => {
    try {
      const response = await transactionService.getAccounts();
      if (response.success) {
        setAccounts(response.data || []);
      }
    } catch (error) {
      setError('Failed to load accounts');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`transfer-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && index > 0 && !pin[index]) {
      const prevInput = document.getElementById(`transfer-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const validateForm = () => {
    if (!formData.fromAccount) return 'Please select source account';
    if (!formData.toAccount) return 'Please enter recipient account number';
    if (!formData.amount || parseFloat(formData.amount) <= 0) return 'Please enter a valid amount';
    if (formData.fromAccount === formData.toAccount) return 'Cannot transfer to the same account';
    
    const sourceAccount = accounts.find(acc => acc.account_number === formData.fromAccount);
    if (sourceAccount && parseFloat(formData.amount) > parseFloat(sourceAccount.balance)) {
      return 'Insufficient balance';
    }
    
    return null;
  };

  const handleContinue = async () => {
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Search for recipient account using auth service
    try {
      const response = await authService.accountInquiry(formData.toAccount);
      if (response.success && response.data) {
        setRecipientInfo(response.data);
        setStep(2);
      } else {
        setError('Recipient account not found');
      }
    } catch (error) {
      setError('Failed to verify recipient account');
    }
  };

  const handleTransfer = async () => {
    setError('');
    
    const pinString = pin.join('');
    if (pinString.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    setIsLoading(true);
    
    try {
      const transferData = {
        from_account: formData.fromAccount,
        to_account: formData.toAccount,
        amount: parseFloat(formData.amount),
        pin: pinString,
        description: formData.description,
        from: null,
        to: null
      };
      const response = await transactionService.transfer(transferData);

      if (response.success) {
        setSuccess('Transfer completed successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(response.message || 'Transfer failed');
      }
    } catch (error) {
      setError('Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setPin(['', '', '', '']);
      setError('');
    } else {
      navigate('/dashboard');
    }
  };

  const selectedAccount = accounts.find(acc => acc.account_number === formData.fromAccount);

  if (success) {
    return (
      <div className="container">
        <div className="alert alert-success" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h2>✓ Transfer Successful!</h2>
          <p>{success}</p>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <button className="back-button" onClick={handleBack}>
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
        <h2 style={{ marginTop: '15px', color: 'white', fontSize: '20px' }}>Transfer Money</h2>
        <p style={{ fontSize: '12px', color: '#bfdbfe', margin: '5px 0 0 0' }}>{step === 1 ? 'Enter transfer details' : 'Confirm your PIN'}</p>
      </div>

      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : 'inactive'}`}>1</div>
        <div className={`step ${step >= 2 ? 'active' : 'inactive'}`}>2</div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {step === 1 ? (
        <div className="form">
          <div className="form-group">
            <label htmlFor="fromAccount">From Account</label>
            <select
              id="fromAccount"
              name="fromAccount"
              value={formData.fromAccount}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="">Select account</option>
              {accounts.filter(account => account.account_type !== 'TIME_DEPOSIT').map((account) => (
                <option key={account.id} value={account.account_number}>
                  {account.account_type} - {account.account_number} 
                  ({formatCurrency(parseFloat(account.balance))})
                </option>
              ))}
              {accounts.filter(account => account.account_type === 'TIME_DEPOSIT').length > 0 && (
                <optgroup label="Time Deposits (Locked - Cannot Transfer)">
                  {accounts.filter(account => account.account_type === 'TIME_DEPOSIT').map((account) => (
                    <option key={account.id} value={account.account_number} disabled>
                      Time Deposit - {account.account_number} 
                      ({formatCurrency(parseFloat(account.balance))})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="toAccount">To Account Number</label>
            <input
              id="toAccount"
              name="toAccount"
              type="text"
              value={formData.toAccount}
              onChange={handleInputChange}
              placeholder="Enter recipient account number"
              disabled={isLoading}
            />
            {location.state?.prefilledToAccount && (
              <small style={{ color: '#28a745', fontSize: '12px' }}>
                ✓ Account number prefilled from account inquiry
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (IDR)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0"
              min="1"
              disabled={isLoading}
            />
            {selectedAccount && (
              <small style={{ color: '#666', fontSize: '12px' }}>
                Available: {formatCurrency(parseFloat(selectedAccount.balance))}
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter transfer description"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleContinue}
            disabled={isLoading}
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="form">
          <div className="card">
            <div className="card-header">Transfer Summary</div>
            <div style={{ marginBottom: '10px' }}>
              <strong>From:</strong> {formData.fromAccount}
              {selectedAccount && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {selectedAccount.account_type} ({formatCurrency(parseFloat(selectedAccount.balance))})
                </div>
              )}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>To:</strong> {formData.toAccount}
              {recipientInfo && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {recipientInfo.accountHolderName || recipientInfo.fullName || recipientInfo.customerName || recipientInfo.name || 'Account Holder'}
                </div>
              )}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Amount:</strong> {formatCurrency(parseFloat(formData.amount))}
            </div>
            {formData.description && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Description:</strong> {formData.description}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Enter your PIN</label>
            <div className="pin-input">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`transfer-pin-${index}`}
                  type="password"
                  className="pin-digit"
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  maxLength={1}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleTransfer}
              disabled={isLoading || pin.join('').length !== 4}
            >
              {isLoading ? <div className="spinner"></div> : 'Confirm Transfer'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </button>
          </div>
        </div>
      )}

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

export default TransferScreen;