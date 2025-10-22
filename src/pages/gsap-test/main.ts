/**
 * GSAP Assertions Test Runner
 * Automated testing with JSON-driven specs
 */

declare const gsap: any;

import { createReport } from '../../lib/testing';
import { runTestsFromFile, runTestsFromObject } from '../../lib/testing/spec-runner';

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

// Animation references
let fadeAnimation: any = null;
let slideAnimation: any = null;
let scaleAnimation: any = null;
let rotationAnimation: any = null;
let timeline: any = null;
let progressAnimation: any = null;

// Test configuration
let visualizeEnabled = true;
let slowMotionEnabled = false;

/**
 * Initialize all GSAP animations
 */
function initAnimations(): void {
  log('🎬 Initializing GSAP animations...', 'info');

  // 1. Fade Animation
  const fadeBox = document.querySelector('.fade-box');
  const fadeTrigger = document.getElementById('fade-trigger');
  let isFadedIn = false;

  fadeTrigger?.addEventListener('click', () => {
    if (!fadeBox) return;

    fadeAnimation = gsap.to(fadeBox, {
      opacity: isFadedIn ? 0 : 1,
      duration: 1,
      ease: 'power2.inOut',
    });

    isFadedIn = !isFadedIn;
  });

  // 2. Slide Animation
  const slideBox = document.querySelector('.slide-box');
  const slideTrigger = document.getElementById('slide-trigger');
  const slideReset = document.getElementById('slide-reset');

  slideTrigger?.addEventListener('click', () => {
    if (!slideBox) return;
    slideAnimation = gsap.to(slideBox, {
      x: 200,
      duration: 1.5,
      ease: 'power2.out',
    });
  });

  slideReset?.addEventListener('click', () => {
    if (!slideBox) return;
    slideAnimation = gsap.to(slideBox, {
      x: 0,
      duration: 0.5,
      ease: 'power2.in',
    });
  });

  // 3. Scale Animation
  const scaleBox = document.querySelector('.scale-box');
  const scaleTrigger = document.getElementById('scale-trigger');
  const scaleReset = document.getElementById('scale-reset');

  scaleTrigger?.addEventListener('click', () => {
    if (!scaleBox) return;
    scaleAnimation = gsap.to(scaleBox, {
      scale: 1.5,
      duration: 1.5,
      ease: 'elastic.out(1, 0.5)',
    });
  });

  scaleReset?.addEventListener('click', () => {
    if (!scaleBox) return;
    scaleAnimation = gsap.to(scaleBox, {
      scale: 1,
      duration: 0.5,
      ease: 'power2.in',
    });
  });

  // 4. Rotation Animation
  const rotationBox = document.querySelector('.rotation-box');
  const rotationTrigger = document.getElementById('rotation-trigger');
  const rotationReset = document.getElementById('rotation-reset');

  rotationTrigger?.addEventListener('click', () => {
    if (!rotationBox) return;
    rotationAnimation = gsap.to(rotationBox, {
      rotation: 360,
      duration: 2,
      ease: 'power2.inOut',
    });
  });

  rotationReset?.addEventListener('click', () => {
    if (!rotationBox) return;
    rotationAnimation = gsap.to(rotationBox, {
      rotation: 0,
      duration: 0.5,
      ease: 'power2.in',
    });
  });

  // 5. Timeline Control
  const timelineBox = document.querySelector('.timeline-box');
  const timelinePlay = document.getElementById('timeline-play');
  const timelinePause = document.getElementById('timeline-pause');
  const timelineRestart = document.getElementById('timeline-restart');

  timeline = gsap.timeline({ paused: true });
  timeline
    .to(timelineBox, { x: 100, duration: 1, ease: 'power2.inOut' })
    .to(timelineBox, { y: 100, duration: 1, ease: 'power2.inOut' })
    .to(timelineBox, { x: 0, duration: 1, ease: 'power2.inOut' })
    .to(timelineBox, { y: 0, duration: 1, ease: 'power2.inOut' });

  timelinePlay?.addEventListener('click', () => timeline?.play());
  timelinePause?.addEventListener('click', () => timeline?.pause());
  timelineRestart?.addEventListener('click', () => timeline?.restart());

  // 6. Progress Tracking
  const progressBox = document.querySelector('.progress-box');
  const progressTrigger = document.getElementById('progress-trigger');
  const progressValue = document.getElementById('progress-value');

  progressTrigger?.addEventListener('click', () => {
    if (!progressBox) return;

    progressAnimation = gsap.to(progressBox, {
      x: 300,
      duration: 3,
      ease: 'none',
      onUpdate: function () {
        const progress = this.progress();
        if (progressValue) {
          progressValue.textContent = `${Math.round(progress * 100)}%`;
        }
      },
      onComplete: () => {
        if (progressValue) {
          progressValue.textContent = '100%';
        }
      },
    });
  });

  log('✓ Animations initialized', 'success');
}

