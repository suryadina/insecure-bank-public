import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { apiService } from '../services/api';
import { normalizePhoneNumber, validatePhoneNumber, getPhoneNumberPlaceholder } from '../utils/phoneUtils';

const DeviceEnrollmentScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrollmentCompleted, setEnrollmentCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP verification
  const [deviceInfo, setDeviceInfo] = useState({ deviceId: '', deviceName: '' });
  
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledPhone = location.state?.phoneNumber || '';

  // Debug logging
  console.log('DeviceEnrollmentScreen - Current step:', step);

  React.useEffect(() => {
    if (prefilledPhone) {
      setFormData(prev => ({ ...prev, phoneNumber: prefilledPhone }));
    }
  }, [prefilledPhone]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEnrollDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.phoneNumber || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Validate and normalize phone number
    const phoneValidation = validatePhoneNumber(formData.phoneNumber);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || 'Invalid phone number format');
      return;
    }

    const normalizedPhoneNumber = normalizePhoneNumber(formData.phoneNumber);
    if (!normalizedPhoneNumber) {
      setError('Invalid phone number format');
      return;
    }

    setIsLoading(true);
    
    try {
      const deviceId = apiService.generateDeviceId();
      const deviceName = apiService.getDeviceName();
      
      // Store device info for verification step
      setDeviceInfo({ deviceId, deviceName });
      
      const response = await authService.enrollDevice(
        normalizedPhoneNumber,
        formData.password,
        deviceId,
        deviceName
      );
      
      console.log('Device enrollment response:', response);
      if (response.success) {
        setSuccess(''); // Clear success message for step 2
        // Update form data with normalized phone number for OTP verification
        setFormData(prev => ({ ...prev, phoneNumber: normalizedPhoneNumber }));
        setStep(2);
        console.log('Step changed to 2');
      } else {
        setError(response.message || 'Device enrollment failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Device enrollment error:', error);
      setError('Device enrollment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length !== 4) {
      setError('Please enter a valid 4-digit OTP code');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authService.verifyDeviceEnrollment(
        formData.phoneNumber, 
        otpCode,
        deviceInfo.deviceId,
        deviceInfo.deviceName,
        formData.password
      );
      
      if (response.success) {
        setSuccess('Device enrolled successfully!');
        setEnrollmentCompleted(true);
        setTimeout(() => {
          navigate('/login', { 
            state: { phoneNumber: formData.phoneNumber }
          });
        }, 2000);
      } else {
        setError('Invalid OTP code. Please try again.');
      }
    } catch (error) {
      setError('OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtpCode('');
      setError('');
    } else {
      navigate('/login');
    }
  };

  if (enrollmentCompleted) {
    return (
      <div className="container">
        <div className="alert alert-success" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h2>✓ Device Enrolled Successfully!</h2>
          <p>{success}</p>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>

      <div className="header">
        <h1>Enroll New Device</h1>
        <p>{step === 1 ? 'Enter your credentials' : 'Enter OTP to complete enrollment'}</p>
      </div>

      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : 'inactive'}`}>1</div>
        <div className={`step ${step >= 2 ? 'active' : 'inactive'}`}>2</div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && step === 1 && <div className="alert alert-success">{success}</div>}

      {step === 1 ? (
        <form onSubmit={handleEnrollDevice} className="form">
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder={getPhoneNumberPlaceholder()}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? <div className="spinner"></div> : 'Enroll Device'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span>Don't have an account? </span>
            <Link to="/register" className="text-link">
              Register here
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="form">
          <div className="form-group">
            <label htmlFor="otpCode">OTP Code</label>
            <input
              id="otpCode"
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Enter 4-digit OTP"
              maxLength={4}
              disabled={isLoading}
              style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? <div className="spinner"></div> : 'Verify OTP'}
          </button>
        </form>
      )}

      <div className="alert alert-info" style={{ marginTop: '20px' }}>
        <strong>Device Enrollment:</strong> This process registers your browser as a trusted device for banking operations.
        You'll need to provide your existing account credentials and verify via OTP.
      </div>
    </div>
  );
};

export default DeviceEnrollmentScreen;