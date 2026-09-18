import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const SetPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authService.setPassword(phoneNumber, password);
      
      if (response.success) {
        setSuccess('Password set successfully!');
        setTimeout(() => {
          navigate('/set-pin', { state: { phoneNumber } });
        }, 2000);
      } else {
        setError(response.message || 'Failed to set password. Please try again.');
      }
    } catch (error) {
      setError('Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!phoneNumber) {
    return (
      <div className="container">
        <div className="alert alert-error">
          No phone number provided. Please complete registration first.
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
        <h1>Set Password</h1>
        <p>Create a secure password for your account</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || success.length > 0}
        >
          {isLoading ? <div className="spinner"></div> : 'Set Password'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/verify-otp" state={{ phoneNumber }} className="text-link">
            Back to OTP Verification
          </Link>
        </div>
      </form>

      <div className="alert alert-info" style={{ marginTop: '20px' }}>
        <strong>Security Note:</strong> Choose a strong password with at least 6 characters.
      </div>
    </div>
  );
};

export default SetPasswordScreen;