/**
 * Reset all animations
 */
function resetAllAnimations(): void {
  log('🔄 Resetting all animations...', 'info');

  gsap.killTweensOf('.fade-box');
  gsap.killTweensOf('.slide-box');
  gsap.killTweensOf('.scale-box');
  gsap.killTweensOf('.rotation-box');
  gsap.killTweensOf('.timeline-box');
  gsap.killTweensOf('.progress-box');

  timeline?.kill();
  timeline = null;

  gsap.set('.fade-box', { opacity: 0 });
  gsap.set('.slide-box', { x: 0 });
  gsap.set('.scale-box', { scale: 1 });
  gsap.set('.rotation-box', { rotation: 0 });
  gsap.set('.timeline-box', { x: 0, y: 0 });
  gsap.set('.progress-box', { x: 0 });

  const progressValue = document.getElementById('progress-value');
  if (progressValue) {
    progressValue.textContent = '0%';
  }

  initAnimations();
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
    const results = await runTestsFromFile('/test-specs/gsap.spec.json');

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
 * Run custom spec from text input
 */
async function runCustomSpec(): Promise<void> {
  log('🧪 Running custom spec...', 'info');

  const customSpecInput = document.getElementById('customSpecInput') as HTMLTextAreaElement;
  const reporterContainer = document.getElementById('reporter-container')!;
  reporterContainer.innerHTML = '<p>Loading tests...</p>';

  try {
    // Parse JSON
    const specText = customSpecInput.value.trim();
    if (!specText) {
      throw new Error('Please enter a JSON test spec');
    }

    const spec = JSON.parse(specText);
    log('📝 Parsed custom spec successfully', 'info');

    // Run tests
    const results = await runTestsFromObject(spec);
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
    log(`❌ Custom spec execution failed: ${error}`, 'error');
    reporterContainer.innerHTML = `<p class="error">Error: ${error}</p>`;
  }
}

/**
 * Load default spec into editor
 */
async function loadDefaultSpec(): Promise<void> {
  log('📥 Loading default spec...', 'info');

  try {
    const response = await fetch('/test-specs/gsap.spec.json');
    if (!response.ok) {
      throw new Error(`Failed to load spec: ${response.statusText}`);
    }

    const spec = await response.json();
    const customSpecInput = document.getElementById('customSpecInput') as HTMLTextAreaElement;
    customSpecInput.value = JSON.stringify(spec, null, 2);

    log('✅ Default spec loaded into editor', 'success');
  } catch (error) {
    log(`❌ Failed to load default spec: ${error}`, 'error');
  }
}

/**
 * Toggle custom spec panel
 */
function toggleCustomSpecPanel(): void {
  const panel = document.getElementById('custom-spec-panel')!;
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    log('📝 Custom spec panel opened', 'info');
  } else {
    panel.style.display = 'none';
    log('📝 Custom spec panel closed', 'info');
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
  initAnimations();

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

  // Custom spec controls
  document.getElementById('runCustomSpec')?.addEventListener('click', toggleCustomSpecPanel);
  document.getElementById('closeSpecPanel')?.addEventListener('click', toggleCustomSpecPanel);
  document.getElementById('executeCustomSpec')?.addEventListener('click', async () => {
    const btn = document.getElementById('executeCustomSpec') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = '⏳ Executing...';

    try {
      await runCustomSpec();
    } finally {
      btn.disabled = false;
      btn.textContent = 'Execute Custom Spec';
    }
  });
  document.getElementById('loadDefaultSpec')?.addEventListener('click', loadDefaultSpec);

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
  (window as any).gsapTest = {
    resetAllAnimations,
    runAllTests,
    getTimeline: () => timeline,
  };
}
