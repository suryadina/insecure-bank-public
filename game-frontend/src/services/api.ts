import axios from 'axios';

// Nginx routes /app/api/* to the game-service, stripping the /app/api/
// prefix off before it reaches Spring. game-service's own controllers are
// mapped at the root (/auth, /mfa, /internal, /rewards, /game/wheel,
// /reward-profile), so the paths below are the clean, un-prefixed routes.
const client = axios.create({
  baseURL: '/app/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('gameAccessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginResponseData {
  customerId: string;
  sessionToken: string;
  mfaEnrolled: boolean;
  mfaVerified: boolean;
  accessToken: string | null;
}

export interface EnrollResponseData {
  secret: string;
  otpAuthUrl: string;
}

export interface VerifyResponseData {
  accessToken: string;
}

export interface StatusResponseData {
  enrolled: boolean;
  verified: boolean;
}

export interface RewardProfileData {
  customerId: string;
  fullName: string | null;
  points: number;
  tier: string;
  mfaSeed: string | null;
}

export interface SpinResponseData {
  outcome: string;
  pointsAwarded: number;
  totalPoints: number;
}

export interface WheelStateData {
  customerId: string;
  points: number;
}

export interface RedeemResponseData {
  pointsRedeemed: number;
  remainingPoints: number;
  amountDeposited: number;
  accountNumber: string;
}

export interface MyAccountData {
  accountNumber: string;
  accountType: string;
  balance: number;
}

export interface ShareWebhookData {
  webhookUrl: string;
  webhookResponseStatus: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const gameApi = {
  login: (username: string, password: string) =>
    client.post<ApiResponse<LoginResponseData>>('/auth/login', { username, password }).then((r) => r.data),

  mfaEnroll: (sessionToken: string) =>
    client
      .post<ApiResponse<EnrollResponseData>>('/mfa/enroll', null, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })
      .then((r) => r.data),

  mfaVerify: (sessionToken: string, code: string) =>
    client
      .post<ApiResponse<VerifyResponseData>>(
        '/mfa/verify',
        { code },
        { headers: { Authorization: `Bearer ${sessionToken}` } }
      )
      .then((r) => r.data),

  mfaStatus: (sessionToken: string) =>
    client
      .post<ApiResponse<StatusResponseData>>('/mfa/status', null, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })
      .then((r) => r.data),

  getRewardProfile: (customerUuid: string) =>
    client.get<ApiResponse<RewardProfileData>>(`/reward-profile/${customerUuid}`).then((r) => r.data),

  spinWheel: (outcome?: string) =>
    client
      .post<ApiResponse<SpinResponseData>>(
        '/game/wheel/spin',
        outcome ? { outcome } : {}
      )
      .then((r) => r.data),

  wheelState: () => client.get<ApiResponse<WheelStateData>>('/game/wheel/state').then((r) => r.data),

  redeem: (points: number, accountNumber: string) =>
    client
      .post<ApiResponse<RedeemResponseData>>('/rewards/account-deposit', {
        points,
        account_number: accountNumber,
      })
      .then((r) => r.data),

  myAccounts: () => client.get<ApiResponse<MyAccountData[]>>('/rewards/my-accounts').then((r) => r.data),

  shareWebhook: (webhookUrl: string, message: string) =>
    client
      .post<ApiResponse<ShareWebhookData>>('/rewards/share-webhook', {
        webhook_url: webhookUrl,
        message,
      })
      .then((r) => r.data),
};

export default client;
