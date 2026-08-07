import type { ApiResponse } from './api';

export interface TokenRenewalContent {
  token_type: string;
  access_token: string;
  expires_in: number;
}

export interface FindIdResult {
  userid: string;
}

export interface DuplicateCheckParams {
  type: 'email' | 'userid';
  value: string;
}

export type TokenRenewalResponse = ApiResponse<TokenRenewalContent>;
export type FindIdResponse = ApiResponse<FindIdResult>;
export type DuplicateCheckResponse = ApiResponse<{ is_exist: boolean }>;
export type TokenValidityResponse = ApiResponse<{ expires_in: number }>;
