export interface PageInfo {
  total_size: number;
  request_size: number;
  total_pages: number;
  request_page: number;
}

export interface ApiResponse<T = unknown> {
  status_code: number;
  code: string;
  msg: string;
  detail: string;
  content?: T;
  page_info?: PageInfo;
}

export interface ApiResponseV2<T = unknown> {
  statusCode: number;
  msg: string;
  data: {
    code: string;
    isSuccess: boolean;
    result: T;
  };
}

export interface TokenContent {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
}

export type LoginResponse = ApiResponse<TokenContent>;
