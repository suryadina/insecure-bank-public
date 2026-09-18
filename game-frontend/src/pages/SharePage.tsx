import React, { useState } from 'react';
import { gameApi } from '../services/api';
import Icon from '../components/Icon';

interface SocialPlatform {
  label: string;
  buildUrl: (message: string) => string;
}

const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  twitter: {
    label: 'Twitter/X',
    buildUrl: (message) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
  },
  facebook: {
    label: 'Facebook',
    buildUrl: (message) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(message)}`,
  },
  linkedin: {
    label: 'LinkedIn',
    buildUrl: (message) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(message)}`,
  },
  whatsapp: {
    label: 'WhatsApp',
    buildUrl: (message) => `https://wa.me/?text=${encodeURIComponent(message)}`,
  },
  telegram: {
    label: 'Telegram',
    buildUrl: (message) => `https://t.me/share/url?url=${encodeURIComponent(message)}`,
  },
};

const SharePage: React.FC = () => {
  const [platform, setPlatform] = useState('twitter');
  const [message, setMessage] = useState('I just hit the jackpot on the lucky wheel!');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);
    const selected = SOCIAL_PLATFORMS[platform];
    const shareUrl = selected.buildUrl(message);
    try {
      const res = await gameApi.shareWebhook(shareUrl, message);
      if (res.success) {
        window.open(shareUrl, '_blank');
        setStatus(`Shared to ${selected.label}!`);
      } else {
        setError(res.message || 'Could not share');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not share');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card-heading">
        <span className="icon-badge">
          <Icon name="share" />
        </span>
        <h1>Share your win</h1>
      </div>
      <p className="subtext">Share your lucky wheel win on social media and let your friends know!</p>
      <form onSubmit={handleSubmit}>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          {Object.entries(SOCIAL_PLATFORMS).map(([key, p]) => (
            <option key={key} value={key}>
              {p.label}
            </option>
          ))}
        </select>
        <input
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        {status && <p className="success">{status}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Sharing...' : 'Share'}
        </button>
      </form>
    </div>
  );
};

export default SharePage;
