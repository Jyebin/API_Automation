import apiClient from '@/client/apiClient';
import type {
  OrderListResponse,
  OrderDetailResponse,
  CancelReasonListResponse,
  WithdrawalReasonListResponse,
  StudyClassListResponse,
  StudyClassDetailResponse,
  CouponListResponse,
} from '@/types/member.types';

export const memberApi = {
  // ── 내 정보 (v1) ──────────────────────────────────────────────────────
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

  getMySsoToken: () =>
    apiClient.get('/api/v1/member/my/sso/token'),

  getMyStudyClasses: (params?: { page?: number; size?: number }) =>
    apiClient.get<StudyClassListResponse>('/api/v1/member/my/study/classes', { params }),

  getMyStudyClassDetail: (class_code: string) =>
    apiClient.get<StudyClassDetailResponse>(`/api/v1/member/my/study/classes/${class_code}`),

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

  getMyBadgeFavoritesV2: () =>
    apiClient.get('/api/v2/member/my/badge/favorites'),

  getMyStudyClassesV2: (params?: { page?: number; size?: number }) =>
    apiClient.get('/api/v2/member/my/study/classes', { params }),

  getMyStudyClassDetailV2: (class_code: string) =>
    apiClient.get(`/api/v2/member/my/study/classes/${class_code}`),

  cancelOrderV2: (orderNo: string, body: { reason: string; reason_direct?: string }) =>
    apiClient.post(`/api/v2/member/my/order/${orderNo}/cancel`, body),

  getMyWebView: (webView: string) =>
    apiClient.get(`/api/v2/member/my/${webView}`),
};
