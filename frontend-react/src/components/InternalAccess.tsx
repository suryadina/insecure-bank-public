import React, { useEffect, useState } from 'react';
import '../components/LoadingScreen.css';

const InternalAccess: React.FC = () => {
  const [showSecondMessage, setShowSecondMessage] = useState(false);
  
  useEffect(() => {
    // Show second message after 3 seconds
    const timer = setTimeout(() => {
      setShowSecondMessage(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fake-hacker-container">
      <div className="fake-hacker-content">
        <div className="fake-message-1">
          <h1 className="fake-title">🚫 OOPS!</h1>
          <p className="fake-subtitle">Hacker please don't hack me.</p>
          <div className="fake-loader">
            <div className="fake-spinner"></div>
            <p>Detecting intrusion...</p>
          </div>
        </div>
        
        {showSecondMessage && (
          <div className="fake-message-2">
            <h2 className="fake-alert">⚠️ CONGRATS!</h2>
            <p className="fake-warning">You just got hacked.</p>
            <p className="fake-threat">Your laptop will be locked!!!</p>
            <div className="fake-countdown">
              <p>System lockdown in progress...</p>
              <div className="fake-progress-bar">
                <div className="fake-progress-fill"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="fake-background-effects">
        <div className="fake-matrix-rain"></div>
      </div>
    </div>
  );
};

export default InternalAccess;