import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { normalizePhone, PHONE_PLACEHOLDER } from '../utils/phone';
import Icon from '../components/Icon';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setLoginResult, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const normalized = normalizePhone(username);
    if (!normalized) {
      setError(`Invalid phone number. Use the +62 format, e.g. ${PHONE_PLACEHOLDER}`);
      setLoading(false);
      return;
    }
    try {
      const res = await gameApi.login(normalized, password);
      if (!res.success || !res.data) {
        setError(res.message || 'Login failed');
        return;
      }

      const { customerId, sessionToken, mfaEnrolled, accessToken } = res.data;
      setLoginResult(customerId, sessionToken);

      if (accessToken) {
        setAccessToken(accessToken);
        navigate('/profile');
        return;
      }

      if (mfaEnrolled) {
        navigate('/mfa?mode=verify');
      } else {
        navigate('/mfa?mode=enroll');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card-heading">
        <span className="icon-badge">
          <Icon name="login" />
        </span>
        <h1>Bank Rewards</h1>
      </div>
      <p className="subtext">Sign in with your bank credentials (phone number + password).</p>
      <form onSubmit={handleSubmit}>
        <input
          placeholder={PHONE_PLACEHOLDER}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
