import { createLineMatching } from '../../lib/advanced/line-matching';
import { createReport, describe, type TestCase, testDrag, testRunner } from '../../lib/testing';

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

// Game State
let matchingInstance: ReturnType<typeof createLineMatching> | null = null;
let correctCount = 0;
let incorrectCount = 0;
let visualizeEnabled = true;
let slowMotionEnabled = false;

// Initialize Line Matching Game
function initGame(): void {
  log('🎮 Initializing Line Matching game...', 'info');

  correctCount = 0;
  incorrectCount = 0;
  updateGameStatus();

  matchingInstance = createLineMatching({
    items: {
      a1: { selector: '#fruit-1', point: { x: 'right', y: 'center' } },
      a2: { selector: '#fruit-2', point: { x: 'right', y: 'center' } },
      a3: { selector: '#fruit-3', point: { x: 'right', y: 'center' } },
      b1: { selector: '#english-1', point: { x: 'left', y: 'center' } },
      b2: { selector: '#english-2', point: { x: 'left', y: 'center' } },
      b3: { selector: '#english-3', point: { x: 'left', y: 'center' } },
    },
    pairs: {
      a1: 'b1', // 사과 - Apple
      a2: 'b3', // 바나나 - Banana
      a3: 'b2', // 오렌지 - Orange
    },
    lineWidth: 3,
    correctColor: '#4CAF50',
    incorrectColor: '#F44336',
    lineStyle: 'arrow',
    allowMultipleAttempts: true,
    showFeedback: true,
    onCorrect: (fromId, toId) => {
      correctCount++;
      updateGameStatus();
      log(`✅ Correct: ${fromId} → ${toId}`, 'success');
    },
    onIncorrect: (fromId, toId) => {
      incorrectCount++;
      updateGameStatus();
      log(`❌ Incorrect: ${fromId} → ${toId}`, 'error');
    },
    onComplete: (score, total) => {
      log(`🎉 Game complete! Score: ${score}/${total}`, 'success');
    },
  });

  log('✓ Game initialized', 'success');
}

function updateGameStatus(): void {
  const correctEl = document.getElementById('correctCount');
  const incorrectEl = document.getElementById('incorrectCount');
  if (correctEl) correctEl.textContent = String(correctCount);
  if (incorrectEl) incorrectEl.textContent = String(incorrectCount);
}

function resetGame(): void {
  if (matchingInstance) {
    matchingInstance.reset();
    correctCount = 0;
    incorrectCount = 0;
    updateGameStatus();
    log('🔄 Game reset', 'info');
  }
}

