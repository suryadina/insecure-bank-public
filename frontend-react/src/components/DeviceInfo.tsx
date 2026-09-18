import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const DeviceInfo: React.FC = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string>('');

  useEffect(() => {
    const storedDeviceId = apiService.getStoredDeviceId();
    setDeviceId(storedDeviceId);
    setDeviceName(apiService.getDeviceName());
  }, []);

  const clearDevice = () => {
    apiService.clearDeviceId();
    setDeviceId(null);
    window.location.reload(); // Refresh to regenerate device ID
  };

  return (
    <div className="card" style={{ marginTop: '20px', backgroundColor: '#f8f9fa' }}>
      <div className="card-header" style={{ fontSize: '14px', fontWeight: '600' }}>
        Device Information (Debug)
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        <div style={{ marginBottom: '5px' }}>
          <strong>Device ID:</strong> {deviceId || 'Not set'}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Device Name:</strong> {deviceName}
        </div>
        <button
          onClick={clearDevice}
          className="btn btn-danger"
          style={{ fontSize: '12px', padding: '5px 10px' }}
        >
          Clear Device (Test Device Enrollment)
        </button>
      </div>
    </div>
  );
};

export default DeviceInfo;