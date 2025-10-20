import { createLineMatching } from '../../lib/advanced/line-matching';

let matchingInstance: ReturnType<typeof createLineMatching> | null = null;
let correctCount = 0;
let incorrectCount = 0;

function initGame(): void {
  // 카운터 초기화
  correctCount = 0;
  incorrectCount = 0;
  updateStatus();

  // 매칭 게임 설정 (새로운 포인트 기반 API)
  matchingInstance = createLineMatching({
    // 아이템 정의 (ID와 선택자, 포인트 위치)
    items: {
      // A 그룹 (위쪽) - 포인트를 아래쪽에 배치
      'a0': { selector: '#a1', point: { x: 'center', y: 'bottom' } },
      'a1': { selector: '#a2', point: { x: 'center', y: 'bottom' } },
      'a2': { selector: '#a3', point: { x: 'center', y: 'bottom' } },
      'a3': { selector: '#a4', point: { x: 'center', y: 'bottom' } },

      // B 그룹 (아래쪽) - 포인트를 위쪽에 배치
      'b0': { selector: '#b1', point: { x: 'center', y: 'top' } },
      'b1': { selector: '#b2', point: { x: 'center', y: 'top' } },
      'b2': { selector: '#b3', point: { x: 'center', y: 'top' } },
      'b3': { selector: '#b4', point: { x: 'center', y: 'top' } }
    },

    // 정답 매핑 (더 직관적!)
    // 단일 정답: 'a0': 'b1'
    // 다중 정답: 'a0': ['b1', 'b2'] (여러 개가 정답일 때)
    pairs: {
      'a0': 'b1',  // 사과 - Apple
      'a1': 'b3',  // 바나나 - Banana
      'a2': 'b2',  // 오렌지 - Orange
      'a3': 'b0'   // 포도 - Grape
      // 다중 정답 예시: 'a0': ['b1', 'b2'] - a0은 b1 또는 b2 모두 정답
    },

    // 포인트 스타일
    pointSize: 20,
    pointColor: '#667eea',
    pointHoverColor: '#764ba2',

    // 선 스타일
    lineColor: '#999',
    lineWidth: 3,
    correctColor: '#4CAF50',
    incorrectColor: '#F44336',

    // 고급 선 스타일 (선택 사항)
    // lineStyle: 'solid',        // 'solid' | 'dashed' | 'dotted' | 'animated-dash' | 'arrow'
    // dashArray: '5,5',          // 점선 패턴 (dashed, animated-dash 사용 시)
    // arrowSize: 10,             // 화살표 크기 (arrow 사용 시)
    // 💡 stroke-preview.html에서 다양한 스타일을 확인하세요!

    // 옵션
    allowMultipleAttempts: true,
    showFeedback: true,
    bidirectional: false,  // A에서 B로만 연결 가능

    // 콜백
    onCorrect: (fromId: string, toId: string) => {
      console.log('✅ 정답!', fromId, '→', toId);
      correctCount++;
      updateStatus();
    },
    onIncorrect: (fromId: string, toId: string) => {
      console.log('❌ 오답!', fromId, '→', toId);
      incorrectCount++;
      updateStatus();
    },
    onComplete: (score: number, total: number) => {
      console.log(`🎉 완료! ${score}/${total}`);
      showCompleteFeedback();
    }
  });
}

function resetGame(): void {
  if (matchingInstance) {
    matchingInstance.reset();
    correctCount = 0;
    incorrectCount = 0;
    updateStatus();
  }
}

function updateStatus(): void {
  const correctCountEl = document.getElementById('correct-count');
  const incorrectCountEl = document.getElementById('incorrect-count');

  if (correctCountEl) correctCountEl.textContent = String(correctCount);
  if (incorrectCountEl) incorrectCountEl.textContent = String(incorrectCount);
}

function showCompleteFeedback(): void {
  const feedback = document.getElementById('feedback');
  if (!feedback) return;

  feedback.classList.add('show');

  setTimeout(() => {
    feedback.classList.remove('show');
  }, 3000);
}

// 페이지 로드 시 게임 초기화
window.addEventListener('load', () => {
  initGame();
});

// Make resetGame available globally for the onclick handler
(window as any).resetGame = resetGame;
