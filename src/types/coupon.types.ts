import type { ApiResponse } from './api';

export interface CouponIssueBody {
  coupon_code: string;
}

// 실제 서버 응답 구조 (HTTP 201, 성공/실패 모두 동일 형태)
// 성공: { statusCode: 201, data: { isSuccess: true, result: { data: {...} } } }
// 실패: { statusCode: 400, msg: "발행 불가능한 쿠폰입니다.", data: { isSuccess: false } }
export interface CouponIssueResult {
  code: string;
  isSuccess: boolean;
  result?: {
    data: Record<string, unknown>;
    meta: null;
  };
}

export interface CouponIssueResponse {
  statusCode: number;
  msg: string;
  data: CouponIssueResult;
}

export interface CouponProduct {
  idx: number;
  title: string;
  thumbnail: string;
}

export type CouponAvailableResponse = ApiResponse<{ is_available: boolean }>;
export type CouponProductListResponse = ApiResponse<CouponProduct[]>;
