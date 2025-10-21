import {
  disableDraggable,
  enableDraggable,
  makeDraggable,
  makeDraggableWithInertia,
  makeDraggableX,
  makeDraggableY,
  makeRotatable,
} from '../../lib/draggable/basic';

// 1. 기본 자유 드래그
makeDraggable('.drag-free');

// 2. X축만
makeDraggableX('.drag-box-x');

// 3. Y축만
makeDraggableY('.drag-box-y');

// 4. 부모 요소 내 경계 제한
// 직접 Draggable.create 사용하여 테스트
const boundedBox = document.getElementById('bounded-box');
const boundedArea = document.getElementById('bounded-area');

console.log('박스 요소:', boundedBox);
console.log('부모 영역:', boundedArea);

if (boundedBox && boundedArea) {
  const boundedDrag = Draggable.create('#bounded-box', {
    type: 'x,y',
    bounds: '#bounded-area',
    cursor: 'grab',
    activeCursor: 'grabbing',
    onDragStart: () => {
      console.log('드래그 시작!');
    },
    onDrag: function () {
      console.log('드래그 중...', this.x, this.y);
    },
  });

  console.log('경계 제한 드래그 인스턴스:', boundedDrag);
} else {
  console.error('요소를 찾을 수 없습니다!');
}

// 5. 관성 효과
makeDraggableWithInertia('.drag-box-inertia', {
  bounds: '#inertia-area',
});

// 6. 회전
makeRotatable('.rotate-box');

// 7. 그리드 스냅 - 기본 드래그로 대체
makeDraggable('.snap-box', {
  bounds: '.grid-demo',
});

// 8-10. 고급 기능들은 향후 구현 예정
console.log('슬라이더, 정렬 가능한 리스트, 스와이프 기능은 고급 기능으로 향후 구현 예정');

// 11. 제어 가능한 드래그
const controllableInstance = makeDraggable('.drag-controllable', {
  bounds: '#controllable-area',
});

function disableControl() {
  disableDraggable(controllableInstance);
}

function enableControl() {
  enableDraggable(controllableInstance);
}

function resetControl() {
  gsap.to('.drag-controllable', {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: 'back.out(1.5)',
  });
}

// 전역으로 노출 (HTML onclick에서 사용)
(window as any).disableControl = disableControl;
(window as any).enableControl = enableControl;
(window as any).resetControl = resetControl;

// 페이지 로드 애니메이션
gsap.from('.section', {
  opacity: 0,
  y: 50,
  duration: 0.6,
  stagger: 0.1,
  ease: 'power2.out',
});

console.log('[GSAP Kit] Draggable 예제가 로드되었습니다');
