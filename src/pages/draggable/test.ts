/**
 * GSAP Kit - Draggable Page Tests
 * 드래그 기능 자동화 테스트
 */

import { createReport, describe, testDrag, testRunner } from '../../lib/testing';

// Logger
const logContainer = document.getElementById('test-log');

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
  if (!logContainer) return;

  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;

  const timestamp = new Date().toLocaleTimeString();
  entry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${message}`;

  logContainer.appendChild(entry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// Test Settings
let visualizeEnabled = true;
let slowMotionEnabled = false;

function getBaseDuration(): number {
  return slowMotionEnabled ? 2000 : 800;
}

// Define Tests
function defineTests(): void {
  log('📝 Defining draggable tests...', 'info');

  const baseDuration = getBaseDuration();

  // Test Suite 1: Free Drag
  describe(
    'Draggable: Free Movement',
    [
      testDrag(
        'Drag free box horizontally',
        '.drag-free',
        { x: 100, y: 0 },
        async () => {
          const element = document.querySelector('.drag-free') as HTMLElement;
          if (!element) return false;

          // GSAP의 transform 값 확인
          const matrix = window.getComputedStyle(element).transform;
          if (matrix === 'none') return false;

          const values = matrix.match(/matrix.*\((.+)\)/)?.[1].split(', ');
          if (!values) return false;

          const x = Number.parseFloat(values[4]);
          const moved = Math.abs(x) > 50; // 50px 이상 이동했는지 확인

          log(`  ✓ Free drag X: ${x.toFixed(2)}px (${moved ? 'PASS' : 'FAIL'})`, moved ? 'success' : 'error');
          return moved;
        },
        {
          description: 'Should allow free horizontal drag',
          simulation: {
            from: '.drag-free',
            to: { x: window.innerWidth / 2 + 100, y: window.innerHeight / 2 },
            duration: baseDuration,
            curvature: 0.2,
          },
          visualization: visualizeEnabled
            ? {
                pathColor: '#667eea',
                showCursor: true,
                autoRemove: true,
              }
            : undefined,
        }
      ),

      testDrag(
        'Drag free box in circle',
        '.drag-free',
        { x: 0, y: 100 },
        async () => {
          const element = document.querySelector('.drag-free') as HTMLElement;
          if (!element) return false;

          const matrix = window.getComputedStyle(element).transform;
          if (matrix === 'none') return false;

          const values = matrix.match(/matrix.*\((.+)\)/)?.[1].split(', ');
          if (!values) return false;

          const y = Number.parseFloat(values[5]);
          const moved = Math.abs(y) > 50;

          log(`  ✓ Free drag Y: ${y.toFixed(2)}px (${moved ? 'PASS' : 'FAIL'})`, moved ? 'success' : 'error');
          return moved;
        },
        {
          description: 'Should allow free vertical drag',
          simulation: {
            from: '.drag-free',
            to: { x: window.innerWidth / 2, y: window.innerHeight / 2 + 100 },
            duration: baseDuration,
            curvature: 0.4,
          },
          visualization: visualizeEnabled
            ? {
                pathColor: '#48bb78',
                showCursor: true,
                autoRemove: true,
              }
            : undefined,
          setup: async () => {
            // Reset position
            const element = document.querySelector('.drag-free') as HTMLElement;
            if (element) {
              gsap.set(element, { x: 0, y: 0 });
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          },
        }
      ),
    ],
    {
      description: 'Test free drag movement',
      beforeAll: () => {
        log('🚀 Starting free drag tests...', 'info');
      },
      afterAll: () => {
        log('✓ Free drag tests completed', 'success');
      },
    }
  );

  // Test Suite 2: Axis-Constrained Drag
  describe(
    'Draggable: Axis Constraints',
    [
      testDrag(
        'Drag X-only box horizontally',
        '.drag-box-x',
        { x: 150, y: 0 },
        async () => {
          const element = document.querySelector('.drag-box-x') as HTMLElement;
          if (!element) return false;

          const matrix = window.getComputedStyle(element).transform;
          if (matrix === 'none') return false;

          const values = matrix.match(/matrix.*\((.+)\)/)?.[1].split(', ');
          if (!values) return false;

          const x = Number.parseFloat(values[4]);
          const y = Number.parseFloat(values[5]);

          const xMoved = Math.abs(x) > 50;
          const yConstrained = Math.abs(y) < 10; // Y축은 거의 이동 안 함
          const passed = xMoved && yConstrained;

          log(
            `  ✓ X-only: X=${x.toFixed(2)}px, Y=${y.toFixed(2)}px (${passed ? 'PASS' : 'FAIL'})`,
            passed ? 'success' : 'error'
          );
          return passed;
        },
        {
          description: 'Should only move along X axis',
          simulation: {
            from: '.drag-box-x',
            to: { x: window.innerWidth / 2 + 150, y: window.innerHeight / 2 + 50 }, // Y도 시도하지만 막혀야 함
            duration: baseDuration,
          },
          visualization: visualizeEnabled
            ? {
                pathColor: '#f56565',
                showCursor: true,
                autoRemove: true,
              }
            : undefined,
          setup: async () => {
            const element = document.querySelector('.drag-box-x') as HTMLElement;
            if (element) {
              gsap.set(element, { x: 0, y: 0 });
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          },
        }
      ),

      testDrag(
        'Drag Y-only box vertically',
        '.drag-box-y',
        { x: 0, y: 150 },
        async () => {
          const element = document.querySelector('.drag-box-y') as HTMLElement;
          if (!element) return false;

          const matrix = window.getComputedStyle(element).transform;
          if (matrix === 'none') return false;

          const values = matrix.match(/matrix.*\((.+)\)/)?.[1].split(', ');
          if (!values) return false;

          const x = Number.parseFloat(values[4]);
          const y = Number.parseFloat(values[5]);

          const yMoved = Math.abs(y) > 50;
          const xConstrained = Math.abs(x) < 10; // X축은 거의 이동 안 함
          const passed = yMoved && xConstrained;

          log(
            `  ✓ Y-only: X=${x.toFixed(2)}px, Y=${y.toFixed(2)}px (${passed ? 'PASS' : 'FAIL'})`,
            passed ? 'success' : 'error'
          );
          return passed;
        },
        {
          description: 'Should only move along Y axis',
          simulation: {
            from: '.drag-box-y',
            to: { x: window.innerWidth / 2 + 50, y: window.innerHeight / 2 + 150 }, // X도 시도하지만 막혀야 함
            duration: baseDuration,
          },
          visualization: visualizeEnabled
            ? {
                pathColor: '#ed8936',
                showCursor: true,
                autoRemove: true,
              }
            : undefined,
          setup: async () => {
            const element = document.querySelector('.drag-box-y') as HTMLElement;
            if (element) {
              gsap.set(element, { x: 0, y: 0 });
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          },
        }
      ),
    ],
    {
      description: 'Test axis-constrained drag',
      beforeAll: () => {
        log('🚀 Starting axis constraint tests...', 'info');
      },
      afterAll: () => {
        log('✓ Axis constraint tests completed', 'success');
      },
    }
  );

  // Test Suite 3: Bounded Drag
  describe(
    'Draggable: Boundary Constraints',
    [
      testDrag(
        'Drag bounded box within bounds',
        '#bounded-box',
        { x: 100, y: 100 },
        async () => {
          const element = document.querySelector('#bounded-box') as HTMLElement;
          const bounds = document.querySelector('#bounded-area') as HTMLElement;

          if (!element || !bounds) return false;

          const elementRect = element.getBoundingClientRect();
          const boundsRect = bounds.getBoundingClientRect();

          // 요소가 경계 안에 있는지 확인
          const withinBounds =
            elementRect.left >= boundsRect.left - 5 && // 약간의 오차 허용
            elementRect.right <= boundsRect.right + 5 &&
            elementRect.top >= boundsRect.top - 5 &&
            elementRect.bottom <= boundsRect.bottom + 5;

          log(
            `  ✓ Bounded drag: ${withinBounds ? 'Within bounds' : 'Outside bounds'} (${withinBounds ? 'PASS' : 'FAIL'})`,
            withinBounds ? 'success' : 'error'
          );
          return withinBounds;
        },
        {
          description: 'Should stay within bounded area',
          simulation: {
            from: '#bounded-box',
            to: { x: window.innerWidth / 2 + 100, y: window.innerHeight / 2 + 100 },
            duration: baseDuration * 1.5,
            curvature: 0.3,
          },
          visualization: visualizeEnabled
            ? {
                pathColor: '#9f7aea',
                showCursor: true,
                autoRemove: true,
              }
            : undefined,
          setup: async () => {
            const element = document.querySelector('#bounded-box') as HTMLElement;
            if (element) {
              gsap.set(element, { x: 0, y: 0 });
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          },
        }
      ),
    ],
    {
      description: 'Test boundary-constrained drag',
      beforeAll: () => {
        log('🚀 Starting boundary constraint tests...', 'info');
      },
      afterAll: () => {
        log('✓ Boundary constraint tests completed', 'success');
      },
    }
  );

  // Test Suite 4: Control Tests
  describe(
    'Draggable: Enable/Disable Controls',
    [
      testDrag(
        'Drag controllable box (enabled)',
        '.drag-controllable',
        { x: 80, y: 80 },
        async () => {
          const element = document.querySelector('.drag-controllable') as HTMLElement;
          if (!element) return false;

          const matrix = window.getComputedStyle(element).transform;
          if (matrix === 'none') return false;

          const values = matrix.match(/matrix.*\((.+)\)/)?.[1].split(', ');
          if (!values) return false;

          const x = Number.parseFloat(values[4]);
          const y = Number.parseFloat(values[5]);
          const moved = Math.abs(x) > 30 || Math.abs(y) > 30;

          log(
            `  ✓ Controllable (enabled): Moved ${moved ? 'YES' : 'NO'} (${moved ? 'PASS' : 'FAIL'})`,
            moved ? 'success' : 'error'
          );
          return moved;
        },
        {
          description: 'Should be draggable when enabled',
          simulation: {
            from: '.drag-controllable',
            to: { x: window.innerWidth / 2 + 80, y: window.innerHeight / 2 + 80 },
            duration: baseDuration,
          },
          visualization: visualizeEnabled
            ? {
                pathColor: '#38b2ac',
                showCursor: true,
                autoRemove: true,
              }
            : undefined,
          setup: async () => {
            // Ensure it's enabled
            if (typeof (window as any).enableControl === 'function') {
              (window as any).enableControl();
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          },
        }
      ),
    ],
    {
      description: 'Test enable/disable controls',
      beforeAll: () => {
        log('🚀 Starting control tests...', 'info');
      },
      afterAll: () => {
        log('✓ Control tests completed', 'success');
      },
    }
  );

  log(`✓ Defined ${testRunner.getSuites().reduce((sum, suite) => sum + suite.tests.length, 0)} test cases`, 'success');
}

// Test Execution
async function runAllTests(): Promise<void> {
  log('▶ Running all tests...', 'info');

  try {
    const results = await testRunner.runAll();

    log(`✓ Tests completed: ${results.size} suites`, 'success');

    // Show report
    createReport(results, {
      container: '#test-results',
      theme: 'light',
    });

    // Log statistics
    const stats = testRunner.getStats();
    log(
      `📊 Stats: ${stats.passed}/${stats.total} passed, ${stats.failed} failed, ${(stats.duration / 1000).toFixed(2)}s`,
      stats.failed === 0 ? 'success' : 'warning'
    );
  } catch (error) {
    log(`❌ Test execution error: ${error}`, 'error');
  }
}

function clearTests(): void {
  const resultsContainer = document.getElementById('test-results');
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
  }
  if (logContainer) {
    logContainer.innerHTML = '';
  }
  log('🧹 Cleared test results', 'info');
}

function resetAllElements(): void {
  const elements = [
    '.drag-free',
    '.drag-box-x',
    '.drag-box-y',
    '#bounded-box',
    '.drag-box-inertia',
    '.drag-controllable',
  ];

  elements.forEach(selector => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      gsap.set(element, { x: 0, y: 0, rotation: 0 });
    }
  });

  log('🔄 Reset all elements', 'info');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  log('🎬 Draggable Test Runner initialized', 'info');

  // Define tests
  defineTests();

  // Button handlers
  const runAllBtn = document.getElementById('runAllTests');
  const clearBtn = document.getElementById('clearTests');
  const resetBtn = document.getElementById('resetElements');
  const visualizeToggle = document.getElementById('visualizeToggle') as HTMLInputElement;
  const slowMotionToggle = document.getElementById('slowMotionToggle') as HTMLInputElement;

  if (runAllBtn) {
    runAllBtn.addEventListener('click', () => {
      runAllTests();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearTests();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetAllElements();
    });
  }

  if (visualizeToggle) {
    visualizeToggle.addEventListener('change', e => {
      visualizeEnabled = (e.target as HTMLInputElement).checked;
      log(`🎨 Path visualization: ${visualizeEnabled ? 'ON' : 'OFF'}`, 'info');
      testRunner.reset();
      defineTests();
    });
  }

  if (slowMotionToggle) {
    slowMotionToggle.addEventListener('change', e => {
      slowMotionEnabled = (e.target as HTMLInputElement).checked;
      log(`⏱️ Slow motion: ${slowMotionEnabled ? 'ON (2.5x)' : 'OFF'}`, 'info');
      testRunner.reset();
      defineTests();
    });
  }

  log('✓ Ready! Click "Run All Tests" to start', 'success');
});
