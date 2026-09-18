import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { processApplicationData, getAppConfig } from '../utils/formatHelpers';

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    agent: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: string;
    };
  };
}

const CustomerServiceLoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [configResult, setConfigResult] = useState('');
  const [loginSession, setLoginSession] = useState('');
  
  const navigate = useNavigate();

  // Application configuration data
  const appConfigData = 'Vm0wd2QyVkZOVWhTYmxKV1YwZDRXRmxVUm5kVlJscHpXa2M1VjFKdGVGWlZNbmhQWVd4YWMxZHViRmROYWtaSVZtMXplRmRIVmtWUmJVWlhWakpvZVZacVNqUlpWMUpJVm10V1VtSlZXbGhXYlhoelRURmtWMWRzV214U2JWSkpWbTEwYTJGR1NuUmhSbXhXVFVaYVRGVXhXbXRXTVdSMFVteFNUbUpGY0ZsV1Z6QXhVekZaZVZOclpHcFNiV2hXVm10V1MxUkdXa2RYYlhSWFRWWndNRlZ0ZUc5aFZscHlWMVJDVjJGcmEzaFdWRVpTWlVaa1dWcEdhR2xTYTNCWlYxWmtNRmxXVWtkVmJHaHNVak5TV1ZWcVJrdFRSbVJ5V2toa1ZXSkdjRmxhU0hCRFZqSkZlVlJZYUZkV1JYQk1WV3BHVDFkV2NFZGhSMnhUWVROQ1dGWnRNSGhPUjFGM1RVaG9hbEp0YUhOVmFrNVRWMVpXY1ZKdFJsTk5Wa1kwVmpKME1GWlhTa2RqUm14aFUwaENTRlpxUm1GU2JVbDZXa1p3YUdFeGNGaFhiRnBoVkRKTmVGZHVUbUZTTW1oUFZGWldkMWRXV25KWGJHUmFWbTE0V0ZaWGRHdFdiVXBJWVVoT1ZrMUdXak5aZWtaaFl6RldjMXBHYUZOaVNFSktWa1phYWs1V1duSk5WVlpUWVROQ1YxWnFUbE5XUmxweFVtMUdWMDFyTlVoV1J6RkhWVEZLVjJORlZsZGlSMUV3VlZSR1lWWnJNVlpXYXpWVFVrVkZOUT09';

  const handleGetConfig = () => {
    console.log('[APP] Attempting to load configuration...');
    const result = getAppConfig(appConfigData);
    setConfigResult(result);
    console.log('[APP] Configuration loaded:', result);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${window.location.origin}/api/cs/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      const sessionHeader = response.headers.get('X-Login-Session');
      if (sessionHeader) {
        setLoginSession(sessionHeader);
      }

      if (response.status !== 200) {
        setError(result.message || 'Failed to send OTP. Please try again.');
        return;
      }

      if (result.success) {
        setShowOtpStep(true);
        setOtpMessage('OTP sent successfully. Please check the console for your verification code.');
      } else {
        setError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setError('Failed to send OTP. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode) {
      setError('Please enter the OTP code');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${window.location.origin}/api/cs/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Login-Session': loginSession,
        },
        body: JSON.stringify({ username, otpCode }),
      });

      const result: LoginResponse = await response.json();

      const newSessionHeader = response.headers.get('X-Login-Session');
      if (newSessionHeader) {
        localStorage.setItem('csLoginSession', newSessionHeader);
      }

      if (response.status !== 200) {
        setError(result.message || 'Login failed. Please try again.');
        return;
      }

      if (result.success && result.data) {
        localStorage.setItem('csAuthToken', result.data.accessToken);
        
        // Navigate to dashboard
        navigate('/cu5st0m3r-z3rv!c3sss/dashboard');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cs-container">
      <div className="cs-header">
        <h1>🔐 Customer Service Portal</h1>
        <p>Secure access to customer management dashboard</p>
        <div className="cs-alert" style={{ 
          background: '#fff3cd', 
          color: '#856404', 
          padding: '15px', 
          borderRadius: '8px', 
          marginTop: '20px',
          border: '1px solid #ffeaa7',
          textAlign: 'center'
        }}>
          ⚠️ <strong>Staff Access Only</strong> - Unauthorized access detected will be reported | CTF: {processApplicationData(appConfigData)}
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={handleGetConfig}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '5px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              get
            </button>
            {configResult && (
              <div style={{ 
                marginTop: '8px', 
                padding: '8px', 
                background: '#f8f9fa', 
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                Config: {configResult}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cs-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="cs-card-header">
          Agent Authentication
        </div>
        <div className="cs-card-body">
          {error && <div className="cs-alert-error">{error}</div>}

          {!showOtpStep ? (
            <form onSubmit={handleRequestOtp}>
              <div className="cs-form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              <div className="cs-form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="cs-btn-primary"
                disabled={isLoading}
                style={{ width: '100%' }}
              >
                {isLoading ? '🔄 Sending OTP...' : '📱 Send OTP Code'}
              </button>
            </form>
          ) : (
            <div>
              {otpMessage && (
                <div className="cs-alert" style={{ 
                  background: '#d1ecf1', 
                  color: '#0c5460', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  border: '1px solid #bee5eb'
                }}>
                  {otpMessage}
                </div>
              )}
              
              <form onSubmit={handleOtpLogin}>
                <div className="cs-form-group">
                  <label htmlFor="otpCode">OTP Verification Code</label>
                  <input
                    id="otpCode"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 4-digit OTP code"
                    disabled={isLoading}
                    maxLength={4}
                    style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                  />
                  <small style={{ color: '#6c757d', fontSize: '12px' }}>
                    Check the Docker console logs for your OTP code
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="cs-btn-secondary"
                    onClick={() => {
                      setShowOtpStep(false);
                      setOtpCode('');
                      setOtpMessage('');
                      setError('');
                    }}
                    disabled={isLoading}
                    style={{ flex: 1 }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="cs-btn-primary"
                    disabled={isLoading || otpCode.length !== 4}
                    style={{ flex: 2 }}
                  >
                    {isLoading ? '🔄 Verifying...' : '🚀 Access Dashboard'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceLoginScreen;