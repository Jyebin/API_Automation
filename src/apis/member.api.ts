import apiClient from '@/client/apiClient';
import type {
  MyProfileResponse,
  OthersProfileResponse,
  OrderListResponse,
  OrderDetailResponse,
  CancelReasonListResponse,
  WithdrawalReasonListResponse,
  StudyClassListResponse,
  StudyClassDetailResponse,
  BadgeFavoriteListResponse,
  CouponListResponse,
  WebViewUrlResponse,
} from '@/types/member.types';

export const memberApi = {
  // ── 내 정보 (v1) ──────────────────────────────────────────────────────
  getMyProfile: () =>
    apiClient.get<MyProfileResponse>('/api/v1/member/my/profile'),

  updateMyProfile: (body: Record<string, unknown>) =>
    apiClient.put('/api/v1/member/my/profile', body),

  withdrawMember: (body: Record<string, unknown>) =>
    apiClient.delete('/api/v1/member/my/profile', { data: body }),

  verifyPassword: (password: string) =>
    apiClient.post('/api/v1/member/my/profile/verification', { password }),

  changePassword: (body: { current_password: string; new_password: string }) =>
    apiClient.put('/api/v1/member/my/profile/pwd', body),

  getWithdrawalReasons: () =>
    apiClient.get<WithdrawalReasonListResponse>('/api/v1/member/my/withdrawal/reason'),

  getOrderCancelReasons: () =>
    apiClient.get<CancelReasonListResponse>('/api/v1/member/my/order/cancel/reason'),

  getMyOrders: (params?: { page?: number; size?: number }) =>
    apiClient.get<OrderListResponse>('/api/v1/member/my/order', { params }),

  getMyOrderDetail: (order_no: string) =>
    apiClient.get<OrderDetailResponse>(`/api/v1/member/my/order/${order_no}`),

  cancelOrder: (order_no: string, body: { reason: string; reason_direct?: string }) =>
    apiClient.post(`/api/v1/member/my/order/${order_no}/cancel`, body),

  getMyWebViewUrl: (web_view: string) =>
    apiClient.get<WebViewUrlResponse>(`/api/v1/member/my/${web_view}`),

  getMySsoToken: () =>
    apiClient.get('/api/v1/member/my/sso/token'),

  getMyBadgeFavorites: () =>
    apiClient.get<BadgeFavoriteListResponse>('/api/v1/member/my/badge/favorites'),

  getMyStudyClasses: (params?: { page?: number; size?: number }) =>
    apiClient.get<StudyClassListResponse>('/api/v1/member/my/study/classes', { params }),

  getMyStudyClassDetail: (class_code: string) =>
    apiClient.get<StudyClassDetailResponse>(`/api/v1/member/my/study/classes/${class_code}`),

  getTokenValidity: () =>
    apiClient.get('/api/v1/member/token'),

  getOthersProfile: (user_id: string) =>
    apiClient.get<OthersProfileResponse>('/api/v1/member/others/profile', { params: { user_id } }),

  // ── 내 정보 (v2) ──────────────────────────────────────────────────────
  getMyProfileV2: () =>
    apiClient.get('/api/v2/member/my/profile'),

  getMyOrdersV2: (params?: { page?: number; size?: number }) =>
    apiClient.get('/api/v2/member/my/order', { params }),

  getMyOrderDetailV2: (orderNo: string) =>
    apiClient.get(`/api/v2/member/my/order/${orderNo}`),

  getOrderCancelReasonsV2: () =>
    apiClient.get('/api/v2/member/my/order/cancel/reason'),

  getMyCoupons: (params?: { page?: number; size?: number }) =>
    apiClient.get<CouponListResponse>('/api/v2/member/my/coupon', { params }),

  getMyWebViewUrlV2: (webView: string) =>
    apiClient.get(`/api/v2/member/my/${webView}`),

  getMyBadgeFavoritesV2: () =>
    apiClient.get('/api/v2/member/my/badge/favorites'),

  getMyStudyClassesV2: (params?: { page?: number; size?: number }) =>
    apiClient.get('/api/v2/member/my/study/classes', { params }),

  getMyStudyClassDetailV2: (class_code: string) =>
    apiClient.get(`/api/v2/member/my/study/classes/${class_code}`),

  cancelOrderV2: (orderNo: string, body: { reason: string; reason_direct?: string }) =>
    apiClient.post(`/api/v2/member/my/order/${orderNo}/cancel`, body),
};
