/**
 * GSAP Kit - Test Runner Web Component
 * 재사용 가능한 테스트 러너 UI 컴포넌트
 */

import { createReport } from './reporter';
import { runTestsFromFile, runTestsFromObject } from './spec-runner';

/**
 * 테스트 러너 웹 컴포넌트
 *
 * @example
 * ```html
 * <test-runner spec-file="/test-specs/my-test.spec.json"></test-runner>
 * ```
 */
export class TestRunnerComponent extends HTMLElement {
  private specFile: string | null = null;
  private visualizeEnabled = true;
  private slowMotionEnabled = false;
  private isRunning = false; // Prevent multiple simultaneous test runs

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['spec-file', 'visualize', 'slow-motion'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'spec-file':
        this.specFile = newValue;
        break;
      case 'visualize':
        this.visualizeEnabled = newValue === 'true';
        break;
      case 'slow-motion':
        this.slowMotionEnabled = newValue === 'true';
        break;
    }
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

        .controls-right {
          margin-left: auto;
          display: flex;
          gap: 15px;
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

        label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
          cursor: pointer;
          user-select: none;
        }

        input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
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
        <button id="clearTests" class="btn btn-danger">Clear Results</button>
        <div class="controls-right">
          <label>
            <input type="checkbox" id="visualizeToggle" ${this.visualizeEnabled ? 'checked' : ''}>
            Visualize Paths
          </label>
          <label>
            <input type="checkbox" id="slowMotionToggle" ${this.slowMotionEnabled ? 'checked' : ''}>
            Slow Motion (3x)
          </label>
        </div>
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
      const results = await runTestsFromFile(this.specFile);

      this.log(`📝 Loaded ${results.total} tests`, 'info');

      // Display results
      if (reporterContainer) {
        reporterContainer.innerHTML = '';
        createReport(results.raw, reporterContainer);
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

      const results = await runTestsFromObject(spec);
      this.log(`📝 Loaded ${results.total} tests`, 'info');

      reporterContainer.innerHTML = '';
      createReport(results.raw, reporterContainer);

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

    this.log('🗑️ Results cleared', 'info');
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

    // Toggles
    this.shadowRoot.getElementById('visualizeToggle')?.addEventListener('change', e => {
      this.visualizeEnabled = (e.target as HTMLInputElement).checked;
      this.log(`Visualization ${this.visualizeEnabled ? 'enabled' : 'disabled'}`, 'info');
    });

    this.shadowRoot.getElementById('slowMotionToggle')?.addEventListener('change', e => {
      this.slowMotionEnabled = (e.target as HTMLInputElement).checked;
      this.log(`Slow motion ${this.slowMotionEnabled ? 'enabled' : 'disabled'}`, 'info');
    });
  }
}

// Register the web component
if (typeof window !== 'undefined' && !customElements.get('test-runner')) {
  customElements.define('test-runner', TestRunnerComponent);
}
