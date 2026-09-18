import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BrandMark from './components/BrandMark';
import Icon from './components/Icon';
import LoginPage from './pages/LoginPage';
import MfaPage from './pages/MfaPage';
import ProfilePage from './pages/ProfilePage';
import WheelPage from './pages/WheelPage';
import RedeemPage from './pages/RedeemPage';
import SharePage from './pages/SharePage';

const BrandHeader: React.FC = () => (
  <header className="brand-header">
    <BrandMark />
    <div>
      <h1>Insecure Bank Rewards</h1>
      <p className="brand-sub">Spin, earn, and redeem your loyalty points</p>
    </div>
  </header>
);

const NavBar: React.FC = () => {
  const { isFullyAuthenticated } = useAuth();
  const location = useLocation();
  if (!isFullyAuthenticated()) {
    return null;
  }
  const isActive = (path: string) => (location.pathname === path ? 'active' : '');
  return (
    <nav>
      <Link to="/profile" className={isActive('/profile')}>
        <Icon name="points" size={16} /> Profile
      </Link>
      <Link to="/wheel" className={isActive('/wheel')}>
        <Icon name="wheel" size={16} /> Wheel
      </Link>
      <Link to="/redeem" className={isActive('/redeem')}>
        <Icon name="redeem" size={16} /> Redeem
      </Link>
      <Link to="/share" className={isActive('/share')}>
        <Icon name="share" size={16} /> Share
      </Link>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter basename="/app">
        <div className="app-shell">
          <BrandHeader />
          <NavBar />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/mfa" element={<MfaPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wheel"
              element={
                <ProtectedRoute>
                  <WheelPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/redeem"
              element={
                <ProtectedRoute>
                  <RedeemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/share"
              element={
                <ProtectedRoute>
                  <SharePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
