import { createLineMatching } from '../../lib/advanced/line-matching';
import { createReport, describe, setupGlobalAutomation, type TestCase, testDrag, testRunner } from '../../lib/testing';

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
      '#fruit-1 .line-matching-point',
      '#english-1 .line-matching-point',
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
          from: '#fruit-1 .line-matching-point',
          to: '#english-1 .line-matching-point',
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
        teardown: async () => {
          // 연결된 라인을 볼 수 있도록 2초 대기
          await new Promise(resolve => setTimeout(resolve, 2000));
        },
      }
    ),

    testDrag(
      'Drag 바나나 to Banana (Correct)',
      '#fruit-2 .line-matching-point',
      '#english-3 .line-matching-point',
      () => {
        const passed = correctCount > 0;
        log(
          `  ✓ Assertion: correctCount=${correctCount} (expected > 0) → ${passed ? 'PASS' : 'FAIL'}`,
          passed ? 'success' : 'error'
        );
        return passed;
      },
      {
        description: 'Should connect 바나나 to Banana correctly',
        simulation: {
          from: '#fruit-2 .line-matching-point',
          to: '#english-3 .line-matching-point',
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
          resetGame();
          await new Promise(resolve => setTimeout(resolve, 200));
        },
        teardown: async () => {
          // 연결된 라인을 볼 수 있도록 2초 대기
          await new Promise(resolve => setTimeout(resolve, 2000));
        },
      }
    ),

    testDrag(
      'Drag 사과 to Orange (Incorrect)',
      '#fruit-1 .line-matching-point',
      '#english-2 .line-matching-point',
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
          from: '#fruit-1 .line-matching-point',
          to: '#english-2 .line-matching-point',
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
        teardown: async () => {
          // 오답 연결도 볼 수 있도록 2초 대기
          await new Promise(resolve => setTimeout(resolve, 2000));
        },
      }
    ),

    testDrag(
      'Drag 오렌지 to Orange (Correct)',
      '#fruit-3 .line-matching-point',
      '#english-2 .line-matching-point',
      () => {
        // 오렌지 → Orange 정답 연결 확인
        const passed = correctCount > 0;
        log(
          `  ✓ Assertion: correctCount=${correctCount} (expected > 0) → ${passed ? 'PASS' : 'FAIL'}`,
          passed ? 'success' : 'error'
        );
        return passed;
      },
      {
        description: 'Should connect 오렌지 to Orange correctly',
        simulation: {
          from: '#fruit-3 .line-matching-point',
          to: '#english-2 .line-matching-point',
          duration: baseDuration,
          curvature: 0.4,
        },
        visualization: visualizeEnabled
          ? {
              pathColor: '#ed8936',
              showCursor: true,
              autoRemove: true,
            }
          : undefined,
        setup: async () => {
          resetGame();
          await new Promise(resolve => setTimeout(resolve, 200));
        },
        teardown: async () => {
          // 연결된 라인을 볼 수 있도록 2초 대기
          await new Promise(resolve => setTimeout(resolve, 2000));
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

  // Setup global automation API
  setupGlobalAutomation(testRunner, {
    autoStart: false, // 자동 시작은 URL 파라미터로 제어
    startDelay: 500,
    onComplete: result => {
      console.log('✅ Automated test completed:', result);
      log(
        `🎉 Automated test completed: ${result.passed}/${result.total} passed`,
        result.failed === 0 ? 'success' : 'warning'
      );
    },
  });

  // URL 파라미터로 자동 시작 제어
  const urlParams = new URLSearchParams(window.location.search);
  const autoRun = urlParams.get('autoRun') === 'true';

  if (autoRun) {
    log('🤖 Auto-run enabled, starting tests...', 'info');
    setTimeout(() => {
      runAllTests();
    }, 1000);
  }
});
