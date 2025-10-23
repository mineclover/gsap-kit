/**
 * GSAP Kit - Test Runner Web Component
 * 재사용 가능한 테스트 러너 UI 컴포넌트
 *
 * 의존성 주입을 통해 다양한 테스트 프레임워크와 연동 가능
 */

import { defaultTestReporter, defaultTestRunner } from './gsap-test-runner-adapter';
import { downloadHTMLReport } from './html-report-generator';
import type { ITestReporter, ITestRunner, TestRunResult } from './test-runner-interface';

/**
 * 테스트 러너 웹 컴포넌트
 *
 * @example
 * ```html
 * <!-- 기본 사용법 (GSAP Kit 테스트 러너 사용) -->
 * <test-runner spec-file="/test-specs/my-test.spec.json"></test-runner>
 *
 * <!-- 커스텀 러너 주입 -->
 * <script>
 *   const runner = document.querySelector('test-runner');
 *   runner.setTestRunner(myCustomRunner);
 *   runner.setTestReporter(myCustomReporter);
 * </script>
 * ```
 */
export class TestRunnerComponent extends HTMLElement {
  private specFile: string | null = null;
  private isRunning = false; // Prevent multiple simultaneous test runs
  private testRunner: ITestRunner;
  private testReporter: ITestReporter;
  private lastTestResult: TestRunResult | null = null; // Store last test result for export

  constructor(testRunner?: ITestRunner, testReporter?: ITestReporter) {
    super();
    this.attachShadow({ mode: 'open' });

    // 의존성 주입 - 기본값은 GSAP Kit 어댑터 사용
    this.testRunner = testRunner || defaultTestRunner;
    this.testReporter = testReporter || defaultTestReporter;
  }

