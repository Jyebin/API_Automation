// @ts-check
'use strict';

const fs   = require('fs');
const path = require('path');

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', 'Malgun Gothic', sans-serif; background: #f4f6fa; color: #1a1a2e; font-size: 14px; line-height: 1.6; }
  .page { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }

  .report-header { background: linear-gradient(135deg, #1e3a5f 0%, #16213e 100%); color: #fff; border-radius: 12px; padding: 36px 40px; margin-bottom: 32px; }
  .report-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  .report-header .meta { opacity: .75; font-size: 13px; margin-top: 6px; }
  .report-header .meta span { margin-right: 24px; }

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

  .defect-card { background: #fff; border-radius: 10px; border-left: 5px solid #c62828; padding: 0; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.06); overflow: hidden; }
  .defect-header { display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: #fff8f8; border-bottom: 1px solid #f5e0e0; }
  .defect-id { font-size: 11px; font-weight: 700; color: #fff; background: #c62828; padding: 3px 8px; border-radius: 4px; white-space: nowrap; }
  .defect-title { font-size: 15px; font-weight: 600; color: #c62828; flex: 1; }
  .defect-suite { font-size: 11px; color: #888; margin-left: auto; font-family: monospace; }

  .defect-body { display: grid; grid-template-columns: 120px 1fr; }
  .defect-body .row { display: contents; }
  .defect-body .row .label { padding: 9px 14px; font-size: 12px; font-weight: 600; color: #555; background: #fafafa; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; }
  .defect-body .row .value { padding: 9px 14px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
  .defect-body .row:last-child .label,
  .defect-body .row:last-child .value { border-bottom: none; }
  .fail-msg { font-family: 'Consolas', monospace; font-size: 12px; background: #fff5f5; border: 1px solid #ffd0d0; border-radius: 4px; padding: 10px 12px; white-space: pre-wrap; word-break: break-all; color: #b71c1c; margin-top: 2px; }

  .pass-section { background: #fff; border-radius: 10px; padding: 20px 24px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  .suite-title { font-weight: 600; margin-bottom: 10px; color: #2e7d32; font-size: 14px; }
  .pass-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .pass-table th { background: #f9fbe7; padding: 8px 12px; text-align: left; border-bottom: 2px solid #e0e0e0; color: #555; }
  .pass-table td { padding: 7px 12px; border-bottom: 1px solid #f0f0f0; }
  .pass-table tr:last-child td { border-bottom: none; }
  .status-pass { color: #2e7d32; font-weight: 600; }
  .status-fail { color: #c62828; font-weight: 600; }
  .status-skip { color: #e65100; font-weight: 600; }

  .cause-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.06); margin-bottom: 32px; }
  .cause-table th { background: #1e3a5f; color: #fff; padding: 10px 16px; text-align: left; }
  .cause-table td { padding: 9px 16px; border-bottom: 1px solid #f0f0f0; }
  .cause-table tr:last-child td { border-bottom: none; }

  .footer { text-align: center; font-size: 12px; color: #aaa; margin-top: 48px; padding-top: 20px; border-top: 1px solid #e8e8e8; }
  code { font-family: 'Consolas', monospace; background: #f4f6fa; padding: 1px 5px; border-radius: 3px; font-size: 12.5px; }

  .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .tag-pass { background: #e8f5e9; color: #2e7d32; }
  .tag-fail { background: #ffebee; color: #c62828; }
  .tag-skip { background: #fff3e0; color: #e65100; }
`;

class HtmlReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};
    this._outputPath = this._options.outputPath || 'test-report.html';
  }

  onRunComplete(_contexts, results) {
    const html = this._build(results);
    const out  = path.resolve(this._globalConfig.rootDir, this._outputPath);
    fs.writeFileSync(out, html, 'utf8');
    console.log(`\n📄 테스트 결과서 저장: ${out}`);
  }

  _build(results) {
    const now        = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const total      = results.numTotalTests;
    const passed     = results.numPassedTests;
    const failed     = results.numFailedTests;
    const skipped    = results.numPendingTests + results.numTodoTests;
    const totalSuites  = results.numTotalTestSuites;
    const failedSuites = results.numFailedTestSuites;
    const elapsed    = ((results.testResults.reduce((s, r) => s + (r.testExecError ? 0 : r.perfStats.end - r.perfStats.start), 0)) / 1000).toFixed(1);

    const suites = results.testResults
      .slice()
      .sort((a, b) => {
        const aFail = a.numFailingTests > 0 ? 0 : 1;
        const bFail = b.numFailingTests > 0 ? 0 : 1;
        return aFail - bFail;
      });

    const failedCards  = this._buildFailedCards(suites);
    const passedTables = this._buildPassedTables(suites);
    const envTable     = this._buildEnvTable(now, elapsed, total, totalSuites);

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
    <p style="opacity:.8;margin-top:6px;">대상 서버: ${process.env.API_BASE_URL || 'https://metademy.raonsecure.co.kr:38000'}</p>
    <div class="meta">
      <span>실행일시: ${now}</span>
      <span>프레임워크: Jest + ts-jest + axios</span>
      <span>인증 계정: ${process.env.TEST_USERNAME || 'raontestqa1'}</span>
    </div>
  </div>

  <div class="summary-grid">
    <div class="card total"><div class="num">${total}</div><div class="lbl">전체 테스트</div></div>
    <div class="card pass"><div class="num">${passed}</div><div class="lbl">통과</div></div>
    <div class="card fail"><div class="num">${failed}</div><div class="lbl">실패</div></div>
    <div class="card skip"><div class="num">${skipped}</div><div class="lbl">스킵</div></div>
    <div class="card suite"><div class="num">${failedSuites} / ${totalSuites}</div><div class="lbl">실패 스위트</div></div>
  </div>

  ${failed > 0 ? `<h2>실패한 테스트 (${failed}건)</h2>\n${failedCards}` : '<h2 style="color:#2e7d32;">✅ 모든 테스트 통과</h2>'}

  <h2>테스트 스위트 결과 (${totalSuites}개)</h2>
  ${passedTables}

  <h2>테스트 환경</h2>
  ${envTable}

  <div class="footer">
    API 자동화 테스트 결과서 · 실행일시: ${now} · 도구: Jest + axios (API_Automation 프로젝트)
  </div>

</div>
</body>
</html>`;
  }

  _buildFailedCards(suites) {
    const cards = [];
    let idx = 1;

    for (const suite of suites) {
      const suiteName = path.relative(process.cwd(), suite.testFilePath).replace(/\\/g, '/');
      for (const t of suite.testResults) {
        if (t.status !== 'failed') continue;
        const title   = t.fullName || t.title;
        const failMsg = (t.failureMessages || []).join('\n').slice(0, 2000);

        cards.push(`
  <div class="defect-card">
    <div class="defect-header">
      <span class="defect-id">FAIL-${String(idx).padStart(3,'0')}</span>
      <span class="defect-title">${esc(title)}</span>
      <span class="defect-suite">${esc(suiteName)}</span>
    </div>
    <div class="defect-body">
      <div class="row"><div class="label">스위트</div><div class="value"><code>${esc(suiteName)}</code></div></div>
      <div class="row"><div class="label">테스트명</div><div class="value">${esc(title)}</div></div>
      <div class="row"><div class="label">소요 시간</div><div class="value">${t.duration ?? 0}ms</div></div>
      <div class="row"><div class="label">오류 메시지</div><div class="value"><pre class="fail-msg">${esc(failMsg)}</pre></div></div>
    </div>
  </div>`);
        idx++;
      }
    }
    return cards.join('\n');
  }

  _buildPassedTables(suites) {
    const sections = [];

    for (const suite of suites) {
      const suiteName = path.relative(process.cwd(), suite.testFilePath).replace(/\\/g, '/');
      const tests = suite.testResults;
      if (!tests || tests.length === 0) continue;

      const passCount = tests.filter(t => t.status === 'passed').length;
      const failCount = tests.filter(t => t.status === 'failed').length;
      const skipCount = tests.filter(t => t.status === 'pending' || t.status === 'todo').length;

      const icon    = failCount > 0 ? '❌' : '✅';
      const elapsed = suite.perfStats ? ((suite.perfStats.end - suite.perfStats.start) / 1000).toFixed(2) : '—';

      const rows = tests.map(t => {
        const cls  = t.status === 'passed' ? 'status-pass' : t.status === 'failed' ? 'status-fail' : 'status-skip';
        const mark = t.status === 'passed' ? 'PASS' : t.status === 'failed' ? 'FAIL' : 'SKIP';
        return `<tr><td>${esc(t.fullName || t.title)}</td><td>${t.duration ?? 0}ms</td><td class="${cls}">${mark}</td></tr>`;
      }).join('\n');

      sections.push(`
  <div class="pass-section">
    <div class="suite-title">${icon} ${esc(suiteName)} &nbsp;<span style="font-weight:400;color:#888;font-size:12px;">(통과 ${passCount} / 실패 ${failCount} / 스킵 ${skipCount} · ${elapsed}s)</span></div>
    <table class="pass-table">
      <tr><th>테스트 항목</th><th>소요 시간</th><th>결과</th></tr>
      ${rows}
    </table>
  </div>`);
    }
    return sections.join('\n');
  }

  _buildEnvTable(now, elapsed, total, totalSuites) {
    const baseUrl = process.env.API_BASE_URL || 'https://metademy.raonsecure.co.kr:38000';
    const rows = [
      ['대상 서버',   baseUrl],
      ['인증 계정',   `${process.env.TEST_USERNAME || 'raontestqa1'} / RaontestQa1! — JWT 발급용`],
      ['테스트 이메일', process.env.TEST_EMAIL || 'yenbin03223@gmail.com'],
      ['프레임워크',  'Jest 29 + ts-jest + axios'],
      ['실행 방식',   'maxWorkers: 1 (직렬 실행) — 서버 부하 방지'],
      ['인증 방식',   'globalSetup 1회 로그인 → JWT Bearer 토큰 전역 공유'],
      ['총 테스트 수', `${total}개 (${totalSuites}개 스위트)`],
      ['실행 일시',   now],
      ['실행 시간',   `약 ${elapsed}초`],
    ].map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${esc(String(v))}</td></tr>`).join('\n');

    return `<table class="cause-table"><tr><th>항목</th><th>내용</th></tr>${rows}</table>`;
  }
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = HtmlReporter;
