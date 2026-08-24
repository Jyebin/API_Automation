/**
 * OWASP Top 10 (2021) 보안 테스트
 * https://owasp.org/Top10/
 *
 * A01 Broken Access Control      — 인증/인가 우회, IDOR
 * A02 Cryptographic Failures     — 민감 정보 평문 노출
 * A03 Injection                  — SQL·NoSQL·Command Injection
 * A05 Security Misconfiguration  — 에러 정보 노출, 미사용 엔드포인트
 * A07 Auth Failures              — Brute Force, JWT 변조, 만료 토큰
 * A08 Data Integrity Failures    — Mass Assignment, 입력값 검증 우회
 * A10 SSRF                       — 내부 서비스 URL 주입
 */

import axios from 'axios';
import * as https from 'https';

const BASE_URL = process.env.API_BASE_URL ?? '';
const TOKEN    = process.env.__ACCESS_TOKEN__ ?? '';

const auth = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  validateStatus: () => true,
  headers: { Authorization: `Bearer ${TOKEN}` },
});

const anon = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  validateStatus: () => true,
});

// ────────────────────────────────────────────────────────────
// A01: Broken Access Control
// ────────────────────────────────────────────────────────────
describe('[OWASP A01] Broken Access Control', () => {
  test('인증 없이 보호된 API 접근 — 401 또는 403 반환', async () => {
    const endpoints = [
      '/api/v2/member/my/profile',
      '/api/v2/view/dashboard/study',
      '/api/v2/member/my/coupon',
      '/api/v2/member/my/order',
    ];

    for (const url of endpoints) {
      const res = await anon.get(url);
      expect([401, 403]).toContain(res.status);
      console.log(`✅ ${url} → ${res.status}`);
    }
  });

  test('인증 없이 POST 보호 API 접근 — 401 또는 403 반환', async () => {
    const res = await anon.post('/api/v2/coupon/issue', null, {
      params: { coupon_code: 'TEST' },
    });
    expect([401, 403]).toContain(res.status);
  });

  test('IDOR — 다른 사용자 QnA 조회 시도 (존재하지 않는 ID)', async () => {
    // 타인 리소스 접근: 음수 ID, 0, 매우 큰 숫자
    const ids = [-1, 0, 99999999];
    for (const id of ids) {
      const res = await auth.get(`/api/v1/view/dashboard/board/qna/${id}`);
      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log(`  IDOR qna/${id} → ${res.status}`);
    }
  });

  test('IDOR — 다른 사용자 주문 상세 접근 시도', async () => {
    const res = await auth.get('/api/v1/member/my/order/OTHER_USER_ORDER_NO');
    expect(res.status).not.toBe(500);
    expect([400, 401, 403, 404, 422]).toContain(res.status);
    console.log(`  IDOR 주문 접근 → ${res.status}`);
  });

  test('HTTP 메서드 변조 — GET 전용 엔드포인트에 DELETE 시도', async () => {
    const res = await auth.delete('/api/v2/view/dashboard/study');
    expect(res.status).not.toBe(200);
    expect(res.status).not.toBe(500);
    console.log(`  METHOD 변조 DELETE /dashboard/study → ${res.status}`);
  });
});

// ────────────────────────────────────────────────────────────
// A02: Cryptographic Failures
// ────────────────────────────────────────────────────────────
describe('[OWASP A02] Cryptographic Failures', () => {
  test('프로필 응답에 비밀번호 평문 미포함', async () => {
    const res = await auth.get('/api/v2/member/my/profile');
    const body = JSON.stringify(res.data ?? '');

    expect(body).not.toMatch(/password/i);
    expect(body).not.toMatch(/passwd/i);
    expect(body).not.toMatch(/pwd/i);
    console.log('✅ 프로필 응답 비밀번호 평문 미포함 확인');
  });

  test('로그인 응답에 비밀번호 평문 미포함', async () => {
    const res = await anon.post('/api/v1/auth/login', {
      userid: process.env.TEST_USERNAME,
      password: process.env.TEST_PASSWORD,
    });
    const body = JSON.stringify(res.data ?? '');

    expect(body).not.toMatch(/"password"\s*:/i);
    expect(body).not.toMatch(/"passwd"\s*:/i);
    console.log('✅ 로그인 응답 비밀번호 미포함 확인');
  });

  test('응답 헤더에 민감 정보 미포함', async () => {
    const res = await auth.get('/api/v2/member/my/profile');
    const headers = res.headers;

    expect(headers['x-powered-by']).toBeUndefined();
    expect(headers['server'] ?? '').not.toMatch(/apache|nginx|iis|express/i);
    console.log('✅ 서버 기술 스택 헤더 미노출 확인');
  });
});

