import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gameApi, SpinResponseData } from '../services/api';
import Icon from '../components/Icon';
import Wheel from '../components/Wheel';

const SPARKLE_EMOJI = ['✨', '⭐', '💫'];

const WheelPage: React.FC = () => {
  const [points, setPoints] = useState<number | null>(null);
  const [pendingOutcome, setPendingOutcome] = useState<string | null>(null);
  const [settledOutcome, setSettledOutcome] = useState<string | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const sparkleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingResultRef = useRef<SpinResponseData | null>(null);

  const loadState = async () => {
    try {
      const res = await gameApi.wheelState();
      if (res.success && res.data) {
        setPoints(res.data.points);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    loadState();
    return () => {
      if (sparkleTimerRef.current) clearTimeout(sparkleTimerRef.current);
    };
  }, []);

  const spin = async () => {
    setError('');
    setSettledOutcome(null);
    setPointsAwarded(null);
    setRequesting(true);
    try {
      // Wait for the real backend outcome BEFORE starting the animation, so
      // the wheel always spins toward the actual result instead of segment 0.
      const res = await gameApi.spinWheel();
      if (res.success && res.data) {
        pendingResultRef.current = res.data;
        setPendingOutcome(res.data.outcome);
        setSpinning(true);
      } else {
        setError(res.message || 'Spin failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Spin failed');
    } finally {
      setRequesting(false);
    }
  };

  const handleSettle = () => {
    setSpinning(false);
    const result = pendingResultRef.current;
    if (result) {
      setSettledOutcome(result.outcome);
      setPointsAwarded(result.pointsAwarded);
      setPoints(result.totalPoints);
      setShowSparkle(true);
      if (sparkleTimerRef.current) clearTimeout(sparkleTimerRef.current);
      sparkleTimerRef.current = setTimeout(() => setShowSparkle(false), 1200);
    }
  };

  return (
    <div className="page">
      <div className="card-heading">
        <span className="icon-badge">
          <Icon name="wheel" />
        </span>
        <h1>Lucky wheel</h1>
      </div>

      <div className="stat-card">
        <span className="icon-badge">
          <Icon name="points" />
        </span>
        <div>
          <p className="stat-label">Current points</p>
          <p className="stat-value">{points ?? '...'}</p>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <Wheel spinning={spinning} outcome={pendingOutcome} onSettle={handleSettle} />
        {showSparkle && (
          <div className="sparkle">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  left: `${20 + i * 20}%`,
                  top: '40%',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                {SPARKLE_EMOJI[i % SPARKLE_EMOJI.length]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={spin} disabled={spinning || requesting} style={{ maxWidth: 220, margin: '8px auto' }}>
          {spinning ? 'Spinning...' : requesting ? 'Rolling...' : 'Spin the wheel'}
        </button>
      </div>

      {settledOutcome && !spinning && (
        <div className="wheel-outcome">
          <span className="wheel-outcome-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle', marginRight: 6 }}>
              <path
                d="M8 4h8v3a4 4 0 0 1-8 0V4zM6 4H3v2a4 4 0 0 0 4 4M18 4h3v2a4 4 0 0 1-4 4M12 13v3m-3 4h6m-3-4v0"
                stroke="#1c1305"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Outcome: {settledOutcome.toUpperCase()}
            {pointsAwarded ? ` (+${pointsAwarded} pts)` : ''}
          </span>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <p>
        <Link to="/redeem">Convert points to money &rarr;</Link>
      </p>
    </div>
  );
};

export default WheelPage;
