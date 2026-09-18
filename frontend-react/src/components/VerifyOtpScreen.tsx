import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const VerifyOtpScreen: React.FC = () => {
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber || '';

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpString = otpCode.join('');
    if (otpString.length !== 4) {
      setError('Please enter a valid 4-digit OTP code');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authService.verifyOtp(phoneNumber, otpString);
      
      if (response.success) {
        setSuccess('Phone number verified successfully!');
        setTimeout(() => {
          navigate('/set-password', { state: { phoneNumber } });
        }, 2000);
      } else {
        setError('Invalid OTP code. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!phoneNumber) {
    return (
      <div className="container">
        <div className="alert alert-error">
          No phone number provided. Please register first.
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
        <h1>Verify Phone Number</h1>
        <p>Enter the OTP sent to {phoneNumber}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>OTP Code</label>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'center', 
            marginTop: '10px' 
          }}>
            {otpCode.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={1}
                disabled={isLoading}
                style={{
                  width: '50px',
                  height: '50px',
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || success.length > 0}
        >
          {isLoading ? <div className="spinner"></div> : 'Verify OTP'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/register" className="text-link">
            Back to Registration
          </Link>
        </div>
      </form>

      <div className="alert alert-info" style={{ marginTop: '20px' }}>
        <strong>Security Note:</strong> The OTP code was sent to your phone number. 
        If testing, check the network traffic or server response for the verification code.
      </div>
    </div>
  );
};

export default VerifyOtpScreen;