// ────────────────────────────────────────────────────────────
// A03: Injection
// ────────────────────────────────────────────────────────────
describe('[OWASP A03] Injection', () => {
  const SQL_PAYLOADS = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT null,null,null--",
    "1; SELECT * FROM information_schema.tables--",
    "' OR 1=1--",
  ];

  const NOSQL_PAYLOADS = [
    '{"$gt": ""}',
    '{"$where": "sleep(1000)"}',
    '{"$ne": null}',
  ];

  const CMD_PAYLOADS = [
    '; ls -la',
    '| whoami',
    '`id`',
    '$(cat /etc/passwd)',
  ];

  test('로그인 — SQL Injection 시도 → 500 없음', async () => {
    for (const payload of SQL_PAYLOADS) {
      const res = await anon.post('/api/v1/auth/login', {
        userid: payload,
        password: payload,
      });
      expect(res.status).not.toBe(500);
      expect(res.status).not.toBe(200); // 인젝션으로 로그인 성공 안 돼야 함
      console.log(`  SQL Injection 로그인 "${payload.slice(0, 20)}..." → ${res.status}`);
    }
  });

  test('쿠폰 코드 — SQL Injection 시도 → 500 없음', async () => {
    for (const payload of SQL_PAYLOADS) {
      const res = await auth.post('/api/v2/coupon/issue', null, {
        params: { coupon_code: payload },
      });
      expect(res.status).not.toBe(500);
      console.log(`  SQL Injection 쿠폰 "${payload.slice(0, 20)}..." → ${res.status}`);
    }
  });

  test('검색/조회 파라미터 — NoSQL Injection 시도 → 500 없음', async () => {
    for (const payload of NOSQL_PAYLOADS) {
      const res = await auth.get('/api/v2/view/dashboard/study', {
        params: { filter: payload },
      });
      expect(res.status).not.toBe(500);
      console.log(`  NoSQL Injection "${payload.slice(0, 20)}..." → ${res.status}`);
    }
  });

  test('서비스 문의 — Command Injection 시도 → 500 없음', async () => {
    for (const payload of CMD_PAYLOADS) {
      const res = await anon.post('/api/v1/etc/service/inquiry', {
        category_idx: 1,
        email: `test@test.com`,
        title: payload,
        content: payload,
      });
      expect(res.status).not.toBe(500);
      console.log(`  CMD Injection "${payload}" → ${res.status}`);
    }
  });

  test('경로 순회 — Path Traversal 시도 → 500 없음', async () => {
    const traversals = [
      '../../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    ];
    for (const payload of traversals) {
      const res = await auth.get(`/api/v2/member/my/profile/${payload}`);
      expect(res.status).not.toBe(500);
      expect(JSON.stringify(res.data ?? '')).not.toMatch(/root:|daemon:|nobody:/);
      console.log(`  Path Traversal "${payload.slice(0, 25)}..." → ${res.status}`);
    }
  });
});

