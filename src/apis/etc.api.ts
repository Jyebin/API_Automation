import apiClient from '@/client/apiClient';
import type {
  PingResponse,
  ServiceQnaCategoryListResponse,
  ManualCategoryListResponse,
  ManualListResponse,
  ManualDetailResponse,
  NpcInfoResponse,
  SlangListResponse,
  MainContentsListResponse,
  ExamListResponse,
  ExamDetailResponse,
  ServiceQnaBody,
} from '@/types/etc.types';

export const etcApi = {
  // ── 서버 상태 ─────────────────────────────────────────────────────────
  ping: () =>
    apiClient.get<PingResponse>('/api/v2/etc/ping'),

  // ── 서비스 문의 (v1, PUBLIC) ──────────────────────────────────────────
  getServiceQnaCategories: () =>
    apiClient.get<ServiceQnaCategoryListResponse>('/api/v1/service/qna/category'),

  createServiceQna: (body: ServiceQnaBody) =>
    apiClient.post('/api/v1/service/qna', body),

  // ── 단체 문의 (v2, PUBLIC) ────────────────────────────────────────────
  createGroupInquiry: (body: Record<string, unknown>) =>
    apiClient.post('/api/v2/etc/service/group', body),

  // ── 메일 발송 (v2, PUBLIC) ────────────────────────────────────────────
  sendEmail: (body: { to: string; subject: string; content: string }) =>
    apiClient.post('/api/v2/etc/email/send', body),

  // ── 매뉴얼 (v1, PUBLIC) ───────────────────────────────────────────────
  getManualCategories: () =>
    apiClient.get<ManualCategoryListResponse>('/api/v1/manual/category'),

  getManuals: (params?: { page?: number; size?: number; category?: string }) =>
    apiClient.get<ManualListResponse>('/api/v1/manual', { params }),

  getManualDetail: (id: number | string) =>
    apiClient.get<ManualDetailResponse>(`/api/v1/manual/${id}`),

  // ── 기타 (v2) ─────────────────────────────────────────────────────────
  getNpcInfo: () =>
    apiClient.get<NpcInfoResponse>('/api/v2/etc/npc/info'),

  getSlangList: () =>
    apiClient.get<SlangListResponse>('/api/v2/etc/slang'),

  // ── 시험 (v2, PUBLIC) ─────────────────────────────────────────────────
  getClientExams: () =>
    apiClient.get<ExamListResponse>('/api/v2/client/exam'),

  getExams: () =>
    apiClient.get<ExamListResponse>('/api/v1/exam'),

  getExamDetail: (exam_id: number | string) =>
    apiClient.get<ExamDetailResponse>(`/api/v1/exam/${exam_id}`),

  // ── 메인 페이지 콘텐츠 (v2, AUTH) ────────────────────────────────────
  getMainContents: () =>
    apiClient.get<MainContentsListResponse>('/api/v2/client/mainpage/contents'),

  getMainRecommend: () =>
    apiClient.get<MainContentsListResponse>('/api/v2/client/mainpage/recommend'),

  // ── 비속어 (v2, PUBLIC) ───────────────────────────────────────────────
  recaptchaVerify: (token: string) =>
    apiClient.post('/api/v1/recaptcha', { token }),
};
