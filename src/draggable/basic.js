/**
 * GSAP Kit - 기본 Draggable 함수
 * Draggable CDN: https://cdn.jsdelivr.net/npm/gsap@3.13/dist/Draggable.min.js
 */

/**
 * Draggable 플러그인 등록 (최초 1회 실행)
 */
if (typeof gsap !== 'undefined' && typeof Draggable !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

/**
 * 요소를 자유롭게 드래그 가능하게 만듭니다
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 드래그 옵션
 * @param {string} [options.type="x,y"] - 드래그 타입 ("x", "y", "x,y", "rotation")
 * @param {boolean} [options.inertia=false] - 관성 효과 (던지기)
 * @param {Object|string|HTMLElement} [options.bounds] - 드래그 경계 (window, parent, {top, left, width, height} 등)
 * @param {Function} [options.onDragStart] - 드래그 시작 시 콜백
 * @param {Function} [options.onDrag] - 드래그 중 콜백
 * @param {Function} [options.onDragEnd] - 드래그 종료 시 콜백
 * @param {string} [options.cursor="grab"] - 커서 스타일
 * @returns {Array<Draggable>} Draggable 인스턴스 배열
 */
function makeDraggable(target, options = {}) {
  if (!target) {
    console.error('[GSAP Kit] target이 필요합니다');
    return null;
  }

  const defaults = {
    type: "x,y",
    inertia: false,
    cursor: "grab"
  };

  const config = { ...defaults, ...options };

  // Draggable 생성
  const draggableInstances = Draggable.create(target, {
    type: config.type,
    inertia: config.inertia,
    bounds: config.bounds,
    onDragStart: config.onDragStart,
    onDrag: config.onDrag,
    onDragEnd: config.onDragEnd,
    cursor: config.cursor,
    activeCursor: "grabbing"
  });

  return draggableInstances;
}

/**
 * X축(가로)으로만 드래그 가능하게 만듭니다
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 드래그 옵션
 * @returns {Array<Draggable>}
 */
function makeDraggableX(target, options = {}) {
  return makeDraggable(target, {
    ...options,
    type: "x"
  });
}

/**
 * Y축(세로)으로만 드래그 가능하게 만듭니다
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 드래그 옵션
 * @returns {Array<Draggable>}
 */
function makeDraggableY(target, options = {}) {
  return makeDraggable(target, {
    ...options,
    type: "y"
  });
}

/**
 * 경계 내에서만 드래그 가능하게 만듭니다
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 드래그 옵션
 * @param {Object|string|HTMLElement} [options.bounds] - 드래그 경계
 * @returns {Array<Draggable>}
 */
function makeDraggableWithBounds(target, options = {}) {
  const defaults = {
    bounds: window  // 기본값: 윈도우 경계
  };

  return makeDraggable(target, {
    ...defaults,
    ...options
  });
}

/**
 * 부모 요소 내에서만 드래그 가능하게 만듭니다
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 드래그 옵션
 * @returns {Array<Draggable>}
 */
function makeDraggableInParent(target, options = {}) {
  if (!target) {
    console.error('[GSAP Kit] target이 필요합니다');
    return null;
  }

  const defaults = {
    type: "x,y",
    inertia: false,
    cursor: "grab"
  };

  const config = { ...defaults, ...options };

  // 부모 요소 찾기
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  const parent = element ? element.parentElement : null;

  if (!parent) {
    console.error('[GSAP Kit] 부모 요소를 찾을 수 없습니다');
    return null;
  }

  // Draggable 생성
  return Draggable.create(target, {
    type: config.type,
    inertia: config.inertia,
    bounds: parent,
    onDragStart: config.onDragStart,
    onDrag: config.onDrag,
    onDragEnd: config.onDragEnd,
    cursor: config.cursor,
    activeCursor: "grabbing"
  });
}

/**
 * 관성(던지기) 효과와 함께 드래그 가능하게 만듭니다
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 드래그 옵션
 * @param {number} [options.inertiaResistance=1000] - 관성 저항 (클수록 빨리 멈춤)
 * @returns {Array<Draggable>}
 */
function makeDraggableWithInertia(target, options = {}) {
  const defaults = {
    inertia: true,
    inertiaResistance: 1000
  };

  return makeDraggable(target, {
    ...defaults,
    ...options
  });
}

/**
 * 요소를 회전 가능하게 만듭니다
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 드래그 옵션
 * @returns {Array<Draggable>}
 */
function makeRotatable(target, options = {}) {
  return makeDraggable(target, {
    ...options,
    type: "rotation"
  });
}

/**
 * 모든 Draggable 인스턴스 비활성화
 * @param {Array<Draggable>} instances - Draggable 인스턴스 배열
 */
function disableDraggable(instances) {
  if (!instances) return;
  instances.forEach(instance => instance.disable());
}

/**
 * 모든 Draggable 인스턴스 활성화
 * @param {Array<Draggable>} instances - Draggable 인스턴스 배열
 */
function enableDraggable(instances) {
  if (!instances) return;
  instances.forEach(instance => instance.enable());
}

/**
 * 모든 Draggable 인스턴스 제거
 * @param {Array<Draggable>} instances - Draggable 인스턴스 배열
 */
function killDraggable(instances) {
  if (!instances) return;
  instances.forEach(instance => instance.kill());
}