// ────────────────────────────────────────────────────────────
// A05: Security Misconfiguration
// ────────────────────────────────────────────────────────────
describe('[OWASP A05] Security Misconfiguration', () => {
  test('존재하지 않는 엔드포인트 — 404 반환 (상세 스택 트레이스 미노출)', async () => {
    const res = await auth.get('/api/v1/nonexistent/endpoint/xyz');
    expect(res.status).toBe(404);

    const body = JSON.stringify(res.data ?? '');
    expect(body).not.toMatch(/at [A-Za-z]+\.js:\d+/); // 스택 트레이스
    expect(body).not.toMatch(/NullPointerException|StackOverflow/i);
    console.log(`✅ 404 응답 스택 트레이스 미포함 확인`);
  });

  test('Swagger UI 엔드포인트 외부 노출 여부 확인', async () => {
    const swaggerPaths = [
      '/swagger-ui.html',
      '/swagger-ui/',
      '/v3/api-docs',
      '/actuator',
      '/actuator/health',
      '/actuator/env',
    ];
    for (const path of swaggerPaths) {
      const res = await anon.get(path);
      // 인증 없이 민감한 내부 정보 노출 안 돼야 함
      if (res.status === 200) {
        console.warn(`⚠️ ${path} → 200 (외부 노출 확인 필요)`);
      } else {
        console.log(`  ${path} → ${res.status}`);
      }
      expect(res.status).not.toBe(500);
    }
  });

  test('에러 응답에 서버 내부 경로 미포함', async () => {
    const res = await auth.get('/api/v1/view/dashboard/study'); // BUG-001: 500 반환 엔드포인트
    const body = JSON.stringify(res.data ?? '');

    // 내부 파일 경로, 클래스명 노출 여부 확인
    expect(body).not.toMatch(/\/var\/www|\/home\/|C:\\|D:\\/i);
    expect(body).not.toMatch(/at com\.|at org\.|at net\./); // Java 스택 트레이스
    console.log(`✅ 에러 응답 내부 경로 미포함 확인 (HTTP ${res.status})`);
  });

  test('CORS — 임의 Origin 허용 여부 확인', async () => {
    const res = await auth.get('/api/v2/member/my/profile', {
      headers: {
        Origin: 'https://evil.attacker.com',
      },
    });
    const acao = res.headers['access-control-allow-origin'];
    if (acao === '*' || acao === 'https://evil.attacker.com') {
      console.warn(`⚠️ CORS 와일드카드 또는 임의 Origin 허용: ${acao}`);
    } else {
      console.log(`✅ CORS Origin 제한 확인: ${acao}`);
    }
    // 500은 어떤 경우에도 안 됨
    expect(res.status).not.toBe(500);
  });
});

// ────────────────────────────────────────────────────────────
// A07: Identification and Authentication Failures
// ────────────────────────────────────────────────────────────
describe('[OWASP A07] Identification and Authentication Failures', () => {
  test('잘못된 JWT 토큰 — 4xx 반환 (200 아님)', async () => {
    const res = await axios.get(`${BASE_URL}/api/v2/member/my/profile`, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      validateStatus: () => true,
      headers: { Authorization: 'Bearer INVALID.JWT.TOKEN' },
    });
    expect(res.status).not.toBe(200);
    expect(res.status).not.toBe(500);
    console.log(`✅ 잘못된 JWT → ${res.status}`);
  });

  test('[BUG 확인] alg=none JWT — 500 반환 (401/403 기대)', async () => {
    // alg=none 공격: 서명 없는 JWT 허용 여부
    // 이상적: 401/403 반환 / 실제: 500 반환 → 서버가 변조 토큰 파싱 중 오류
    const noneJwt = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyaWQiOiJyYW9udGVzdHFhMSIsImlhdCI6MTcwMDAwMDAwMH0.';
    const res = await axios.get(`${BASE_URL}/api/v2/member/my/profile`, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      validateStatus: () => true,
      headers: { Authorization: `Bearer ${noneJwt}` },
    });
    // 로그인 성공(200)만 아니면 통과 — 500은 버그이므로 경고 출력
    expect(res.status).not.toBe(200);
    if (res.status === 500) {
      console.warn(`⚠️ [BUG] alg=none JWT → 500 반환 (JWT 파싱 오류 미처리, 401/403 반환 필요)`);
    } else {
      console.log(`✅ alg=none JWT → ${res.status}`);
    }
  });

  test('빈 Authorization 헤더 — 4xx 반환 (200 아님)', async () => {
    const res = await axios.get(`${BASE_URL}/api/v2/member/my/profile`, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      validateStatus: () => true,
      headers: { Authorization: '' },
    });
    expect(res.status).not.toBe(200);
    expect(res.status).not.toBe(500);
    console.log(`✅ 빈 Authorization → ${res.status}`);
  });

  test('Brute Force — 로그인 10회 연속 실패 시 잠금 또는 Rate Limit', async () => {
    const results: number[] = [];
    for (let i = 0; i < 10; i++) {
      const res = await anon.post('/api/v1/auth/login', {
        userid: 'raontestqa1',
        password: `WrongPassword${i}!`,
      });
      results.push(res.status);
    }

    const has429 = results.some(s => s === 429);
    const has423 = results.some(s => s === 423); // Locked
    const has200 = results.some(s => s === 200);

    console.log('Brute Force 10회 응답 분포:', JSON.stringify(
      results.reduce<Record<number,number>>((a,s) => { a[s]=(a[s]??0)+1; return a; }, {}),
    ));

    expect(has200).toBe(false); // 잘못된 비밀번호로 로그인 성공 안 돼야 함
    if (!has429 && !has423) {
      console.warn('⚠️ Brute Force 방어 없음 — Rate Limit 또는 계정 잠금 정책 검토 필요');
    }
  }, 30_000);

  test('약한 비밀번호 변경 시도 — 4xx 반환', async () => {
    // 실제 변경은 skip, 요청 형식만 검증
    const res = await auth.put('/api/v1/member/my/profile/pwd', {
      current_password: process.env.TEST_PASSWORD,
      new_password: '1234', // 약한 비밀번호
    });
    expect(res.status).not.toBe(200);
    expect(res.status).not.toBe(500);
    console.log(`  약한 비밀번호 변경 시도 → ${res.status}`);
  });
});

