import apiClient from '@/client/apiClient';
import type {
  CouponIssueResponse,
  CouponAvailableResponse,
  CouponProductListResponse,
} from '@/types/coupon.types';

export const couponApi = {
  // swagger: coupon_code는 query param, 성공 시 201 반환
  issueCoupon: (coupon_code: string) =>
    apiClient.post<CouponIssueResponse>('/api/v2/coupon/issue', null, { params: { coupon_code } }),

  checkCouponAvailable: (params?: { coupon_code?: string }) =>
    apiClient.get<CouponAvailableResponse>('/api/v2/coupon/issue/available', { params }),

  getCouponProducts: (params?: { coupon_code?: string }) =>
    apiClient.get<CouponProductListResponse>('/api/v2/coupon/connect/product-list', { params }),
};
