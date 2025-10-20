import { makeDraggable } from '../../lib/draggable/basic';

// 시간 업데이트
function updateTime(): void {
  const now = new Date();
  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    timeElement.textContent = now.toLocaleTimeString('ko-KR');
  }
}

updateTime();
setInterval(updateTime, 1000);

// 로드 시간
const loadTimeElement = document.getElementById('load-time');
if (loadTimeElement) {
  loadTimeElement.textContent = new Date().toLocaleTimeString('ko-KR');
}

// 로그 함수
function addLog(message: string): void {
  const logDiv = document.getElementById('log');
  if (!logDiv) return;

  const logItem = document.createElement('div');
  logItem.className = 'log-item new';
  logItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logDiv.insertBefore(logItem, logDiv.firstChild);

  // 최대 20개 로그만 유지
  while (logDiv.children.length > 20) {
    const lastChild = logDiv.lastChild;
    if (lastChild) {
      logDiv.removeChild(lastChild);
    }
  }

  setTimeout(() => logItem.classList.remove('new'), 500);
}

addLog('페이지 로드됨');

// TypeScript로 작성된 함수 테스트
try {
  addLog('makeDraggable 함수 호출 중...');

  const drag = makeDraggable('#test-box', {
    type: 'x,y',
    bounds: '#demo-area',
    onDragStart: function(this: Draggable.Vars) {
      addLog('✅ 드래그 시작!');
    },
    onDrag: function(this: Draggable.Vars) {
      // 너무 많은 로그 방지를 위해 주석 처리
      // addLog(`드래그 중: x=${Math.round(this.x)}, y=${Math.round(this.y)}`);
    },
    onDragEnd: function(this: Draggable.Vars) {
      addLog(`✅ 드래그 종료: x=${Math.round(this.x)}, y=${Math.round(this.y)}`);
    }
  });

  if (drag && drag.length > 0) {
    addLog('✅ Draggable 인스턴스 생성 성공!');
    addLog(`타입: ${typeof makeDraggable}`);
  } else {
    addLog('❌ Draggable 인스턴스 생성 실패');
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  addLog(`❌ 에러 발생: ${errorMessage}`);
  console.error(error);
}

// 페이지 리로드 감지
window.addEventListener('beforeunload', () => {
  addLog('페이지 리로드 중...');
});

addLog('스크립트 실행 완료');
