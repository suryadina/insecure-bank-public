import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gameApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

const MfaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'verify' ? 'verify' : 'enroll';

  const [secret, setSecret] = useState('');
  const [otpAuthUrl, setOtpAuthUrl] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { sessionToken, setAccessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionToken) {
      navigate('/login');
      return;
    }
    if (mode === 'enroll') {
      gameApi
        .mfaEnroll(sessionToken)
        .then((res) => {
          if (res.success && res.data) {
            setSecret(res.data.secret);
            setOtpAuthUrl(res.data.otpAuthUrl);
          } else {
            setError(res.message || 'Could not start MFA enrollment');
          }
        })
        .catch(() => setError('Could not start MFA enrollment'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, sessionToken]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;
    setError('');
    setLoading(true);
    try {
      const res = await gameApi.mfaVerify(sessionToken, code);
      if (res.success && res.data) {
        setAccessToken(res.data.accessToken);
        navigate('/profile');
      } else {
        setError(res.message || 'Invalid code');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const qrImage = otpAuthUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpAuthUrl)}`
    : '';

  return (
    <div className="page">
      <div className="card-heading">
        <span className="icon-badge">
          <Icon name="mfa" />
        </span>
        <h1>Two-factor authentication</h1>
      </div>
      {mode === 'enroll' && (
        <>
          <p className="subtext">
            Scan this QR with Google Authenticator (or any TOTP app), then enter the 6-digit code below.
          </p>
          {otpAuthUrl && (
            <>
              <img
                src={qrImage}
                alt="TOTP QR code"
                style={{ display: 'block', margin: '0 auto', borderRadius: 12, background: '#fff', padding: 8 }}
              />
              <span className="mono">{otpAuthUrl}</span>
              <p className="subtext">Manual entry secret:</p>
              <span className="mono">{secret}</span>
            </>
          )}
        </>
      )}
      {mode === 'verify' && <p className="subtext">Enter the 6-digit code from your authenticator app.</p>}
      <form onSubmit={handleVerify}>
        <input
          className="otp-input"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
};

export default MfaPage;
