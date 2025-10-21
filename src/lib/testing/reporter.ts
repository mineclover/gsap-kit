/**
 * GSAP Kit - Test Reporter
 * 테스트 결과 리포팅 UI
 */

import { debug } from '../types';
import type { TestResult } from './test-runner';

/**
 * 리포터 옵션
 */
export interface ReporterOptions {
  /** 컨테이너 선택자 또는 요소 */
  container?: string | HTMLElement;

  /** 자동 업데이트 여부 */
  autoUpdate?: boolean;

  /** 실시간 업데이트 간격 (ms) */
  updateInterval?: number;

  /** 테마 */
  theme?: 'light' | 'dark';
}

/**
 * 테스트 리포터 클래스
 */
export class TestReporter {
  private options: Required<ReporterOptions>;
  private container: HTMLElement;
  private reportElement: HTMLDivElement | null = null;

  constructor(options: ReporterOptions = {}) {
    // 컨테이너 찾기 또는 생성
    if (typeof options.container === 'string') {
      const el = document.querySelector(options.container);
      if (!el) {
        throw new Error(`Container not found: ${options.container}`);
      }
      this.container = el as HTMLElement;
    } else if (options.container instanceof HTMLElement) {
      this.container = options.container;
    } else {
      // 기본 컨테이너 생성
      const div = document.createElement('div');
      div.id = 'test-reporter';
      document.body.appendChild(div);
      this.container = div;
    }

    this.options = {
      container: this.container,
      autoUpdate: false,
      updateInterval: 1000,
      theme: 'light',
      ...options,
    };
  }

  /**
   * 리포트 HTML 생성
   */
  private generateHTML(results: Map<string, TestResult[]>): string {
    const isDark = this.options.theme === 'dark';

    // 통계 계산
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let totalDuration = 0;

    for (const suiteResults of results.values()) {
      for (const result of suiteResults) {
        totalTests++;
        if (result.passed) passedTests++;
        else failedTests++;
        totalDuration += result.duration;
      }
    }

    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';

    // HTML 생성
    let html = `
      <div class="test-report ${isDark ? 'dark' : 'light'}">
        <div class="report-header">
          <h2>🧪 Test Report</h2>
          <div class="stats-summary">
            <div class="stat-card ${passedTests === totalTests ? 'success' : failedTests > 0 ? 'danger' : 'info'}">
              <span class="stat-label">Total</span>
              <span class="stat-value">${totalTests}</span>
            </div>
            <div class="stat-card success">
              <span class="stat-label">✓ Passed</span>
              <span class="stat-value">${passedTests}</span>
            </div>
            <div class="stat-card danger">
              <span class="stat-label">✗ Failed</span>
              <span class="stat-value">${failedTests}</span>
            </div>
            <div class="stat-card info">
              <span class="stat-label">Pass Rate</span>
              <span class="stat-value">${passRate}%</span>
            </div>
            <div class="stat-card info">
              <span class="stat-label">Duration</span>
              <span class="stat-value">${(totalDuration / 1000).toFixed(2)}s</span>
            </div>
          </div>
        </div>

        <div class="report-body">
    `;

    // 각 스위트별 결과
    for (const [suiteName, suiteResults] of results.entries()) {
      const suitePassed = suiteResults.filter(r => r.passed).length;
      const suiteTotal = suiteResults.length;
      const suiteStatus = suitePassed === suiteTotal ? 'success' : 'danger';

      html += `
        <div class="test-suite ${suiteStatus}">
          <div class="suite-header">
            <h3>${suiteName}</h3>
            <span class="suite-stats">${suitePassed}/${suiteTotal} passed</span>
          </div>
          <div class="test-cases">
      `;

      // 각 테스트 케이스
      for (const result of suiteResults) {
        const icon = result.passed ? '✓' : '✗';
        const statusClass = result.passed ? 'passed' : 'failed';

        html += `
          <div class="test-case ${statusClass}">
            <div class="test-case-header">
              <span class="test-icon">${icon}</span>
              <span class="test-name">${result.name}</span>
              <span class="test-duration">${result.duration}ms</span>
            </div>
        `;

        // 에러 메시지 (실패한 경우)
        if (!result.passed && result.error) {
          html += `
            <div class="test-error">
              <pre>${result.error}</pre>
            </div>
          `;
        }

        // 경로 정보 (있는 경우)
        if (result.path && result.path.length > 0) {
          html += `
            <div class="test-path-info">
              <small>Path: ${result.path.length} points</small>
            </div>
          `;
        }

        html += `</div>`; // test-case
      }

      html += `
          </div>
        </div>
      `; // test-suite
    }

    html += `
        </div>
      </div>
    `; // test-report

    return html;
  }

