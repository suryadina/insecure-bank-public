import { apiService } from './api';
import { ApiResponse, User, LoginRequest, RegisterRequest, SetPinRequest, ValidatePinRequest } from '../types';

interface LoginResponse {
  accessToken: string;
  customerId: string;
  deviceId: string;
}

class AuthService {
  async login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiService.post<ApiResponse<LoginResponse>>('/api/auth/login', request);
  }

  async register(request: RegisterRequest): Promise<ApiResponse<any>> {
    return apiService.post<ApiResponse<any>>('/api/auth/register', request);
  }

  async verifyOtp(phoneNumber: string, otpCode: string): Promise<ApiResponse<any>> {
    return apiService.post<ApiResponse<any>>('/api/auth/verify-registration', {
      phoneNumber,
      otpCode
    });
  }

  async setPassword(phoneNumber: string, password: string): Promise<ApiResponse<any>> {
    return apiService.post<ApiResponse<any>>('/api/auth/set-password', {
      phoneNumber,
      password
    });
  }

  async setPin(request: SetPinRequest): Promise<ApiResponse<any>> {
    return apiService.post<ApiResponse<any>>('/api/auth/set-pin', request);
  }

  async validatePin(request: ValidatePinRequest): Promise<ApiResponse<any>> {
    return apiService.post<ApiResponse<any>>('/api/auth/validate-pin', request);
  }

  async accountInquiry(accountNumber: string): Promise<ApiResponse<any>> {
    return apiService.get<ApiResponse<any>>(`/api/auth/inquiry/${accountNumber}`);
  }

  async enrollDevice(phoneNumber: string, password: string, deviceId: string, deviceName: string): Promise<ApiResponse<any>> {
    return apiService.post<ApiResponse<any>>('/api/auth/enroll-device', {
      phoneNumber,
      password,
      deviceId,
      deviceName
    });
  }

  async verifyDeviceEnrollment(phoneNumber: string, otpCode: string, deviceId: string, deviceName: string, password: string): Promise<ApiResponse<any>> {
    return apiService.post<ApiResponse<any>>(`/api/auth/verify-device-enrollment?deviceId=${deviceId}&deviceName=${encodeURIComponent(deviceName)}&password=${password}`, {
      phoneNumber,
      otpCode
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return apiService.get<ApiResponse<User>>('/api/auth/profile');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    return apiService.post<ApiResponse<any>>('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  async changePin(currentPin: string, newPin: string): Promise<ApiResponse<any>> {
    return apiService.post<ApiResponse<any>>('/api/auth/change-pin', {
      currentPin,
      newPin
    });
  }
}

export const authService = new AuthService();