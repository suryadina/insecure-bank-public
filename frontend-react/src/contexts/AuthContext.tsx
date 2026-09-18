import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phoneNumber: string, password: string, deviceId: string, deviceName: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  validatePin: (pin: string) => Promise<boolean>;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to safely store user data
const safeSetUserStorage = (user: User) => {
  try {
    localStorage.setItem('authUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }

    // Ensure device ID is generated/retrieved on app startup
    const deviceId = apiService.getStoredDeviceId();
    if (!deviceId) {
      apiService.generateDeviceId();
      console.log('Device ID initialized on app startup');
    } else {
      console.log('Existing device ID found:', deviceId);
    }

    setIsLoading(false);
  }, []);

  const login = async (phoneNumber: string, password: string, deviceId: string, deviceName: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login({
        phoneNumber,
        password,
        deviceId,
        deviceName
      });

      if (response.success && response.data) {
        const { accessToken, customerId } = response.data;
        
        // Create user object from the available data
        const user = {
          customerId: customerId,
          phoneNumber: phoneNumber, // Use the phone number from login
          fullName: '', // Will be populated when we fetch profile
          ktpNumber: '',
          dateOfBirth: '',
          isVerified: true
        };
        
        setToken(accessToken);
        setUser(user);
        localStorage.setItem('authToken', accessToken);
        safeSetUserStorage(user);
        
        // Optionally fetch full user profile
        try {
          const profileResponse = await authService.getProfile();
          if (profileResponse.success && profileResponse.data) {
            const fullUser = { ...user, ...profileResponse.data };
            setUser(fullUser);
            safeSetUserStorage(fullUser);
          }
        } catch (error) {
          console.log('Could not fetch profile, using basic user data');
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      return response.success;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const validatePin = async (pin: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const response = await authService.validatePin({
        customerId: user.customerId,
        pin
      });
      
      return response.success;
    } catch (error) {
      console.error('Validate PIN error:', error);
      return false;
    }
  };

  const isAuthenticated = (): boolean => {
    return !!(user && token);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    validatePin,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};