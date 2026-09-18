import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

interface ProfileData {
  id: string;
  phoneNumber: string;
  fullName: string;
  ktpNumber: string;
  dateOfBirth: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  selfiePath?: string;
}

const ProfileScreen: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pinForm, setPinForm] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getProfile();
      
      if (response.success && response.data) {
        setProfileData(response.data as any);
      } else {
        setError('Failed to load profile data');
      }
    } catch (error) {
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      const response = await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      if (response.success) {
        setSuccess('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowChangePassword(false);
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (error) {
      setError('Failed to change password. Please try again.');
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (pinForm.newPin !== pinForm.confirmPin) {
      setError('New PINs do not match');
      return;
    }

    if (pinForm.newPin.length !== 4 || !/^\d{4}$/.test(pinForm.newPin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    try {
      const response = await authService.changePin(pinForm.currentPin, pinForm.newPin);
      
      if (response.success) {
        setSuccess('PIN changed successfully');
        setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
        setShowChangePin(false);
      } else {
        setError(response.message || 'Failed to change PIN');
      }
    } catch (error) {
      setError('Failed to change PIN. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <div className="alert alert-error">
          {error}
        </div>
        <button className="btn btn-primary" onClick={loadProfile}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ← Back
      </button>

      <div className="header">
        <h1>Account Profile</h1>
        <p>Your personal information and account details</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {profileData && (
        <div className="card">
          <div className="card-header">Personal Information</div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <span style={{ fontWeight: '500', color: '#666' }}>Full Name:</span>
              <span>{profileData.fullName}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <span style={{ fontWeight: '500', color: '#666' }}>Phone Number:</span>
              <span>{profileData.phoneNumber}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <span style={{ fontWeight: '500', color: '#666' }}>KTP Number:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{profileData.ktpNumber}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <span style={{ fontWeight: '500', color: '#666' }}>Date of Birth:</span>
              <span>{formatDate(profileData.dateOfBirth)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <span style={{ fontWeight: '500', color: '#666' }}>Account Status:</span>
              <span style={{ 
                color: profileData.isVerified ? '#28a745' : '#dc3545',
                fontWeight: '500'
              }}>
                {profileData.isVerified ? '✓ Verified' : '✗ Not Verified'}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <span style={{ fontWeight: '500', color: '#666' }}>Account Created:</span>
              <span>{formatDate(profileData.createdAt)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: '500', color: '#666' }}>Last Updated:</span>
              <span>{formatDate(profileData.updatedAt)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">Security Settings</div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowChangePassword(true)}
            style={{ flex: 1 }}
          >
            Change Password
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowChangePin(true)}
            style={{ flex: 1 }}
          >
            Change PIN
          </button>
        </div>
      </div>

      {showChangePassword && (
        <div className="card">
          <div className="card-header">Change Password</div>
          <form onSubmit={handleChangePassword} className="form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Update Password
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowChangePassword(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showChangePin && (
        <div className="card">
          <div className="card-header">Change PIN</div>
          <form onSubmit={handleChangePin} className="form">
            <div className="form-group">
              <label>Current PIN</label>
              <input
                type="password"
                value={pinForm.currentPin}
                onChange={(e) => setPinForm({...pinForm, currentPin: e.target.value})}
                maxLength={4}
                pattern="[0-9]{4}"
                required
              />
            </div>
            <div className="form-group">
              <label>New PIN</label>
              <input
                type="password"
                value={pinForm.newPin}
                onChange={(e) => setPinForm({...pinForm, newPin: e.target.value})}
                maxLength={4}
                pattern="[0-9]{4}"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New PIN</label>
              <input
                type="password"
                value={pinForm.confirmPin}
                onChange={(e) => setPinForm({...pinForm, confirmPin: e.target.value})}
                maxLength={4}
                pattern="[0-9]{4}"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Update PIN
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowChangePin(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="alert alert-info">
        <h4>Security Information:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Your KTP number and phone number are used for account verification</li>
          <li>Keep your login credentials secure and do not share them</li>
          <li>Contact support if you notice any unauthorized activity</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/dashboard')}
          style={{ flex: 1 }}
        >
          Back to Dashboard
        </button>
        <button
          className="btn btn-danger"
          onClick={handleLogout}
          style={{ flex: 1 }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;