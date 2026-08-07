import type { ApiResponse } from './api';

export interface CouponIssueBody {
  coupon_code: string;
}

export interface IssuedCoupon {
  idx: number;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  expire_date: string;
}

export interface CouponProduct {
  idx: number;
  title: string;
  thumbnail: string;
}

export type CouponIssueResponse = ApiResponse<IssuedCoupon>;
export type CouponAvailableResponse = ApiResponse<{ is_available: boolean }>;
export type CouponProductListResponse = ApiResponse<CouponProduct[]>;
