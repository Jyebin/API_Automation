import apiClient from '@/client/apiClient';
import type { LoginResponse } from '@/types/api';
import type { FindIdResponse, DuplicateCheckResponse } from '@/types/auth.types';

export const authApi = {
  login: (userid: string, password: string) =>
    apiClient.post<LoginResponse>('/api/v1/member/auth/login/basic', { userid, password }),

  checkDuplicate: (params: { type: 'email' | 'userid'; value: string }) =>
    apiClient.get<DuplicateCheckResponse>('/api/v1/member/auth/join/exists', { params }),

  sendJoinEmailVerification: (email: string) =>
    apiClient.post('/api/v1/member/auth/join/verify/email', { email }),

  sendFindIdOtp: (otp_type: 'email' | 'phone', body: Record<string, string>) =>
    apiClient.post(`/api/v1/member/auth/find/id/${otp_type}/otp`, body),

  confirmFindId: (otp_type: 'email' | 'phone', body: Record<string, string>) =>
    apiClient.post<FindIdResponse>(`/api/v1/member/auth/find/id/${otp_type}`, body),

  sendFindPasswordEmail: (email: string) =>
    apiClient.post('/api/v1/member/auth/find/pwd', { email }),

  validateFindPassword: (token: string) =>
    apiClient.get('/api/v1/member/auth/find/pwd', { params: { token } }),

  resetPassword: (body: { token: string; password: string }) =>
    apiClient.put('/api/v1/member/auth/find/pwd', body),

  loginSocial: (provider_type: string, body: Record<string, string>) =>
    apiClient.post(`/api/v1/member/auth/login/social/${provider_type}`, body),

  getDidQr: () =>
    apiClient.get('/api/v1/member/auth/did/qr'),

};