// Test Definitions
function defineTests(): void {
  log('📝 Defining test cases...', 'info');

  const baseDuration = slowMotionEnabled ? 3000 : 1000;

  // Test Suite: Drag Tests
  const dragTests: TestCase[] = [
    testDrag(
      'Drag 사과 to Apple (Correct)',
      '#fruit-1',
      '#english-1',
      () => {
        // 검증: 정답 연결이 되었는지
        const passed = correctCount > 0;
        log(
          `  ✓ Assertion: correctCount=${correctCount} (expected > 0) → ${passed ? 'PASS' : 'FAIL'}`,
          passed ? 'success' : 'error'
        );
        return passed;
      },
      {
        description: 'Should connect 사과 to Apple correctly',
        simulation: {
          from: '#fruit-1',
          to: '#english-1',
          duration: baseDuration,
          curvature: 0.3,
          dispatchEvents: true,
        },
        visualization: visualizeEnabled
          ? {
              pathColor: '#667eea',
              showCursor: true,
              autoRemove: true,
              removeDelay: 1000,
            }
          : undefined,
        setup: async () => {
          resetGame();
          // line-matching-point 생성을 위한 대기
          await new Promise(resolve => setTimeout(resolve, 200));
        },
      }
    ),

    testDrag(
      'Drag 바나나 to Banana (Correct)',
      '#fruit-2',
      '#english-3',
      () => {
        const passed = correctCount >= 1;
        log(
          `  ✓ Assertion: correctCount=${correctCount} (expected >= 1) → ${passed ? 'PASS' : 'FAIL'}`,
          passed ? 'success' : 'error'
        );
        return passed;
      },
      {
        description: 'Should connect 바나나 to Banana correctly',
        simulation: {
          from: '#fruit-2',
          to: '#english-3',
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
      }
    ),

    testDrag(
      'Drag 사과 to Orange (Incorrect)',
      '#fruit-1',
      '#english-2',
      () => {
        // 오답이므로 incorrectCount가 증가해야 함
        const passed = incorrectCount > 0;
        log(
          `  ✓ Assertion: incorrectCount=${incorrectCount} (expected > 0) → ${passed ? 'PASS' : 'FAIL'}`,
          passed ? 'success' : 'error'
        );
        return passed;
      },
      {
        description: 'Should detect incorrect connection',
        simulation: {
          from: '#fruit-1',
          to: '#english-2',
          duration: baseDuration,
          curvature: 0.5,
        },
        visualization: visualizeEnabled
          ? {
              pathColor: '#f56565',
              showCursor: true,
              autoRemove: true,
            }
          : undefined,
        setup: async () => {
          resetGame();
          await new Promise(resolve => setTimeout(resolve, 200));
        },
      }
    ),

    testDrag(
      'Complete All Matches',
      '#fruit-1',
      '#english-1',
      () => {
        const passed = correctCount === 3;
        log(
          `  ✓ Assertion: correctCount=${correctCount} (expected === 3) → ${passed ? 'PASS' : 'FAIL'}`,
          passed ? 'success' : 'error'
        );
        return passed;
      },
      {
        description: 'Should complete all correct matches',
        simulation: {
          from: '#fruit-1',
          to: '#english-1',
          duration: baseDuration,
        },
        visualization: visualizeEnabled
          ? {
              pathColor: '#667eea',
              showCursor: true,
              autoRemove: true,
            }
          : undefined,
        setup: async () => {
          resetGame();
          await new Promise(resolve => setTimeout(resolve, 200));
          // 시뮬레이션을 사용하여 나머지 매칭 완료
          const { simulateDrag } = await import('../../lib/testing');
          await simulateDrag('#fruit-2', '#english-3', {
            duration: baseDuration / 2,
          });
          await new Promise(resolve => setTimeout(resolve, 500));
          await simulateDrag('#fruit-3', '#english-2', {
            duration: baseDuration / 2,
          });
          await new Promise(resolve => setTimeout(resolve, 500));
        },
      }
    ),
  ];

  describe('Line Matching: Drag Interactions', dragTests, {
    description: 'Test drag-based line matching interactions',
    beforeAll: () => {
      log('🚀 Starting Line Matching drag tests...', 'info');
    },
    afterAll: () => {
      log('✓ Line Matching drag tests completed', 'success');
    },
  });

  log(`✓ Defined ${dragTests.length} test cases`, 'success');
}

// Test Execution
async function runAllTests(): Promise<void> {
  log('▶ Running all tests...', 'info');

  try {
    const results = await testRunner.runAll();

    log(`✓ Tests completed: ${results.size} suites`, 'success');

    // Show report
    const reporter = createReport(results, {
      container: '#reporter-container',
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

async function runDragTests(): Promise<void> {
  log('▶ Running drag tests only...', 'info');

  try {
    const results = await testRunner.runSuiteByName('Line Matching: Drag Interactions');

    if (results) {
      log(`✓ Drag tests completed: ${results.length} tests`, 'success');

      // Show report
      const reportMap = new Map([['Line Matching: Drag Interactions', results]]);
      createReport(reportMap, {
        container: '#reporter-container',
        theme: 'light',
      });
    }
  } catch (error) {
    log(`❌ Test execution error: ${error}`, 'error');
  }
}

function clearTests(): void {
  const reporterContainer = document.getElementById('reporter-container');
  if (reporterContainer) {
    reporterContainer.innerHTML = '';
  }
  logContainer.innerHTML = '';
  log('🧹 Cleared test results', 'info');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  log('🎬 Test Runner initialized', 'info');

  // Initialize game
  initGame();

  // Define tests
  defineTests();

  // Button handlers
  const runAllBtn = document.getElementById('runAllTests');
  const runDragBtn = document.getElementById('runDragTests');
  const clearBtn = document.getElementById('clearTests');
  const resetBtn = document.getElementById('resetGame');
  const visualizeToggle = document.getElementById('visualizeToggle') as HTMLInputElement;
  const slowMotionToggle = document.getElementById('slowMotionToggle') as HTMLInputElement;

  if (runAllBtn) {
    runAllBtn.addEventListener('click', () => {
      runAllTests();
    });
  }

  if (runDragBtn) {
    runDragBtn.addEventListener('click', () => {
      runDragTests();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearTests();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetGame();
    });
  }

  if (visualizeToggle) {
    visualizeToggle.addEventListener('change', e => {
      visualizeEnabled = (e.target as HTMLInputElement).checked;
      log(`🎨 Path visualization: ${visualizeEnabled ? 'ON' : 'OFF'}`, 'info');
      // Re-define tests with new visualization setting
      testRunner.reset();
      defineTests();
    });
  }

  if (slowMotionToggle) {
    slowMotionToggle.addEventListener('change', e => {
      slowMotionEnabled = (e.target as HTMLInputElement).checked;
      log(`⏱️ Slow motion: ${slowMotionEnabled ? 'ON (3x)' : 'OFF'}`, 'info');
      // Re-define tests with new duration
      testRunner.reset();
      defineTests();
    });
  }

  log('✓ Ready! Click "Run All Tests" to start', 'success');
});
