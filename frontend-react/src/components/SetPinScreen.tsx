import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const SetPinScreen: React.FC = () => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = enter PIN, 2 = confirm PIN
  
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber || '';

  const handlePinChange = (index: number, value: string, isConfirm: boolean = false) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = isConfirm ? [...confirmPin] : [...pin];
    newPin[index] = value;
    
    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(
        `${isConfirm ? 'confirm-' : ''}pin-${index + 1}`
      );
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, isConfirm: boolean = false) => {
    if (e.key === 'Backspace' && index > 0 && !(isConfirm ? confirmPin[index] : pin[index])) {
      const prevInput = document.getElementById(
        `${isConfirm ? 'confirm-' : ''}pin-${index - 1}`
      );
      prevInput?.focus();
    }
  };

  const handleContinue = () => {
    const pinString = pin.join('');
    if (pinString.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    const pinString = pin.join('');
    const confirmPinString = confirmPin.join('');

    if (confirmPinString.length !== 4) {
      setError('Please confirm your 4-digit PIN');
      return;
    }

    if (pinString !== confirmPinString) {
      setError('PINs do not match. Please try again.');
      setStep(1);
      setPin(['', '', '', '']);
      setConfirmPin(['', '', '', '']);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await authService.setPin({
        phoneNumber,
        pin: pinString
      });
      
      if (response.success) {
        setSuccess('PIN set successfully! You can now log in.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.message || 'Failed to set PIN. Please try again.');
      }
    } catch (error) {
      setError('Failed to set PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setConfirmPin(['', '', '', '']);
      setError('');
    }
  };

  if (!phoneNumber) {
    return (
      <div className="container">
        <div className="alert alert-error">
          No phone number provided. Please complete the registration process first.
        </div>
        <Link to="/register" className="btn btn-primary">
          Go to Registration
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Set Transaction PIN</h1>
        <p>{step === 1 ? 'Choose a 4-digit PIN' : 'Confirm your PIN'}</p>
      </div>

      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : 'inactive'}`}>1</div>
        <div className={`step ${step >= 2 ? 'active' : 'inactive'}`}>2</div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form">
        <div className="form-group">
          <label>{step === 1 ? 'Enter PIN' : 'Confirm PIN'}</label>
          <div className="pin-input">
            {(step === 1 ? pin : confirmPin).map((digit, index) => (
              <input
                key={index}
                id={`${step === 2 ? 'confirm-' : ''}pin-${index}`}
                type="password"
                className="pin-digit"
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value, step === 2)}
                onKeyDown={(e) => handleKeyDown(e, index, step === 2)}
                maxLength={1}
                disabled={isLoading || success.length > 0}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {step === 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleContinue}
              disabled={pin.join('').length !== 4}
            >
              Continue
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isLoading || confirmPin.join('').length !== 4 || success.length > 0}
              >
                {isLoading ? <div className="spinner"></div> : 'Set PIN'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
                disabled={isLoading || success.length > 0}
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>

      <div className="alert alert-info" style={{ marginTop: '20px' }}>
        <strong>Important:</strong> Remember your PIN. You'll need it for all transactions.
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/set-password" state={{ phoneNumber }} className="text-link">
          Back to Set Password
        </Link>
      </div>
    </div>
  );
};

export default SetPinScreen;