  static get observedAttributes() {
    return ['spec-file'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    if (name === 'spec-file') {
      this.specFile = newValue;
    }
  }

  /**
   * 테스트 러너 설정 (의존성 주입)
   */
  setTestRunner(runner: ITestRunner): void {
    this.testRunner = runner;
    this.log('🔧 Custom test runner configured', 'info');
  }

  /**
   * 테스트 리포터 설정 (의존성 주입)
   */
  setTestReporter(reporter: ITestReporter): void {
    this.testReporter = reporter;
    this.log('🔧 Custom test reporter configured', 'info');
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          background: white;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          align-items: center;
        }


        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-secondary {
          background: #48bb78;
          color: white;
        }

        .btn-danger {
          background: #f56565;
          color: white;
        }

        .btn-info {
          background: #4299e1;
          color: white;
        }

        .btn-success {
          background: #48bb78;
          color: white;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .test-results {
          background: white;
          border-radius: 10px;
          padding: 30px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .test-log {
          background: #1a202c;
          border-radius: 10px;
          padding: 20px;
          color: #e2e8f0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .test-log h3 {
          margin-bottom: 15px;
          color: #a0aec0;
        }

        .log-container {
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 12px;
          max-height: 300px;
          overflow-y: auto;
          background: #2d3748;
          padding: 15px;
          border-radius: 6px;
        }

        .log-entry {
          margin-bottom: 8px;
          padding: 4px 8px;
          border-left: 3px solid #4a5568;
        }

        .log-entry.info { border-left-color: #4299e1; color: #90cdf4; }
        .log-entry.success { border-left-color: #48bb78; color: #9ae6b4; }
        .log-entry.error { border-left-color: #f56565; color: #fc8181; }
        .log-entry.warning { border-left-color: #ed8936; color: #fbd38d; }

        .log-timestamp {
          opacity: 0.6;
          margin-right: 8px;
        }


        .custom-spec-panel {
          background: white;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          display: none;
        }

        .custom-spec-panel.visible {
          display: block;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .panel-header h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
        }

        .spec-input {
          width: 100%;
          min-height: 300px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          padding: 15px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          resize: vertical;
          background: #f7fafc;
          color: #2d3748;
        }

        .spec-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
        }

        .panel-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
      </style>

      <div class="controls">
        <button id="runAllTests" class="btn btn-primary">▶ Run All Tests</button>
        <button id="runCustomSpec" class="btn btn-secondary">▶ Run Custom Spec</button>
        <button id="uploadSpec" class="btn btn-info">📂 Upload Spec File</button>
        <button id="exportHTML" class="btn btn-success" disabled>📥 Export HTML Report</button>
        <button id="clearTests" class="btn btn-danger">Clear Results</button>
        <input type="file" id="fileInput" accept=".json" style="display: none;">
      </div>

      <div id="custom-spec-panel" class="custom-spec-panel">
        <div class="panel-header">
          <h3>Custom Test Spec (JSON)</h3>
          <button id="closeSpecPanel" class="btn btn-sm">Close</button>
        </div>
        <textarea id="customSpecInput" class="spec-input" placeholder="Enter JSON test spec here..."></textarea>
        <div class="panel-actions">
          <button id="executeCustomSpec" class="btn btn-primary">Execute Custom Spec</button>
          <button id="loadDefaultSpec" class="btn btn-secondary">Load Default Spec</button>
        </div>
      </div>

      <div class="test-results">
        <h2>Test Results</h2>
        <div id="reporter-container"></div>
      </div>

      <div class="test-log">
        <h3>Test Log</h3>
        <div class="log-container" id="log-container"></div>
      </div>
    `;
  }

  private log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    if (!this.shadowRoot) return;

    const logContainer = this.shadowRoot.getElementById('log-container');
    if (!logContainer) return;

    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;

    const timestamp = new Date().toLocaleTimeString();
    entry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${message}`;

    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  private async runAllTests(): Promise<void> {
    // Prevent multiple simultaneous runs
    if (this.isRunning) {
      this.log('⚠️ Tests are already running. Please wait...', 'warning');
      return;
    }

    if (!this.specFile) {
      this.log('❌ No spec file specified', 'error');
      return;
    }

    this.isRunning = true;
    this.log('🧪 Starting test run...', 'info');

    const reporterContainer = this.shadowRoot?.getElementById('reporter-container');
    if (reporterContainer) {
      reporterContainer.innerHTML = '<p>Loading tests...</p>';
    }

    try {
      this.log('📝 Loading test spec...', 'info');
      // 의존성 주입된 testRunner 사용
      const results = await this.testRunner.runFromFile(this.specFile);

      // Store results for export
      this.lastTestResult = results;
      this.enableExportButton();

      this.log(`📝 Loaded ${results.total} tests`, 'info');

      // Display results using injected reporter
      if (reporterContainer) {
        reporterContainer.innerHTML = '';
        this.testReporter.render(results.raw, reporterContainer);
      }

      // Log summary
      const passRate = results.passRate.toFixed(2);
      if (results.failed === 0) {
        this.log(`✅ All tests passed! (${results.total} tests, ${passRate}%)`, 'success');
      } else {
        this.log(`⚠️ ${results.failed} test(s) failed out of ${results.total} (${passRate}% pass rate)`, 'warning');
      }
    } catch (error) {
      this.log(`❌ Test run failed: ${error}`, 'error');
      if (reporterContainer) {
        reporterContainer.innerHTML = `<p class="error">Error: ${error}</p>`;
      }
    } finally {
      this.isRunning = false;
    }
  }

  private async runCustomSpec(): Promise<void> {
    // Prevent multiple simultaneous runs
    if (this.isRunning) {
      this.log('⚠️ Tests are already running. Please wait...', 'warning');
      return;
    }

    this.isRunning = true;
    this.log('🧪 Running custom spec...', 'info');

    const customSpecInput = this.shadowRoot?.getElementById('customSpecInput') as HTMLTextAreaElement;
    const reporterContainer = this.shadowRoot?.getElementById('reporter-container');

    if (!customSpecInput || !reporterContainer) {
      this.isRunning = false;
      return;
    }

    reporterContainer.innerHTML = '<p>Loading tests...</p>';

    try {
      const specText = customSpecInput.value.trim();
      if (!specText) {
        throw new Error('Please enter a JSON test spec');
      }

      const spec = JSON.parse(specText);
      this.log('📝 Parsed custom spec successfully', 'info');

      // 의존성 주입된 testRunner 사용
      const results = await this.testRunner.runFromObject(spec);

      // Store results for export
      this.lastTestResult = results;
      this.enableExportButton();

      this.log(`📝 Loaded ${results.total} tests`, 'info');

      reporterContainer.innerHTML = '';
      this.testReporter.render(results.raw, reporterContainer);

      const passRate = results.passRate.toFixed(2);
      if (results.failed === 0) {
        this.log(`✅ All tests passed! (${results.total} tests, ${passRate}%)`, 'success');
      } else {
        this.log(`⚠️ ${results.failed} test(s) failed out of ${results.total} (${passRate}% pass rate)`, 'warning');
      }
    } catch (error) {
      this.log(`❌ Custom spec execution failed: ${error}`, 'error');
      reporterContainer.innerHTML = `<p class="error">Error: ${error}</p>`;
    } finally {
      this.isRunning = false;
    }
  }

  private async loadDefaultSpec(): Promise<void> {
    if (!this.specFile) {
      this.log('❌ No default spec file specified', 'error');
      return;
    }

    this.log('📥 Loading default spec...', 'info');

    try {
      const response = await fetch(this.specFile);
      if (!response.ok) {
        throw new Error(`Failed to load spec: ${response.statusText}`);
      }

      const spec = await response.json();
      const customSpecInput = this.shadowRoot?.getElementById('customSpecInput') as HTMLTextAreaElement;
      if (customSpecInput) {
        customSpecInput.value = JSON.stringify(spec, null, 2);
      }

      this.log('✅ Default spec loaded into editor', 'success');
    } catch (error) {
      this.log(`❌ Failed to load default spec: ${error}`, 'error');
    }
  }

  private toggleCustomSpecPanel(): void {
    const panel = this.shadowRoot?.getElementById('custom-spec-panel');
    if (!panel) return;

    if (panel.classList.contains('visible')) {
      panel.classList.remove('visible');
      this.log('📝 Custom spec panel closed', 'info');
    } else {
      panel.classList.add('visible');
      this.log('📝 Custom spec panel opened', 'info');
    }
  }

  private clearResults(): void {
    const reporterContainer = this.shadowRoot?.getElementById('reporter-container');
    const logContainer = this.shadowRoot?.getElementById('log-container');

    if (reporterContainer) reporterContainer.innerHTML = '';
    if (logContainer) logContainer.innerHTML = '';

    this.lastTestResult = null;
    this.disableExportButton();

    this.log('🗑️ Results cleared', 'info');
  }

  private enableExportButton(): void {
    const exportBtn = this.shadowRoot?.getElementById('exportHTML') as HTMLButtonElement;
    if (exportBtn) {
      exportBtn.disabled = false;
    }
  }

  private disableExportButton(): void {
    const exportBtn = this.shadowRoot?.getElementById('exportHTML') as HTMLButtonElement;
    if (exportBtn) {
      exportBtn.disabled = true;
    }
  }

  private exportHTMLReport(): void {
    if (!this.lastTestResult) {
      this.log('⚠️ No test results to export', 'warning');
      return;
    }

    try {
      const title = this.specFile
        ? `Test Report - ${this.specFile.split('/').pop()?.replace('.json', '')}`
        : 'Test Report';

      downloadHTMLReport(this.lastTestResult, undefined, {
        title,
        includeTimestamp: true,
        includeSystemInfo: true,
      });

      this.log('✅ HTML report downloaded successfully', 'success');
    } catch (error) {
      this.log(`❌ Failed to export HTML report: ${error}`, 'error');
    }
  }

  private attachEventListeners(): void {
    if (!this.shadowRoot) return;

    // Run all tests
    this.shadowRoot.getElementById('runAllTests')?.addEventListener('click', async () => {
      const btn = this.shadowRoot?.getElementById('runAllTests') as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = '⏳ Running Tests...';

      try {
        await this.runAllTests();
      } finally {
        btn.disabled = false;
        btn.textContent = '▶ Run All Tests';
      }
    });

    // Clear tests
    this.shadowRoot.getElementById('clearTests')?.addEventListener('click', () => {
      this.clearResults();
    });

    // Custom spec controls
    this.shadowRoot.getElementById('runCustomSpec')?.addEventListener('click', () => {
      this.toggleCustomSpecPanel();
    });

    this.shadowRoot.getElementById('closeSpecPanel')?.addEventListener('click', () => {
      this.toggleCustomSpecPanel();
    });

    this.shadowRoot.getElementById('executeCustomSpec')?.addEventListener('click', async () => {
      const btn = this.shadowRoot?.getElementById('executeCustomSpec') as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = '⏳ Executing...';

      try {
        await this.runCustomSpec();
      } finally {
        btn.disabled = false;
        btn.textContent = 'Execute Custom Spec';
      }
    });

    this.shadowRoot.getElementById('loadDefaultSpec')?.addEventListener('click', () => {
      this.loadDefaultSpec();
    });

    // File upload
    const uploadBtn = this.shadowRoot.getElementById('uploadSpec');
    const fileInput = this.shadowRoot.getElementById('fileInput') as HTMLInputElement;

    uploadBtn?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', async e => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      const file = files[0];
      this.log(`📂 Loading file: ${file.name}`, 'info');

      try {
        const text = await file.text();
        const spec = JSON.parse(text);

        this.log('✅ File loaded successfully', 'success');

        // Load into custom spec editor
        const customSpecInput = this.shadowRoot?.getElementById('customSpecInput') as HTMLTextAreaElement;
        if (customSpecInput) {
          customSpecInput.value = JSON.stringify(spec, null, 2);
        }

        // Show custom spec panel
        const panel = this.shadowRoot?.getElementById('custom-spec-panel');
        if (panel && !panel.classList.contains('visible')) {
          panel.classList.add('visible');
        }

        this.log('📝 Spec loaded into editor. Click "Execute Custom Spec" to run.', 'info');
      } catch (error) {
        this.log(`❌ Failed to load file: ${error}`, 'error');
      }

      // Reset file input
      fileInput.value = '';
    });

    // Export HTML Report
    this.shadowRoot.getElementById('exportHTML')?.addEventListener('click', () => {
      this.exportHTMLReport();
    });
  }
}

// Register the web component
if (typeof window !== 'undefined' && !customElements.get('test-runner')) {
  customElements.define('test-runner', TestRunnerComponent);
}
