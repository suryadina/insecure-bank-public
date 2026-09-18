import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { normalizePhoneNumber, validatePhoneNumber, getPhoneNumberPlaceholder } from '../utils/phoneUtils';

const LoginScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEnrollOption, setShowEnrollOption] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowEnrollOption(false);

    if (!phoneNumber || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Validate and normalize phone number
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || 'Invalid phone number format');
      return;
    }

    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhoneNumber) {
      setError('Invalid phone number format');
      return;
    }

    setIsLoading(true);
    
    try {
      const deviceId = apiService.generateDeviceId();
      const deviceName = apiService.getDeviceName();
      
      const success = await login(normalizedPhoneNumber, password, deviceId, deviceName);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Login failed. This may be due to invalid credentials or unregistered device.');
        setShowEnrollOption(true);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Login failed. Please try again.';
      
      if (errorMessage.includes('Device not found') || errorMessage.includes('not enrolled')) {
        setError('Device not enrolled. Please enroll this device first.');
        setShowEnrollOption(true);
      } else {
        setError(errorMessage);
        setShowEnrollOption(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollDevice = () => {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    navigate('/enroll-device', { 
      state: { phoneNumber: normalizedPhoneNumber || phoneNumber }
    });
  };

  return (
    <div className="container">
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
        <h2 style={{ marginTop: '15px', color: 'white', fontSize: '20px' }}>Welcome Back</h2>
        <p style={{ fontSize: '12px', color: '#bfdbfe', margin: '5px 0 0 0' }}>Sign in to your account</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={getPhoneNumberPlaceholder()}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? <div className="spinner"></div> : 'Sign In'}
        </button>

        {showEnrollOption && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleEnrollDevice}
            disabled={isLoading}
            style={{ marginTop: '10px' }}
          >
            Enroll New Device
          </button>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span>Don't have an account? </span>
          <Link to="/register" className="text-link">
            Sign up here
          </Link>
        </div>
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

export default LoginScreen;