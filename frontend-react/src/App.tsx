import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import VerifyOtpScreen from './components/VerifyOtpScreen';
import SetPasswordScreen from './components/SetPasswordScreen';
import DeviceEnrollmentScreen from './components/DeviceEnrollmentScreen';
import SetPinScreen from './components/SetPinScreen';
import DashboardScreen from './components/DashboardScreen';
import TransferScreen from './components/TransferScreen';
import AccountInquiryScreen from './components/AccountInquiryScreen';
import CreateAccountScreen from './components/CreateAccountScreen';
import ProfileScreen from './components/ProfileScreen';
import CustomerServiceLoginScreen from './components/CustomerServiceLoginScreen';
import CustomerServiceDashboard from './components/CustomerServiceDashboard';
import AdminPanel from './components/AdminPanel';
import SystemDashboard from './components/SystemDashboard';
import ControlPanel from './components/ControlPanel';
import ManagementPortal from './components/ManagementPortal';
import ServiceConsole from './components/ServiceConsole';
import InternalAccess from './components/InternalAccess';
import SupportCenter from './components/SupportCenter';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Homepage */}
            <Route path="/" element={<HomePage />} />
            
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin-panel" element={<SystemDashboard />} />
            
            {/* Public routes */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/admin-login" element={<ControlPanel />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/verify-otp" element={<VerifyOtpScreen />} />
            <Route path="/customer-service" element={<ManagementPortal />} />
            <Route path="/set-password" element={<SetPasswordScreen />} />
            <Route path="/set-pin" element={<SetPinScreen />} />
            <Route path="/enroll-device" element={<DeviceEnrollmentScreen />} />
            <Route path="/admin-dashboard" element={<ServiceConsole />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardScreen />
              </ProtectedRoute>
            } />
            <Route path="/admin-portal" element={<InternalAccess />} />
            <Route path="/transfer" element={
              <ProtectedRoute>
                <TransferScreen />
              </ProtectedRoute>
            } />
            <Route path="/admin-console" element={<SupportCenter />} />
            <Route path="/account-inquiry" element={
              <ProtectedRoute>
                <AccountInquiryScreen />
              </ProtectedRoute>
            } />
            <Route path="/admin-control" element={<AdminPanel />} />
            <Route path="/create-account" element={
              <ProtectedRoute>
                <CreateAccountScreen />
              </ProtectedRoute>
            } />
            <Route path="/admin-interface" element={<SystemDashboard />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            } />
            
            {/* System management routes */}
            <Route path="/admin-area" element={<ControlPanel />} />
            <Route path="/admin-zone" element={<ManagementPortal />} />
            <Route path="/admin-access" element={<ServiceConsole />} />
            <Route path="/customer-services" element={<InternalAccess />} />
            <Route path="/admin-management" element={<SupportCenter />} />
            <Route path="/customer-support" element={<AdminPanel />} />
            <Route path="/admin-system" element={<SystemDashboard />} />
            <Route path="/customer-portal" element={<ControlPanel />} />
            <Route path="/admin-tools" element={<ManagementPortal />} />
            <Route path="/customer-panel" element={<ServiceConsole />} />
            <Route path="/admin-settings" element={<InternalAccess />} />
            
            {/* Customer management routes */}
            <Route path="/customer-dashboard" element={<SupportCenter />} />
            <Route path="/customer-login" element={<AdminPanel />} />
            <Route path="/customer-console" element={<SystemDashboard />} />
            <Route path="/customer-management" element={<ControlPanel />} />
            <Route path="/customer-interface" element={<ManagementPortal />} />
            <Route path="/customer-admin" element={<ServiceConsole />} />
            <Route path="/customer-access" element={<InternalAccess />} />
            <Route path="/customer-area" element={<SupportCenter />} />
            <Route path="/customer-zone" element={<AdminPanel />} />
            <Route path="/customer-control" element={<SystemDashboard />} />
            
            {/* Administrator panel routes */}
            <Route path="/administrator" element={<ControlPanel />} />
            <Route path="/administrators" element={<ManagementPortal />} />
            <Route path="/administrator-panel" element={<ServiceConsole />} />
            <Route path="/administrator-login" element={<InternalAccess />} />
            <Route path="/administrator-dashboard" element={<SupportCenter />} />
            <Route path="/administrator-portal" element={<AdminPanel />} />
            <Route path="/administrator-console" element={<SystemDashboard />} />
            <Route path="/administrator-control" element={<ControlPanel />} />
            <Route path="/administrator-interface" element={<ManagementPortal />} />
            <Route path="/administrator-area" element={<ServiceConsole />} />
            <Route path="/administrator-zone" element={<InternalAccess />} />
            <Route path="/administrator-access" element={<SupportCenter />} />
            <Route path="/administrator-management" element={<AdminPanel />} />
            <Route path="/administrator-system" element={<SystemDashboard />} />
            <Route path="/administrator-tools" element={<ControlPanel />} />
            
            {/* Dashboard management routes */}
            <Route path="/dashboard-admin" element={<ManagementPortal />} />
            <Route path="/dashboard-control" element={<ServiceConsole />} />
            <Route path="/dashboard-management" element={<InternalAccess />} />
            <Route path="/dashboard-panel" element={<SupportCenter />} />
            <Route path="/dashboard-portal" element={<AdminPanel />} />
            <Route path="/dashboard-console" element={<SystemDashboard />} />
            <Route path="/dashboard-interface" element={<ControlPanel />} />
            <Route path="/dashboard-system" element={<ManagementPortal />} />
            <Route path="/dashboard-tools" element={<ServiceConsole />} />
            <Route path="/dashboard-access" element={<InternalAccess />} />
            <Route path="/dashboard-area" element={<SupportCenter />} />
            <Route path="/dashboard-zone" element={<AdminPanel />} />
            <Route path="/dashboard-login" element={<SystemDashboard />} />
            <Route path="/dashboard-settings" element={<ControlPanel />} />
            <Route path="/dashboard-config" element={<ManagementPortal />} />
            
            {/* Internal system routes */}
            <Route path="/internal" element={<ServiceConsole />} />
            <Route path="/internal-admin" element={<InternalAccess />} />
            <Route path="/internal-panel" element={<SupportCenter />} />
            <Route path="/internal-login" element={<AdminPanel />} />
            <Route path="/internal-dashboard" element={<SystemDashboard />} />
            <Route path="/internal-portal" element={<ControlPanel />} />
            <Route path="/internal-console" element={<ManagementPortal />} />
            <Route path="/internal-control" element={<ServiceConsole />} />
            <Route path="/internal-interface" element={<InternalAccess />} />
            <Route path="/internal-area" element={<SupportCenter />} />
            <Route path="/internal-zone" element={<AdminPanel />} />
            <Route path="/internal-access" element={<SystemDashboard />} />
            <Route path="/internal-management" element={<ControlPanel />} />
            <Route path="/internal-system" element={<ManagementPortal />} />
            <Route path="/internal-tools" element={<ServiceConsole />} />
            
            {/* Support and help desk routes */}
            <Route path="/helpdesk" element={<InternalAccess />} />
            <Route path="/help-desk" element={<SupportCenter />} />
            <Route path="/helpdesk-admin" element={<AdminPanel />} />
            <Route path="/helpdesk-panel" element={<SystemDashboard />} />
            <Route path="/helpdesk-login" element={<ControlPanel />} />
            <Route path="/helpdesk-dashboard" element={<ManagementPortal />} />
            <Route path="/helpdesk-portal" element={<ServiceConsole />} />
            <Route path="/helpdesk-console" element={<InternalAccess />} />
            <Route path="/helpdesk-control" element={<SupportCenter />} />
            <Route path="/helpdesk-interface" element={<AdminPanel />} />
            <Route path="/helpdesk-area" element={<SystemDashboard />} />
            <Route path="/helpdesk-zone" element={<ControlPanel />} />
            <Route path="/helpdesk-access" element={<ManagementPortal />} />
            <Route path="/helpdesk-management" element={<ServiceConsole />} />
            <Route path="/helpdesk-system" element={<InternalAccess />} />
            
            {/* Hidden customer service routes */}
            <Route path="/cu5st0m3r-z3rv!c3sss" element={<CustomerServiceLoginScreen />} />
            <Route path="/cu5st0m3r-z3rv!c3sss/dashboard" element={<CustomerServiceDashboard />} />
            
            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;