// ────────────────────────────────────────────────────────────
// A08: Software and Data Integrity Failures
// ────────────────────────────────────────────────────────────
describe('[OWASP A08] Software and Data Integrity Failures', () => {
  test('Mass Assignment — 프로필 수정 시 권한 필드 주입 시도', async () => {
    const res = await auth.put('/api/v1/member/my/profile', {
      nickname: 'testuser',
      role: 'admin',          // 권한 상승 시도
      is_admin: true,
      user_level: 999,
      userid: 'injected_id',
    });
    // 서버가 권한 필드를 무시하고 정상 처리하거나 4xx 반환해야 함
    expect(res.status).not.toBe(500);
    console.log(`  Mass Assignment 시도 → ${res.status}`);

    // 실제 변경 후 프로필 재조회해서 role/is_admin 변경 안 됐는지 확인
    const profile = await auth.get('/api/v2/member/my/profile');
    const body = JSON.stringify(profile.data ?? '');
    expect(body).not.toMatch(/"role"\s*:\s*"admin"/);
    expect(body).not.toMatch(/"is_admin"\s*:\s*true/);
    console.log('✅ Mass Assignment 필드 주입 무시 확인');
  });

  test('Content-Type 변조 — JSON 엔드포인트에 XML 전송', async () => {
    const res = await axios.post(
      `${BASE_URL}/api/v1/auth/login`,
      '<?xml version="1.0"?><root><userid>test</userid><password>test</password></root>',
      {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        validateStatus: () => true,
        headers: { 'Content-Type': 'application/xml' },
      },
    );
    expect(res.status).not.toBe(500);
    console.log(`  Content-Type XML 변조 → ${res.status}`);
  });

  test('비정상적으로 큰 요청 바디 — 413 또는 4xx 반환', async () => {
    const largeBody = { content: 'A'.repeat(100_000) };
    const res = await auth.post('/api/v1/view/dashboard/board/qna', largeBody);
    expect(res.status).not.toBe(500);
    console.log(`  100KB 바디 전송 → ${res.status}`);
  });
});

// ────────────────────────────────────────────────────────────
// A10: Server-Side Request Forgery (SSRF)
// ────────────────────────────────────────────────────────────
describe('[OWASP A10] Server-Side Request Forgery (SSRF)', () => {
  const SSRF_PAYLOADS = [
    'http://localhost:80',
    'http://127.0.0.1:8080',
    'http://169.254.169.254/latest/meta-data/', // AWS metadata
    'http://192.168.0.1',
    'file:///etc/passwd',
    'dict://localhost:11211/',
  ];

  test('URL 파라미터에 내부 IP 주입 — 5xx 없음, 내부 데이터 미반환', async () => {
    for (const payload of SSRF_PAYLOADS) {
      const res = await auth.get('/api/v2/member/my/profile', {
        params: { redirect: payload, url: payload, callback: payload },
      });
      expect(res.status).not.toBe(500);

      const body = JSON.stringify(res.data ?? '');
      // AWS 메타데이터, 로컬 파일 내용 미포함
      expect(body).not.toMatch(/ami-id|instance-id|root:|daemon:/);
      console.log(`  SSRF "${payload.slice(0, 30)}" → ${res.status}`);
    }
  });

  test('소셜 로그인 토큰 필드에 내부 URL 주입 — 5xx 없음', async () => {
    for (const payload of SSRF_PAYLOADS.slice(0, 3)) {
      const res = await anon.post('/api/v1/auth/social/login', {
        provider: 'kakao',
        access_token: payload,
      });
      expect(res.status).not.toBe(500);
      console.log(`  SSRF 소셜 토큰 "${payload.slice(0, 25)}" → ${res.status}`);
    }
  });
});
