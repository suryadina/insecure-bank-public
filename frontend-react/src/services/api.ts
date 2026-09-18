import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Dynamic API base URL - uses current domain with proper protocol
const getApiBaseUrl = (): string => {
  // Use current domain and protocol from browser
  const protocol = window.location.protocol; // http: or https:
  const hostname = window.location.hostname; // domain.com
  const port = window.location.port; // port if any
  
  // For development (localhost)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}${port ? ':' + port : ''}`;
  }
  
  // For production (use current domain)
  return `${protocol}//${hostname}`;
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  generateDeviceId(): string {
    // Check if device ID already exists in localStorage
    const existingDeviceId = localStorage.getItem('deviceId');
    if (existingDeviceId) {
      console.log('Using existing device ID:', existingDeviceId);
      return existingDeviceId;
    }

    // Generate new device ID if none exists
    const newDeviceId = 'WEB_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('deviceId', newDeviceId);
    console.log('Generated new device ID:', newDeviceId);
    return newDeviceId;
  }

  getStoredDeviceId(): string | null {
    return localStorage.getItem('deviceId');
  }

  clearDeviceId(): void {
    localStorage.removeItem('deviceId');
    console.log('Device ID cleared from storage');
  }

  getDeviceName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    if (userAgent.includes('Edge')) return 'Edge Browser';
    return 'Web Browser';
  }
}

export const apiService = new ApiService();