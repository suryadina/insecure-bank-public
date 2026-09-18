import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { normalizePhoneNumber, validatePhoneNumber, getPhoneNumberPlaceholder } from '../utils/phoneUtils';

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    ktpNumber: '',
    fullName: '',
    dateOfBirth: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.phoneNumber || !formData.ktpNumber || !formData.fullName || 
        !formData.dateOfBirth) {
      return 'Please fill in all fields';
    }

    if (formData.ktpNumber.length !== 16) {
      return 'KTP number must be 16 digits';
    }

    // Enhanced phone number validation using utility
    const phoneValidation = validatePhoneNumber(formData.phoneNumber);
    if (!phoneValidation.isValid) {
      return phoneValidation.error;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    
    try {
      // Normalize phone number before sending to API
      const normalizedPhoneNumber = normalizePhoneNumber(formData.phoneNumber);
      if (!normalizedPhoneNumber) {
        setError('Invalid phone number format');
        setIsLoading(false);
        return;
      }

      const normalizedFormData = {
        ...formData,
        phoneNumber: normalizedPhoneNumber
      };

      const success = await register(normalizedFormData);
      
      if (success) {
        navigate('/verify-otp', { 
          state: { phoneNumber: normalizedPhoneNumber } 
        });
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        <h2 style={{ marginTop: '15px', color: 'white', fontSize: '20px' }}>Create Account</h2>
        <p style={{ fontSize: '12px', color: '#bfdbfe', margin: '5px 0 0 0' }}>Join Insecure Bank today & get IDR 999,999 FREE!</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
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
          <label htmlFor="ktpNumber">KTP Number</label>
          <input
            id="ktpNumber"
            name="ktpNumber"
            type="text"
            value={formData.ktpNumber}
            onChange={handleInputChange}
            placeholder="16-digit KTP number"
            maxLength={16}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Your full name"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </div>


        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? <div className="spinner"></div> : 'Create Account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span>Already have an account? </span>
          <Link to="/login" className="text-link">
            Sign in here
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

export default RegisterScreen;