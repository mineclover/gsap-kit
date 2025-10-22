/**
 * Interaction Test Page (Web Component Version)
 * 웹 컴포넌트를 사용한 간소화된 버전
 */

import { createLineMatching } from '../../lib/advanced/line-matching';
import '../../lib/testing/test-runner-component';

// Game State
let matchingInstance: ReturnType<typeof createLineMatching> | null = null;
let correctCount = 0;
let incorrectCount = 0;

// Initialize Line Matching Game
function initGame(): void {
  console.log('🎮 Initializing Line Matching game...');

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
      console.log(`✅ Correct: ${fromId} → ${toId}`);
    },
    onIncorrect: (fromId, toId) => {
      incorrectCount++;
      updateGameStatus();
      console.log(`❌ Incorrect: ${fromId} → ${toId}`);
    },
    onComplete: (score, total) => {
      console.log(`🎉 Game complete! Score: ${score}/${total}`);
    },
  });

  console.log('✓ Game initialized');
}

function updateGameStatus(): void {
  const correctEl = document.getElementById('correctCount');
  const incorrectEl = document.getElementById('incorrectCount');
  if (correctEl) correctEl.textContent = String(correctCount);
  if (incorrectEl) incorrectEl.textContent = String(incorrectCount);

  // Update window globals for test assertions
  if (typeof window !== 'undefined') {
    (window as any).correctCount = correctCount;
    (window as any).incorrectCount = incorrectCount;
  }
}

function resetGame(): void {
  if (matchingInstance) {
    matchingInstance.reset();
    correctCount = 0;
    incorrectCount = 0;
    updateGameStatus();
    console.log('🔄 Game reset');
  }
}

// Expose to window for test access (required by line-matching.spec.json)
if (typeof window !== 'undefined') {
  (window as any).interactionTest = {
    resetGame,
    getCorrectCount: () => correctCount,
    getIncorrectCount: () => incorrectCount,
  };

  // Expose globals for spec assertions
  (window as any).correctCount = correctCount;
  (window as any).incorrectCount = incorrectCount;
  (window as any).resetGame = resetGame;
  (window as any).initGame = initGame;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎬 Interaction Test initialized');

  // Initialize game
  initGame();

  // Reset button handler
  const resetBtn = document.getElementById('resetGame');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetGame();
    });
  }

  console.log('✓ Ready!');
});
