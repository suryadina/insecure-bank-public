import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gameApi, RewardProfileData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

const ProfilePage: React.FC = () => {
  const { customerId, logout } = useAuth();
  const [profile, setProfile] = useState<RewardProfileData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadProfile = async (id: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await gameApi.getRewardProfile(id);
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        setError(res.message || 'Could not load profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      loadProfile(customerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  return (
    <div className="page">
      <div className="card-heading">
        <span className="icon-badge">
          <Icon name="points" />
        </span>
        <h1>{profile?.fullName || 'Reward profile'}</h1>
      </div>

      {profile && (
        <div className="stat-card">
          <span className="icon-badge">
            <Icon name="points" />
          </span>
          <div>
            <p className="stat-label">Points balance</p>
            <p className="stat-value">{profile.points}</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p className="stat-label">Tier</p>
            <p className="stat-value" style={{ fontSize: '1.1rem' }}>{profile.tier}</p>
          </div>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <button onClick={logout} className="btn-secondary">
        <Icon name="logout" size={16} /> Log out
      </button>
      <p>
        <Link to="/wheel">Spin the wheel &rarr;</Link>
      </p>
      <p>
        <Link to="/redeem">Redeem points</Link>
      </p>
    </div>
  );
};

export default ProfilePage;
