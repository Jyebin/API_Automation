// @ts-check
'use strict';

const fs   = require('fs');
const path = require('path');

const DATA_LOG = path.resolve(process.cwd(), '.test-run-data.json');

/** testName → ApiCallLog[] 맵 빌드 */
function loadApiCallMap() {
  try {
    const raw = fs.readFileSync(DATA_LOG, 'utf8');
    const arr = JSON.parse(raw);
    const map = new Map();
    for (const entry of arr) {
      const key = entry.testName ?? 'unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(entry);
    }
    return map;
  } catch {
    return new Map();
  }
}

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', 'Malgun Gothic', sans-serif; background: #f4f6fa; color: #1a1a2e; font-size: 14px; line-height: 1.6; }
  .page { max-width: 1300px; margin: 0 auto; padding: 32px 24px; }

  /* ── Header ── */
  .report-header { background: linear-gradient(135deg, #1e3a5f 0%, #16213e 100%); color: #fff; border-radius: 12px; padding: 36px 40px; margin-bottom: 32px; }
  .report-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  .report-header .meta { opacity: .75; font-size: 13px; margin-top: 6px; }
  .report-header .meta span { margin-right: 24px; }

  /* ── Summary cards ── */
  .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 32px; }
  .card { background: #fff; border-radius: 10px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  .card .num { font-size: 36px; font-weight: 700; }
  .card .lbl { font-size: 12px; color: #666; margin-top: 4px; }
  .card.total .num { color: #1e3a5f; }
  .card.pass  .num { color: #2e7d32; }
  .card.fail  .num { color: #c62828; }
  .card.skip  .num { color: #e65100; }
  .card.suite .num { color: #6a1b9a; }

  h2 { font-size: 20px; font-weight: 600; margin: 40px 0 16px; padding-left: 12px; border-left: 4px solid #1e3a5f; }

  /* ── Suite card ── */
  .suite-card { background: #fff; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.06); overflow: hidden; }
  .suite-card-header { display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer; user-select: none; }
  .suite-card-header:hover { background: #f9f9f9; }
  .suite-path { font-family: 'Consolas', monospace; font-size: 13px; color: #1e3a5f; font-weight: 600; flex: 1; }
  .suite-badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 12px; white-space: nowrap; }
  .badge-pass { background: #e8f5e9; color: #2e7d32; }
  .badge-fail { background: #ffebee; color: #c62828; }
  .badge-skip { background: #fff3e0; color: #e65100; }
  .suite-time { font-size: 12px; color: #aaa; }
  .toggle-icon { font-size: 12px; color: #aaa; transition: transform .2s; }
  .suite-card[open] .toggle-icon { transform: rotate(180deg); }

  .suite-card-body { padding: 0 20px 16px; }

  /* ── Test table ── */
  .test-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }
  .test-table th { background: #f5f7ff; padding: 8px 12px; text-align: left; border-bottom: 2px solid #e0e0e0; color: #555; font-size: 12px; }
  .test-table td { padding: 8px 12px; border-bottom: 1px solid #f3f3f3; vertical-align: top; }
  .test-table tr:last-child td { border-bottom: none; }
  .test-table tr.row-fail { background: #fff8f8; }
  .test-table tr.row-skip { background: #fffbf5; }

  /* ── API call data ── */
  .api-calls { margin-top: 6px; display: flex; flex-direction: column; gap: 5px; }
  .api-call { background: #f8faff; border: 1px solid #e0e8ff; border-radius: 6px; overflow: hidden; font-size: 12px; }
  .api-call-header { display: flex; align-items: center; gap: 8px; padding: 5px 10px; background: #eef2ff; border-bottom: 1px solid #e0e8ff; font-family: 'Consolas', monospace; }
  .method { font-weight: 700; font-size: 11px; padding: 2px 6px; border-radius: 3px; color: #fff; white-space: nowrap; }
  .method-GET    { background: #2e7d32; }
  .method-POST   { background: #1565c0; }
  .method-PUT    { background: #e65100; }
  .method-DELETE { background: #c62828; }
  .method-PATCH  { background: #6a1b9a; }
  .api-url { color: #1e3a5f; font-weight: 500; font-size: 12px; word-break: break-all; flex: 1; }
  .api-status { font-weight: 700; font-size: 11px; padding: 2px 6px; border-radius: 3px; white-space: nowrap; }
  .status-2xx { background: #e8f5e9; color: #2e7d32; }
  .status-4xx { background: #fff3e0; color: #e65100; }
  .status-5xx { background: #ffebee; color: #c62828; }
  .api-dur  { font-size: 11px; color: #aaa; white-space: nowrap; }
  .api-call-body { padding: 6px 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .api-call-body.single { grid-template-columns: 1fr; }
  .data-block { font-size: 11px; }
  .data-label { font-weight: 700; color: #888; font-size: 10px; letter-spacing: .5px; margin-bottom: 2px; }
  .data-content { font-family: 'Consolas', monospace; background: #fff; border: 1px solid #eee; border-radius: 3px; padding: 5px 7px; white-space: pre-wrap; word-break: break-all; max-height: 120px; overflow-y: auto; color: #333; }

  .status-pass { color: #2e7d32; font-weight: 700; white-space: nowrap; }
  .status-fail { color: #c62828; font-weight: 700; white-space: nowrap; }
  .status-skip { color: #e65100; font-weight: 700; white-space: nowrap; }

  .test-name { font-weight: 500; }
  .test-name .suite-prefix { color: #888; font-weight: 400; }

  /* ── Failure detail ── */
  .fail-detail { margin-top: 6px; }
  .diff-row { display: flex; gap: 8px; margin-top: 4px; font-size: 12px; font-family: 'Consolas', monospace; }
  .diff-expected { background: #e8f5e9; color: #1b5e20; padding: 3px 8px; border-radius: 4px; border-left: 3px solid #2e7d32; flex: 1; white-space: pre-wrap; word-break: break-all; }
  .diff-received { background: #ffebee; color: #b71c1c; padding: 3px 8px; border-radius: 4px; border-left: 3px solid #c62828; flex: 1; white-space: pre-wrap; word-break: break-all; }
  .fail-raw { font-family: 'Consolas', monospace; font-size: 11.5px; background: #fff5f5; border: 1px solid #ffd0d0; border-radius: 4px; padding: 8px 10px; white-space: pre-wrap; word-break: break-all; color: #b71c1c; margin-top: 4px; max-height: 200px; overflow-y: auto; }

  /* ── Console log ── */
  .console-block { margin-top: 14px; border-top: 1px dashed #e0e0e0; padding-top: 10px; }
  .console-label { font-size: 11px; font-weight: 700; color: #888; margin-bottom: 6px; letter-spacing: .5px; }
  .console-line { display: flex; gap: 8px; align-items: flex-start; font-family: 'Consolas', monospace; font-size: 12px; padding: 2px 0; border-bottom: 1px solid #f8f8f8; }
  .console-line:last-child { border-bottom: none; }
  .console-type-log  { color: #555; }
  .console-type-warn { color: #e65100; }
  .console-type-error{ color: #c62828; }
  .console-type-info { color: #0d47a1; }
  .console-badge { font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 3px; white-space: nowrap; margin-top: 2px; }
  .cb-log   { background: #f0f0f0; color: #555; }
  .cb-warn  { background: #fff3e0; color: #e65100; }
  .cb-error { background: #ffebee; color: #c62828; }
  .cb-info  { background: #e3f2fd; color: #0d47a1; }
  .console-msg { flex: 1; white-space: pre-wrap; word-break: break-all; }

  /* ── Cause / env tables ── */
  .cause-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.06); margin-bottom: 32px; }
  .cause-table th { background: #1e3a5f; color: #fff; padding: 10px 16px; text-align: left; }
  .cause-table td { padding: 9px 16px; border-bottom: 1px solid #f0f0f0; }
  .cause-table tr:last-child td { border-bottom: none; }

  code { font-family: 'Consolas', monospace; background: #f4f6fa; padding: 1px 5px; border-radius: 3px; font-size: 12.5px; }
  .footer { text-align: center; font-size: 12px; color: #aaa; margin-top: 48px; padding-top: 20px; border-top: 1px solid #e8e8e8; }

  details > summary { list-style: none; }
  details > summary::-webkit-details-marker { display: none; }
`;

class HtmlReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options      = options || {};
    this._outputPath   = this._options.outputPath || 'test-report.html';
  }

  onRunComplete(_contexts, results) {
    const html = this._build(results);
    const out  = path.resolve(this._globalConfig.rootDir, this._outputPath);
    fs.writeFileSync(out, html, 'utf8');
    console.log(`\n📄 테스트 결과서 저장: ${out}`);
  }

  // ─────────────────────────────────────────────────────────
  _build(results) {
    this._apiCallMap = loadApiCallMap();
    const now     = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const total   = results.numTotalTests;
    const passed  = results.numPassedTests;
    const failed  = results.numFailedTests;
    const skipped = results.numPendingTests + results.numTodoTests;
    const totalSuites  = results.numTotalTestSuites;
    const failedSuites = results.numFailedTestSuites;
    const elapsed = (results.testResults.reduce(
      (s, r) => s + ((r.perfStats?.end ?? 0) - (r.perfStats?.start ?? 0)), 0,
    ) / 1000).toFixed(1);

    const suites = results.testResults
      .slice()
      .sort((a, b) => (b.numFailingTests > 0 ? 1 : 0) - (a.numFailingTests > 0 ? 1 : 0));

    const suiteSections = suites.map((s, i) => this._buildSuiteCard(s, i)).join('\n');
    const envTable      = this._buildEnvTable(now, elapsed, total, totalSuites);

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>API 자동화 테스트 결과서 — Metademy</title>
  <style>${CSS}</style>
</head>
<body>
<div class="page">

  <div class="report-header">
    <h1>API 자동화 테스트 결과서</h1>
    <p style="opacity:.8;margin-top:6px;">대상 서버: ${esc(process.env.API_BASE_URL || 'https://metademy.raonsecure.co.kr:38000')}</p>
    <div class="meta">
      <span>실행일시: ${now}</span>
      <span>프레임워크: Jest + ts-jest + axios</span>
      <span>인증 계정: ${esc(process.env.TEST_USERNAME || 'raontestqa1')}</span>
    </div>
  </div>

  <div class="summary-grid">
    <div class="card total"><div class="num">${total}</div><div class="lbl">전체 테스트</div></div>
    <div class="card pass" ><div class="num">${passed}</div><div class="lbl">통과</div></div>
    <div class="card fail" ><div class="num">${failed}</div><div class="lbl">실패</div></div>
    <div class="card skip" ><div class="num">${skipped}</div><div class="lbl">스킵</div></div>
    <div class="card suite"><div class="num">${failedSuites} / ${totalSuites}</div><div class="lbl">실패 스위트</div></div>
  </div>

  <h2>테스트 스위트 상세 결과</h2>
  ${suiteSections}

  <h2>테스트 환경</h2>
  ${envTable}

  <div class="footer">
    API 자동화 테스트 결과서 · 실행일시: ${now} · 도구: Jest + axios (API_Automation 프로젝트)
  </div>

</div>
<script>
  document.querySelectorAll('.suite-card-header').forEach(h => {
    h.addEventListener('click', () => {
      const card = h.closest('details');
      // toggle handled natively by <details>
    });
  });
</script>
</body>
</html>`;
  }

  // ─────────────────────────────────────────────────────────
  _buildSuiteCard(suite, idx) {
    const rel      = path.relative(process.cwd(), suite.testFilePath).replace(/\\/g, '/');
    const tests    = suite.testResults || [];
    const passN    = tests.filter(t => t.status === 'passed').length;
    const failN    = tests.filter(t => t.status === 'failed').length;
    const skipN    = tests.filter(t => t.status === 'pending' || t.status === 'todo').length;
    const elapsed  = suite.perfStats
      ? ((suite.perfStats.end - suite.perfStats.start) / 1000).toFixed(2)
      : '—';
    const icon     = failN > 0 ? '❌' : '✅';
    const badgeCls = failN > 0 ? 'badge-fail' : 'badge-pass';
    const badgeTxt = failN > 0 ? `실패 ${failN}건 포함` : `전체 통과`;
    const openAttr = failN > 0 ? 'open' : '';   // 실패 스위트는 기본 펼침

    const rows = tests.map((t, i) => this._buildTestRow(t, i)).join('\n');
    const consoleLogs = this._buildConsoleLogs(suite.console || []);

    return `
<details class="suite-card" ${openAttr} id="suite-${idx}">
  <summary class="suite-card-header">
    <span style="font-size:16px;">${icon}</span>
    <span class="suite-path">${esc(rel)}</span>
    <span class="suite-badge ${badgeCls}">${badgeTxt}</span>
    <span class="suite-badge badge-pass" style="background:#e8eaf6;color:#283593;">통과 ${passN}</span>
    ${skipN > 0 ? `<span class="suite-badge badge-skip">스킵 ${skipN}</span>` : ''}
    <span class="suite-time">${elapsed}s</span>
    <span class="toggle-icon">▼</span>
  </summary>
  <div class="suite-card-body">
    <table class="test-table">
      <thead>
        <tr>
          <th style="width:4%">#</th>
          <th style="width:46%">테스트 항목 (입력 데이터 / 기대 결과 포함)</th>
          <th style="width:8%">소요시간</th>
          <th style="width:7%">결과</th>
          <th style="width:35%">테스트 데이터 (요청 / 응답) · 오류 상세</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    ${consoleLogs}
  </div>
</details>`;
  }

  // ─────────────────────────────────────────────────────────
  _buildTestRow(t, rowIdx) {
    const status   = t.status; // 'passed' | 'failed' | 'pending' | 'todo'
    const rowCls   = status === 'failed' ? 'row-fail' : status !== 'passed' ? 'row-skip' : '';
    const stCls    = status === 'passed' ? 'status-pass' : status === 'failed' ? 'status-fail' : 'status-skip';
    const stLabel  = status === 'passed' ? '✅ PASS' : status === 'failed' ? '❌ FAIL' : '⏭ SKIP';
    const duration = `${t.duration ?? 0}ms`;

    // 테스트명: describe 경로 + 테스트 제목
    const ancestors = (t.ancestorTitles || []).join(' › ');
    const title     = t.title || t.fullName || '';
    const fullTitle = ancestors
      ? `<span class="suite-prefix">${esc(ancestors)} › </span>${esc(title)}`
      : esc(title);

    // API 호출 데이터
    const apiCalls = this._apiCallMap
      ? (this._apiCallMap.get(t.fullName) || this._apiCallMap.get(t.title) || [])
      : [];
    const apiCallsHtml = this._buildApiCalls(apiCalls);

    // 실패/결과 상세
    let detailCell = '';
    if (status === 'failed') {
      detailCell = apiCallsHtml + this._buildFailDetail(t.failureMessages || []);
    } else if (status === 'passed') {
      detailCell = apiCallsHtml;
    } else {
      detailCell = `<span style="color:#e65100;font-size:12px;">테스트 스킵됨</span>`;
    }

    return `<tr class="${rowCls}">
      <td style="color:#aaa;font-size:12px;">${(rowIdx ?? 0) + 1}</td>
      <td class="test-name">${fullTitle}</td>
      <td style="color:#888;font-size:12px;">${duration}</td>
      <td class="${stCls}">${stLabel}</td>
      <td>${detailCell}</td>
    </tr>`;
  }

  // ─────────────────────────────────────────────────────────
  _buildApiCalls(calls) {
    if (!calls || calls.length === 0) return '';

    const items = calls.map(c => {
      const method    = (c.method || 'GET').toUpperCase();
      const methodCls = `method-${method}`;
      const statusCls = c.statusCode >= 500 ? 'status-5xx'
                      : c.statusCode >= 400 ? 'status-4xx'
                      : 'status-2xx';
      const url = esc(String(c.url || '').replace(/^https?:\/\/[^/]+/, ''));

      // 요청 데이터 구성
      const reqParts = [];
      if (c.params && Object.keys(c.params).length > 0) {
        reqParts.push(`Query: ${JSON.stringify(c.params, null, 2)}`);
      }
      if (c.requestBody !== null && c.requestBody !== undefined) {
        reqParts.push(`Body: ${JSON.stringify(c.requestBody, null, 2)}`);
      }
      const reqStr = reqParts.join('\n') || '(없음)';
      const resStr = c.responseBody !== undefined
        ? JSON.stringify(c.responseBody, null, 2)
        : '(없음)';

      const hasBoth = reqParts.length > 0;

      return `<div class="api-call">
        <div class="api-call-header">
          <span class="method ${methodCls}">${method}</span>
          <span class="api-url">${url}</span>
          <span class="api-status ${statusCls}">${c.statusCode}</span>
          <span class="api-dur">${c.durationMs}ms</span>
        </div>
        <div class="api-call-body${hasBoth ? '' : ' single'}">
          ${hasBoth ? `<div class="data-block">
            <div class="data-label">📤 요청 데이터</div>
            <pre class="data-content">${esc(reqStr)}</pre>
          </div>` : ''}
          <div class="data-block">
            <div class="data-label">📥 응답 데이터</div>
            <pre class="data-content">${esc(resStr)}</pre>
          </div>
        </div>
      </div>`;
    }).join('\n');

    return `<div class="api-calls">${items}</div>`;
  }

  // ─────────────────────────────────────────────────────────
  _buildFailDetail(messages) {
    if (!messages.length) return '';

    const raw    = messages.join('\n');
    const parsed = parseJestDiff(raw);

    if (parsed) {
      return `<div class="fail-detail">
        <div style="font-size:11px;color:#888;margin-bottom:4px;">기대값 vs 실제값</div>
        <div class="diff-row">
          <div class="diff-expected"><strong>기대 (Expected)</strong><br>${esc(parsed.expected)}</div>
          <div class="diff-received"><strong>실제 (Received)</strong><br>${esc(parsed.received)}</div>
        </div>
        <details style="margin-top:6px;">
          <summary style="font-size:11px;color:#aaa;cursor:pointer;">▶ 전체 오류 메시지</summary>
          <pre class="fail-raw">${esc(raw.slice(0, 3000))}</pre>
        </details>
      </div>`;
    }

    return `<pre class="fail-raw">${esc(raw.slice(0, 1500))}</pre>`;
  }

  // ─────────────────────────────────────────────────────────
  _buildConsoleLogs(consoleLogs) {
    if (!consoleLogs || consoleLogs.length === 0) return '';

    const lines = consoleLogs.map(entry => {
      const type    = entry.type || 'log';
      const badgeCls = `cb-${type}`;
      const msgCls   = `console-type-${type}`;
      const origin   = entry.origin
        ? path.relative(process.cwd(), entry.origin.split(':')[0]).replace(/\\/g, '/')
        : '';
      const lineNo   = entry.origin ? entry.origin.split(':')[1] : '';
      const originStr = origin && lineNo ? `${origin}:${lineNo}` : '';

      return `<div class="console-line">
        <span class="console-badge ${badgeCls}">${type.toUpperCase()}</span>
        <span class="console-msg ${msgCls}">${esc(String(entry.message || ''))}</span>
        ${originStr ? `<span style="font-size:10px;color:#ccc;white-space:nowrap;">${esc(originStr)}</span>` : ''}
      </div>`;
    }).join('\n');

    return `<div class="console-block">
      <div class="console-label">📋 실행 로그 (console output)</div>
      ${lines}
    </div>`;
  }

  // ─────────────────────────────────────────────────────────
  _buildEnvTable(now, elapsed, total, totalSuites) {
    const baseUrl = process.env.API_BASE_URL || 'https://metademy.raonsecure.co.kr:38000';
    const rows = [
      ['대상 서버',   baseUrl],
      ['인증 계정',   `${process.env.TEST_USERNAME || 'raontestqa1'} — JWT 발급용`],
      ['테스트 이메일', process.env.TEST_EMAIL || 'yenbin03223@gmail.com'],
      ['프레임워크',  'Jest 29 + ts-jest + axios'],
      ['실행 방식',   'maxWorkers: 1 (직렬 실행)'],
      ['인증 방식',   'globalSetup 1회 로그인 → JWT Bearer 토큰 전역 공유'],
      ['총 테스트 수', `${total}개 (${totalSuites}개 스위트)`],
      ['실행 일시',   now],
      ['총 실행 시간', `약 ${elapsed}초`],
    ].map(([k, v]) => `<tr><td><strong>${esc(String(k))}</strong></td><td>${esc(String(v))}</td></tr>`).join('\n');

    return `<table class="cause-table"><tr><th>항목</th><th>내용</th></tr>${rows}</table>`;
  }
}

// ── helpers ─────────────────────────────────────────────────

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Jest diff 메시지에서 Expected / Received 추출 */
function parseJestDiff(raw) {
  const expMatch = raw.match(/Expected(?:\s+(?:value|array|string|number|object))?:\s*([\s\S]*?)(?=\n\s*Received|\n\s*at |\n\s*Number of)/);
  const recMatch = raw.match(/Received(?:\s+(?:value|array|string|number|object))?:\s*([\s\S]*?)(?=\n\s*(?:at |Expected|Number of|$))/);

  if (expMatch && recMatch) {
    return {
      expected: expMatch[1].trim().slice(0, 300),
      received: recMatch[1].trim().slice(0, 300),
    };
  }

  // toContain / toBe 패턴
  const toBeMatch = raw.match(/expect\(received\)\.(.*?)\n[\s\S]*?Expected.*?:\s*(.*?)\n[\s\S]*?Received.*?:\s*(.*?)(?:\n|$)/);
  if (toBeMatch) {
    return { expected: toBeMatch[2].trim(), received: toBeMatch[3].trim() };
  }

  return null;
}

/** 테스트명에서 기대 결과 힌트 추출 */
function extractExpected(title) {
  // "— 200", "→ 401", "— 4xx", "200 및", "201 반환" 패턴
  const m = title.match(/(?:→|—|:)\s*([0-9]{3}[^\s,]*)/)
         || title.match(/([0-9]{3}(?:\s*또는\s*[0-9]{3})?)\s*(?:반환|응답|OK|확인)/);
  return m ? m[1].trim() : '';
}

module.exports = HtmlReporter;
