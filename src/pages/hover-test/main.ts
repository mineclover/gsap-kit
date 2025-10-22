/**
 * Hover Simulation Test Runner
 * Automated testing with JSON-driven specs
 */

declare const gsap: any;

import { createReport } from '../../lib/testing';
import { runTestsFromFile } from '../../lib/testing/spec-runner';

// Logger
const logContainer = document.getElementById('log-container')!;

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;

  const timestamp = new Date().toLocaleTimeString();
  entry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${message}`;

  logContainer.appendChild(entry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// Test configuration
let visualizeEnabled = true;
let slowMotionEnabled = false;

/**
 * Initialize hover interactions
 */
function initHoverInteractions(): void {
  log('🎯 Initializing hover interactions...', 'info');

  // 1. Tooltip test
  const tooltipTrigger = document.getElementById('tooltip-trigger');
  const tooltip = document.getElementById('tooltip');

  if (tooltipTrigger && tooltip) {
    tooltipTrigger.addEventListener('mouseenter', () => {
      tooltip.classList.add('visible');
    });

    tooltipTrigger.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  }

  // 2. Hover box test
  const hoverBox = document.getElementById('hover-box');

  if (hoverBox) {
    hoverBox.addEventListener('mouseenter', () => {
      hoverBox.classList.add('hovered');
    });

    hoverBox.addEventListener('mouseleave', () => {
      hoverBox.classList.remove('hovered');
    });
  }

  // 3. Scale animation test
  const hoverScale = document.getElementById('hover-scale');

  if (hoverScale) {
    hoverScale.addEventListener('mouseenter', () => {
      hoverScale.classList.add('scaled');
    });

    hoverScale.addEventListener('mouseleave', () => {
      hoverScale.classList.remove('scaled');
    });
  }

  log('✓ Hover interactions initialized', 'success');
}

/**
 * Reset all hover states
 */
function resetHoverStates(): void {
  log('🔄 Resetting hover states...', 'info');

  const tooltip = document.getElementById('tooltip');
  const hoverBox = document.getElementById('hover-box');
  const hoverScale = document.getElementById('hover-scale');

  tooltip?.classList.remove('visible');
  hoverBox?.classList.remove('hovered');
  hoverScale?.classList.remove('scaled');

  log('✓ Reset complete', 'success');
}

/**
 * Run all tests from JSON spec
 */
async function runAllTests(): Promise<void> {
  log('🧪 Starting test run...', 'info');

  const reporterContainer = document.getElementById('reporter-container')!;
  reporterContainer.innerHTML = '<p>Loading tests...</p>';

  try {
    // Load and run tests
    log('📝 Loading test spec...', 'info');
    const results = await runTestsFromFile('/test-specs/hover.spec.json');

    log(`📝 Loaded ${results.total} tests`, 'info');

    // Display results
    reporterContainer.innerHTML = '';
    createReport(results.raw, reporterContainer);

    // Log summary
    const passRate = results.passRate.toFixed(2);
    if (results.failed === 0) {
      log(`✅ All tests passed! (${results.total} tests, ${passRate}%)`, 'success');
    } else {
      log(`⚠️ ${results.failed} test(s) failed out of ${results.total} (${passRate}% pass rate)`, 'warning');
    }
  } catch (error) {
    log(`❌ Test run failed: ${error}`, 'error');
    reporterContainer.innerHTML = `<p class="error">Error: ${error}</p>`;
  }
}

/**
 * Clear test results
 */
function clearResults(): void {
  const reporterContainer = document.getElementById('reporter-container')!;
  reporterContainer.innerHTML = '';
  logContainer.innerHTML = '';
  log('🗑️ Results cleared', 'info');
}

/**
 * Initialize page
 */
function init(): void {
  initHoverInteractions();

  // Bind controls
  document.getElementById('runAllTests')?.addEventListener('click', async () => {
    const btn = document.getElementById('runAllTests') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = '⏳ Running Tests...';

    try {
      await runAllTests();
    } finally {
      btn.disabled = false;
      btn.textContent = '▶ Run All Tests';
    }
  });

  document.getElementById('clearTests')?.addEventListener('click', clearResults);

  // Visualization toggle
  const visualizeToggle = document.getElementById('visualizeToggle') as HTMLInputElement;
  visualizeToggle?.addEventListener('change', e => {
    visualizeEnabled = (e.target as HTMLInputElement).checked;
    log(`Visualization ${visualizeEnabled ? 'enabled' : 'disabled'}`, 'info');
  });

  // Slow motion toggle
  const slowMotionToggle = document.getElementById('slowMotionToggle') as HTMLInputElement;
  slowMotionToggle?.addEventListener('change', e => {
    slowMotionEnabled = (e.target as HTMLInputElement).checked;
    log(`Slow motion ${slowMotionEnabled ? 'enabled' : 'disabled'}`, 'info');
  });

  log('✅ Page initialized', 'success');
  log('Click "Run All Tests" to start automated testing', 'info');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).hoverTest = {
    resetHoverStates,
    runAllTests,
  };
}
