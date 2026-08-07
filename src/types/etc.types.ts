import type { ApiResponse } from './api';

export interface ServiceQnaCategory {
  code: string;
  name: string;
}

export interface ServiceQnaBody {
  category: string;
  title: string;
  content: string;
  name: string;
  email: string;
  phone?: string;
}

export interface ManualCategory {
  code: string;
  name: string;
}

export interface Manual {
  idx: number;
  category: string;
  title: string;
  description: string;
  created_at: string;
}

export interface NpcInfo {
  name: string;
  message: string;
  image: string;
}

export interface SlangWord {
  word: string;
}

export interface MainContents {
  idx: number;
  title: string;
  thumbnail: string;
}

export interface ExamItem {
  idx: number;
  title: string;
  start_date: string;
  end_date: string;
}

export type PingResponse = ApiResponse<{ status: string }>;
export type ServiceQnaCategoryListResponse = ApiResponse<ServiceQnaCategory[]>;
export type ManualCategoryListResponse = ApiResponse<ManualCategory[]>;
export type ManualListResponse = ApiResponse<Manual[]>;
export type ManualDetailResponse = ApiResponse<Manual>;
export type NpcInfoResponse = ApiResponse<NpcInfo>;
export type SlangListResponse = ApiResponse<SlangWord[]>;
export type MainContentsListResponse = ApiResponse<MainContents[]>;
export type ExamListResponse = ApiResponse<ExamItem[]>;
export type ExamDetailResponse = ApiResponse<ExamItem>;
