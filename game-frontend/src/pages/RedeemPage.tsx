import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gameApi, MyAccountData } from '../services/api';
import Icon from '../components/Icon';

const formatAccountLabel = (account: MyAccountData): string => {
  return `${account.accountNumber} (${account.accountType})`;
};

const RedeemPage: React.FC = () => {
  const [points, setPoints] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accounts, setAccounts] = useState<MyAccountData[]>([]);
  const [accountsFailed, setAccountsFailed] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gameApi
      .myAccounts()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setAccounts(res.data);
          setAccountNumber(res.data[0].accountNumber);
        } else {
          setAccountsFailed(true);
        }
      })
      .catch(() => {
        setAccountsFailed(true);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult('');
    setLoading(true);
    try {
      const res = await gameApi.redeem(parseInt(points, 10), accountNumber);
      if (res.success && res.data) {
        setResult(
          `Redeemed ${res.data.pointsRedeemed} points -> deposited ${res.data.amountDeposited} to account ${res.data.accountNumber}. Remaining points: ${res.data.remainingPoints}`
        );
      } else {
        setError(res.message || 'Redemption failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Redemption failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card-heading">
        <span className="icon-badge">
          <Icon name="redeem" />
        </span>
        <h1>Convert points to money</h1>
      </div>
      <p className="subtext">Trade in your reward points for cash, deposited directly to your bank account.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Points to redeem"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          required
        />
        {accountsFailed ? (
          <input
            placeholder="Destination account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
        ) : (
          <select value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required>
            {accounts.length === 0 && <option value="">Loading accounts...</option>}
            {accounts.map((account) => (
              <option key={account.accountNumber} value={account.accountNumber}>
                {formatAccountLabel(account)}
              </option>
            ))}
          </select>
        )}
        {error && <p className="error">{error}</p>}
        {result && <p className="success">{result}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Redeeming...' : 'Redeem'}
        </button>
      </form>
      <p>
        <Link to="/share">Share your win</Link>
      </p>
    </div>
  );
};

export default RedeemPage;
