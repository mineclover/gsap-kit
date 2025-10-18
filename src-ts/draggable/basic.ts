/**
 * GSAP Kit - 기본 Draggable 함수 (TypeScript)
 * Draggable CDN: https://cdn.jsdelivr.net/npm/gsap@3.13/dist/Draggable.min.js
 */

/// <reference types="gsap" />

/**
 * Draggable 플러그인 등록
 */
if (typeof gsap !== 'undefined' && typeof Draggable !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

/**
 * 드래그 옵션 인터페이스
 */
interface DraggableOptions {
  type?: 'x' | 'y' | 'x,y' | 'rotation';
  inertia?: boolean;
  bounds?: Window | string | HTMLElement | DOMRect | { top?: number; left?: number; width?: number; height?: number };
  onDragStart?: (this: Draggable) => void;
  onDrag?: (this: Draggable) => void;
  onDragEnd?: (this: Draggable) => void;
  cursor?: string;
  activeCursor?: string;
  [key: string]: any;
}

/**
 * 요소를 자유롭게 드래그 가능하게 만듭니다
 * @param target - CSS 선택자 또는 DOM 요소
 * @param options - 드래그 옵션
 * @returns Draggable 인스턴스 배열
 */
function makeDraggable(
  target: string | HTMLElement | NodeListOf<HTMLElement>,
  options: DraggableOptions = {}
): Draggable[] | null {
  if (!target) {
    console.error('[GSAP Kit] target이 필요합니다');
    return null;
  }

  const defaults: DraggableOptions = {
    type: 'x,y',
    inertia: false,
    cursor: 'grab'
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
    activeCursor: 'grabbing'
  });

  return draggableInstances;
}

/**
 * X축(가로)으로만 드래그 가능하게 만듭니다
 */
function makeDraggableX(
  target: string | HTMLElement | NodeListOf<HTMLElement>,
  options: DraggableOptions = {}
): Draggable[] | null {
  return makeDraggable(target, {
    ...options,
    type: 'x'
  });
}

/**
 * Y축(세로)으로만 드래그 가능하게 만듭니다
 */
function makeDraggableY(
  target: string | HTMLElement | NodeListOf<HTMLElement>,
  options: DraggableOptions = {}
): Draggable[] | null {
  return makeDraggable(target, {
    ...options,
    type: 'y'
  });
}

/**
 * 경계 내에서만 드래그 가능하게 만듭니다
 */
function makeDraggableWithBounds(
  target: string | HTMLElement | NodeListOf<HTMLElement>,
  options: DraggableOptions = {}
): Draggable[] | null {
  const defaults: DraggableOptions = {
    bounds: window
  };

  return makeDraggable(target, {
    ...defaults,
    ...options
  });
}

/**
 * 부모 요소 내에서만 드래그 가능하게 만듭니다
 */
function makeDraggableInParent(
  target: string | HTMLElement,
  options: DraggableOptions = {}
): Draggable[] | null {
  if (!target) {
    console.error('[GSAP Kit] target이 필요합니다');
    return null;
  }

  const defaults: DraggableOptions = {
    type: 'x,y',
    inertia: false,
    cursor: 'grab'
  };

  const config = { ...defaults, ...options };

  // 부모 요소 찾기
  const element = typeof target === 'string' ? document.querySelector(target) as HTMLElement : target;
  const parent = element?.parentElement;

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
    activeCursor: 'grabbing'
  });
}

/**
 * 관성(던지기) 효과와 함께 드래그 가능하게 만듭니다
 */
function makeDraggableWithInertia(
  target: string | HTMLElement | NodeListOf<HTMLElement>,
  options: DraggableOptions = {}
): Draggable[] | null {
  const defaults: DraggableOptions = {
    inertia: true
  };

  return makeDraggable(target, {
    ...defaults,
    ...options
  });
}

/**
 * 요소를 회전 가능하게 만듭니다
 */
function makeRotatable(
  target: string | HTMLElement | NodeListOf<HTMLElement>,
  options: DraggableOptions = {}
): Draggable[] | null {
  return makeDraggable(target, {
    ...options,
    type: 'rotation'
  });
}

/**
 * 모든 Draggable 인스턴스 비활성화
 */
function disableDraggable(instances: Draggable[] | null): void {
  if (!instances) return;
  instances.forEach(instance => instance.disable());
}

/**
 * 모든 Draggable 인스턴스 활성화
 */
function enableDraggable(instances: Draggable[] | null): void {
  if (!instances) return;
  instances.forEach(instance => instance.enable());
}

/**
 * 모든 Draggable 인스턴스 제거
 */
function killDraggable(instances: Draggable[] | null): void {
  if (!instances) return;
  instances.forEach(instance => instance.kill());
}
