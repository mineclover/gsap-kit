/**
 * GSAP Kit - JSON Spec Test Runner Page
 * JSON 스펙 기반 테스트 실행 페이지
 */

import { createLineMatching } from '../../lib/advanced/line-matching';
import {
  createReport,
  runTestsFromFile,
  runTestsFromObject,
  SpecRunner,
  setupGlobalAutomation,
  type TestFileSpec,
  testRunner,
} from '../../lib/testing';

// Logger
const logContainer = document.getElementById('log-container')!;

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
  if (!logContainer) return;

  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;

  const timestamp = new Date().toLocaleTimeString();
  entry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${message}`;

  logContainer.appendChild(entry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// Game State (for line-matching tests)
let matchingInstance: ReturnType<typeof createLineMatching> | null = null;
let correctCount = 0;
let incorrectCount = 0;

// Initialize Line Matching Game
function initGame(): void {
  log('🎮 Initializing Line Matching game...', 'info');

  // Destroy previous instance if exists
  if (matchingInstance) {
    log('Destroying previous instance', 'info');
    matchingInstance.destroy();
  }

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

// Expose functions to window for JSON spec access
(window as any).initGame = initGame;
(window as any).resetGame = resetGame;
(window as any).correctCount = 0;
(window as any).incorrectCount = 0;

// Update window counts when they change
Object.defineProperty(window, 'correctCount', {
  get: () => correctCount,
  set: value => {
    correctCount = value;
  },
});

Object.defineProperty(window, 'incorrectCount', {
  get: () => incorrectCount,
  set: value => {
    incorrectCount = value;
  },
});

// JSON Spec Runner
const specRunner = new SpecRunner(testRunner);

// Load and run tests from JSON file
async function loadAndRunSpec(filePath: string): Promise<void> {
  log(`📂 Loading test spec: ${filePath}`, 'info');

  try {
    const result = await runTestsFromFile(filePath);

    log(`✅ Tests completed: ${result.passed}/${result.total} passed`, result.failed === 0 ? 'success' : 'warning');

    // Show report
    createReport(result.raw, {
      container: '#reporter-container',
      theme: 'light',
    });

    // Log statistics
    log(
      `📊 Stats: ${result.passed}/${result.total} passed, ${result.failed} failed, ${(result.duration / 1000).toFixed(2)}s`,
      result.failed === 0 ? 'success' : 'warning'
    );

    // Save result to window
    (window as any).__SPEC_TEST_RESULT__ = result;
  } catch (error) {
    log(`❌ Failed to load/run spec: ${error}`, 'error');
    console.error(error);
  }
}

// Load and run tests from inline JSON
async function loadAndRunInlineSpec(spec: TestFileSpec): Promise<void> {
  log(`📝 Loading inline test spec`, 'info');

  try {
    const result = await runTestsFromObject(spec);

    log(`✅ Tests completed: ${result.passed}/${result.total} passed`, result.failed === 0 ? 'success' : 'warning');

    // Show report
    createReport(result.raw, {
      container: '#reporter-container',
      theme: 'light',
    });

    // Log statistics
    log(
      `📊 Stats: ${result.passed}/${result.total} passed, ${result.failed} failed, ${(result.duration / 1000).toFixed(2)}s`,
      result.failed === 0 ? 'success' : 'warning'
    );

    // Save result to window
    (window as any).__SPEC_TEST_RESULT__ = result;
  } catch (error) {
    log(`❌ Failed to run inline spec: ${error}`, 'error');
    console.error(error);
  }
}

// Clear results
function clearResults(): void {
  const reporterContainer = document.getElementById('reporter-container');
  if (reporterContainer) {
    reporterContainer.innerHTML = '';
  }
  if (logContainer) {
    logContainer.innerHTML = '';
  }
  log('🧹 Cleared results', 'info');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  log('🎬 JSON Spec Test Runner initialized', 'info');

  // Initialize game
  initGame();

  // Button handlers
  const loadLineMatchingBtn = document.getElementById('loadLineMatching');
  const loadDraggableBtn = document.getElementById('loadDraggable');
  const clearBtn = document.getElementById('clearResults');
  const resetBtn = document.getElementById('resetGame');
  const fileInput = document.getElementById('jsonFileInput') as HTMLInputElement;
  const loadFileBtn = document.getElementById('loadFile');

  if (loadLineMatchingBtn) {
    loadLineMatchingBtn.addEventListener('click', () => {
      loadAndRunSpec('/test-specs/line-matching.spec.json');
    });
  }

  if (loadDraggableBtn) {
    loadDraggableBtn.addEventListener('click', () => {
      loadAndRunSpec('/test-specs/draggable.spec.json');
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearResults();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetGame();
    });
  }

  if (loadFileBtn && fileInput) {
    loadFileBtn.addEventListener('click', () => {
      const file = fileInput.files?.[0];
      if (!file) {
        log('⚠️ No file selected', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const spec = JSON.parse(e.target?.result as string);
          loadAndRunInlineSpec(spec);
        } catch (error) {
          log(`❌ Invalid JSON file: ${error}`, 'error');
        }
      };
      reader.readAsText(file);
    });
  }

  // Setup global automation API
  setupGlobalAutomation(testRunner, {
    autoStart: false,
    startDelay: 500,
    onComplete: result => {
      console.log('✅ Automated test completed:', result);
    },
  });

  // URL 파라미터로 자동 로드
  const urlParams = new URLSearchParams(window.location.search);
  const specFile = urlParams.get('spec');

  if (specFile) {
    log(`🤖 Auto-loading spec: ${specFile}`, 'info');
    setTimeout(() => {
      loadAndRunSpec(specFile);
    }, 1000);
  }

  log('✓ Ready! Select a test spec or upload JSON file', 'success');
});

// Expose functions globally
(window as any).loadAndRunSpec = loadAndRunSpec;
(window as any).loadAndRunInlineSpec = loadAndRunInlineSpec;
(window as any).specRunner = specRunner;
