/**
 * GSAP Kit - HTML Report Generator
 * 테스트 결과를 독립적인 HTML 파일로 생성
 */

import type { TestRunResult } from './test-runner-interface';

export interface HTMLReportOptions {
  title?: string;
  includeTimestamp?: boolean;
  includeSystemInfo?: boolean;
}

/**
 * 테스트 결과를 HTML 리포트로 생성
 */
export function generateHTMLReport(results: TestRunResult, options: HTMLReportOptions = {}): string {
  const { title = 'Test Report', includeTimestamp = true, includeSystemInfo = true } = options;

  const timestamp = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const passRate = results.passRate.toFixed(2);
  const duration = results.duration ? (results.duration / 1000).toFixed(2) : '0.00';

  // 스위트별로 결과 그룹화
  const suites: Array<{
    name: string;
    tests: Array<{
      name: string;
      passed: boolean;
      duration: number;
      error?: string;
      details?: string;
    }>;
  }> = [];

  for (const [suiteName, tests] of results.raw.entries()) {
    suites.push({
      name: suiteName,
      tests: (tests as any[]).map((test: any) => ({
        name: test.name,
        passed: test.passed,
        duration: test.duration,
        error: test.error,
        details: test.details,
      })),
    });
  }

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${timestamp}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 36px;
      color: #2d3748;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header h1::before {
      content: "🧪";
      font-size: 42px;
    }

    .timestamp {
      color: #718096;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .system-info {
      color: #718096;
      font-size: 13px;
      font-family: 'Monaco', 'Courier New', monospace;
    }

    .summary {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      margin-bottom: 30px;
    }

    .summary h2 {
      font-size: 24px;
      color: #2d3748;
      margin-bottom: 20px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%);
      padding: 24px;
      border-radius: 12px;
      border-left: 4px solid;
    }

    .stat-card.total { border-left-color: #667eea; }
    .stat-card.passed { border-left-color: #48bb78; }
    .stat-card.failed { border-left-color: #f56565; }
    .stat-card.rate { border-left-color: #ed8936; }
    .stat-card.duration { border-left-color: #4299e1; }

    .stat-label {
      font-size: 13px;
      color: #718096;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      display: block;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #2d3748;
    }

    .stat-value.success { color: #48bb78; }
    .stat-value.danger { color: #f56565; }

    .suites {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .suites h2 {
      font-size: 24px;
      color: #2d3748;
      margin-bottom: 24px;
    }

    .suite {
      margin-bottom: 32px;
      padding-bottom: 32px;
      border-bottom: 2px solid #e2e8f0;
    }

    .suite:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .suite-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
    }

    .suite-name {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
    }

    .suite-stats {
      font-size: 14px;
      color: #718096;
      font-weight: 500;
    }

    .tests {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .test {
      padding: 16px 20px;
      background: #f7fafc;
      border-radius: 8px;
      border-left: 4px solid;
      transition: all 0.2s ease;
    }

    .test:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .test.passed { border-left-color: #48bb78; }
    .test.failed { border-left-color: #f56565; }

    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .test-name {
      font-size: 15px;
      font-weight: 500;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .test-icon {
      font-size: 18px;
    }

    .test-duration {
      font-size: 13px;
      color: #718096;
      font-family: 'Monaco', 'Courier New', monospace;
    }

    .test-error {
      margin-top: 8px;
      padding: 12px;
      background: #fff5f5;
      border-left: 3px solid #f56565;
      border-radius: 4px;
      font-size: 13px;
      color: #c53030;
      font-family: 'Monaco', 'Courier New', monospace;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .test-details {
      margin-top: 8px;
      padding: 12px;
      background: #f0fff4;
      border-left: 3px solid #48bb78;
      border-radius: 4px;
      font-size: 13px;
      color: #22543d;
      font-family: 'Monaco', 'Courier New', monospace;
    }

    .footer {
      margin-top: 30px;
      text-align: center;
      color: white;
      font-size: 14px;
      opacity: 0.8;
    }

    .footer a {
      color: white;
      text-decoration: none;
      font-weight: 600;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .header, .summary, .suites {
        box-shadow: none;
      }

      .test:hover {
        transform: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      ${includeTimestamp ? `<div class="timestamp">📅 Generated: ${timestamp}</div>` : ''}
      ${includeSystemInfo ? `<div class="system-info">🖥️ User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</div>` : ''}
    </div>

    <div class="summary">
      <h2>📊 Summary</h2>
      <div class="stats">
        <div class="stat-card total">
          <span class="stat-label">Total Tests</span>
          <div class="stat-value">${results.total}</div>
        </div>
        <div class="stat-card passed">
          <span class="stat-label">✓ Passed</span>
          <div class="stat-value success">${results.passed}</div>
        </div>
        <div class="stat-card failed">
          <span class="stat-label">✗ Failed</span>
          <div class="stat-value danger">${results.failed}</div>
        </div>
        <div class="stat-card rate">
          <span class="stat-label">Pass Rate</span>
          <div class="stat-value ${results.failed === 0 ? 'success' : ''}">${passRate}%</div>
        </div>
        <div class="stat-card duration">
          <span class="stat-label">Duration</span>
          <div class="stat-value">${duration}s</div>
        </div>
      </div>
    </div>

    <div class="suites">
      <h2>📋 Test Results</h2>
      ${suites
        .map(
          suite => `
        <div class="suite">
          <div class="suite-header">
            <div class="suite-name">${suite.name}</div>
            <div class="suite-stats">
              ${suite.tests.filter(t => t.passed).length}/${suite.tests.length} passed
            </div>
          </div>
          <div class="tests">
            ${suite.tests
              .map(
                test => `
              <div class="test ${test.passed ? 'passed' : 'failed'}">
                <div class="test-header">
                  <div class="test-name">
                    <span class="test-icon">${test.passed ? '✓' : '✗'}</span>
                    ${test.name}
                  </div>
                  <div class="test-duration">${test.duration}ms</div>
                </div>
                ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
                ${test.details ? `<div class="test-details">${test.details}</div>` : ''}
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
        )
        .join('')}
    </div>

    <div class="footer">
      🤖 Generated with <a href="https://claude.com/claude-code" target="_blank">Claude Code</a> |
      GSAP Kit Testing Framework
    </div>
  </div>
</body>
</html>`;
}

/**
 * HTML 리포트를 다운로드
 */
export function downloadHTMLReport(results: TestRunResult, filename?: string, options?: HTMLReportOptions): void {
  const html = generateHTMLReport(results, options);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const defaultFilename = `test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.html`;
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  link.click();

  URL.revokeObjectURL(url);
}
