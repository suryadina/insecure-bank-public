import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  customerId: string | null;
  sessionToken: string | null; // pre-MFA token
  accessToken: string | null; // post-MFA, full access token
  setLoginResult: (customerId: string, sessionToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  isFullyAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customerId, setCustomerId] = useState<string | null>(localStorage.getItem('gameCustomerId'));
  const [sessionToken, setSessionToken] = useState<string | null>(localStorage.getItem('gameSessionToken'));
  const [accessToken, setAccessTokenState] = useState<string | null>(localStorage.getItem('gameAccessToken'));

  const setLoginResult = (newCustomerId: string, newSessionToken: string) => {
    setCustomerId(newCustomerId);
    setSessionToken(newSessionToken);
    localStorage.setItem('gameCustomerId', newCustomerId);
    localStorage.setItem('gameSessionToken', newSessionToken);
  };

  const setAccessToken = (token: string) => {
    setAccessTokenState(token);
    localStorage.setItem('gameAccessToken', token);
  };

  const logout = () => {
    setCustomerId(null);
    setSessionToken(null);
    setAccessTokenState(null);
    localStorage.removeItem('gameCustomerId');
    localStorage.removeItem('gameSessionToken');
    localStorage.removeItem('gameAccessToken');
  };

  const isFullyAuthenticated = () => !!accessToken;

  return (
    <AuthContext.Provider
      value={{ customerId, sessionToken, accessToken, setLoginResult, setAccessToken, logout, isFullyAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};