  /**
   * 스타일 생성
   */
  private generateStyles(): string {
    return `
      <style>
        .test-report {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .test-report.light {
          background: #f5f5f5;
          color: #333;
        }

        .test-report.dark {
          background: #1a1a1a;
          color: #e0e0e0;
        }

        .report-header {
          margin-bottom: 30px;
        }

        .report-header h2 {
          margin: 0 0 20px 0;
          font-size: 32px;
        }

        .stats-summary {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .stat-card {
          flex: 1;
          min-width: 120px;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .stat-card.success {
          background: #4CAF50;
          color: white;
        }

        .stat-card.danger {
          background: #F44336;
          color: white;
        }

        .stat-card.info {
          background: #2196F3;
          color: white;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          opacity: 0.9;
          margin-bottom: 5px;
        }

        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: bold;
        }

        .test-suite {
          background: white;
          border-radius: 8px;
          margin-bottom: 20px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .test-report.dark .test-suite {
          background: #2a2a2a;
        }

        .suite-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .test-report.dark .suite-header {
          border-bottom-color: #404040;
        }

        .suite-header h3 {
          margin: 0;
          font-size: 20px;
        }

        .suite-stats {
          font-size: 14px;
          color: #666;
        }

        .test-report.dark .suite-stats {
          color: #aaa;
        }

        .test-cases {
          padding: 10px;
        }

        .test-case {
          padding: 12px 15px;
          margin: 5px 0;
          border-radius: 6px;
          border-left: 4px solid transparent;
        }

        .test-case.passed {
          background: #E8F5E9;
          border-left-color: #4CAF50;
        }

        .test-report.dark .test-case.passed {
          background: #1b3a1f;
        }

        .test-case.failed {
          background: #FFEBEE;
          border-left-color: #F44336;
        }

        .test-report.dark .test-case.failed {
          background: #3a1b1b;
        }

        .test-case-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .test-icon {
          font-size: 18px;
          font-weight: bold;
        }

        .test-case.passed .test-icon {
          color: #4CAF50;
        }

        .test-case.failed .test-icon {
          color: #F44336;
        }

        .test-name {
          flex: 1;
          font-weight: 500;
        }

        .test-duration {
          font-size: 12px;
          color: #666;
          background: rgba(0,0,0,0.05);
          padding: 2px 8px;
          border-radius: 12px;
        }

        .test-report.dark .test-duration {
          color: #aaa;
          background: rgba(255,255,255,0.1);
        }

        .test-error {
          margin-top: 10px;
          padding: 10px;
          background: rgba(244, 67, 54, 0.1);
          border-radius: 4px;
        }

        .test-error pre {
          margin: 0;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 12px;
          color: #d32f2f;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .test-report.dark .test-error pre {
          color: #ff6b6b;
        }

        .test-path-info {
          margin-top: 8px;
          font-size: 12px;
          color: #666;
        }

        .test-report.dark .test-path-info {
          color: #aaa;
        }
      </style>
    `;
  }

  /**
   * 리포트 렌더링
   */
  render(results: Map<string, TestResult[]>): void {
    debug('[TestReporter] Rendering report');

    // 기존 리포트 제거
    if (this.reportElement) {
      this.reportElement.remove();
    }

    // 새 리포트 생성
    const reportDiv = document.createElement('div');
    reportDiv.innerHTML = this.generateStyles() + this.generateHTML(results);

    this.container.appendChild(reportDiv);
    this.reportElement = reportDiv;

    debug('[TestReporter] Report rendered');
  }

  /**
   * 리포트 업데이트
   */
  update(results: Map<string, TestResult[]>): void {
    this.render(results);
  }

  /**
   * 리포트 제거
   */
  clear(): void {
    if (this.reportElement) {
      this.reportElement.remove();
      this.reportElement = null;
      debug('[TestReporter] Report cleared');
    }
  }

  /**
   * HTML 내보내기
   */
  export(results: Map<string, TestResult[]>): string {
    return this.generateStyles() + this.generateHTML(results);
  }
}

/**
 * 리포트 생성 헬퍼
 */
export function createReport(results: Map<string, TestResult[]>, options: ReporterOptions = {}): TestReporter {
  const reporter = new TestReporter(options);
  reporter.render(results);
  return reporter;
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).TestReporter = TestReporter;
  (window as any).createReport = createReport;
}
