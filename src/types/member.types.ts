import type { ApiResponse } from './api';

export interface MemberBelonging {
  organization: string;
  clno: string;
  scnm: string;
  colg: string;
  dept: string;
  majr: string;
}

export interface MyProfile {
  userid: string;
  nickname: string;
  username: string;
  birth: string;
  phone: string;
  email: string;
  recv_sms: string;
  recv_email: string;
  type: string;
  group: string;
  belonging: MemberBelonging;
  is_idt_vrf: string;
  social_provider: string;
}

export interface OthersProfile {
  nickname: string;
  type: string;
  group: string;
  belonging?: MemberBelonging;
}

export interface OrderPaymentMethod {
  is_easypay: boolean;
  type: string;
  value_1: string;
  value_2: string;
  approved_at: string;
}

export interface OrderCancel {
  date: string;
  reason: string;
  reason_direct: string;
}

export interface OrderOption {
  idx: number;
  name: string;
  amt: number;
  count: number;
  is_contents_subs: boolean;
  contents_subs_started_at: string;
  contents_subs_ended_at: string;
}

export interface Order {
  order_no: string;
  payment_date: string;
  contents_id: string;
  contents_title: string;
  contents_thumbnail: string;
  total_amt: string;
  options: OrderOption[];
  order_status: string;
  payment_method: OrderPaymentMethod;
  order_cancel: OrderCancel;
}

export interface StudyContentsDetail {
  number: number;
  title: string;
  count: number;
  percentage: number;
  completed: string;
  completed_at: string;
  last_learning_at: string;
}

export interface StudyContents {
  idx: number;
  title: string;
  description: string;
  curriculum: { count: number; detail: StudyContentsDetail[] };
}

export interface StudyClass {
  code: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  contents: StudyContents[];
}

export interface CancelReason {
  code: string;
  name: string;
}

export interface WithdrawalReason {
  code: string;
  name: string;
}

export interface BadgeFavorite {
  idx: number;
  name: string;
  image: string;
}

export interface Coupon {
  idx: number;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  expire_date: string;
  is_used: boolean;
}

export type MyProfileResponse = ApiResponse<MyProfile>;
export type OthersProfileResponse = ApiResponse<OthersProfile>;
export type OrderListResponse = ApiResponse<Order[]>;
export type OrderDetailResponse = ApiResponse<Order>;
export type CancelReasonListResponse = ApiResponse<CancelReason[]>;
export type WithdrawalReasonListResponse = ApiResponse<WithdrawalReason[]>;
export type StudyClassListResponse = ApiResponse<StudyClass[]>;
export type StudyClassDetailResponse = ApiResponse<StudyClass>;
export type BadgeFavoriteListResponse = ApiResponse<BadgeFavorite[]>;
export type CouponListResponse = ApiResponse<Coupon[]>;
export type WebViewUrlResponse = ApiResponse<{ url: string }>;
