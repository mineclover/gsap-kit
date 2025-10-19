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
  console.log('[GSAP Kit] makeDraggableWithInertia 호출됨:', { target, options });

  // 속도 추적을 위한 변수
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let velocityX = 0;
  let velocityY = 0;

  const config: DraggableOptions = {
    type: 'x,y',
    bounds: options.bounds,
    cursor: 'grab',
    ...options,
    onDragStart: function(this: Draggable) {
      console.log('[GSAP Kit] Inertia Drag Start');
      lastX = this.x;
      lastY = this.y;
      lastTime = Date.now();

      if (options.onDragStart) {
        options.onDragStart.call(this);
      }
    },
    onDrag: function(this: Draggable) {
      const now = Date.now();
      const dt = now - lastTime;

      if (dt > 0) {
        velocityX = (this.x - lastX) / dt;
        velocityY = (this.y - lastY) / dt;
      }

      lastX = this.x;
      lastY = this.y;
      lastTime = now;

      if (options.onDrag) {
        options.onDrag.call(this);
      }
    },
    onDragEnd: function(this: Draggable) {
      console.log('[GSAP Kit] Inertia Drag End - Velocity:', velocityX, velocityY);

      // 관성 효과 적용 (속도가 충분히 클 때만)
      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

      if (speed > 0.5) {
        // 속도에 비례한 거리 계산
        const multiplier = 200; // 거리 배율

        let targetX = this.x + velocityX * multiplier;
        let targetY = this.y + velocityY * multiplier;

        // bounds가 있으면 경계 내로 제한
        if (options.bounds && this.maxX !== undefined && this.maxY !== undefined) {
          const minX = this.minX || 0;
          const minY = this.minY || 0;
          const maxX = this.maxX;
          const maxY = this.maxY;

          // 목표 위치를 경계 내로 클램핑
          targetX = Math.max(minX, Math.min(maxX, targetX));
          targetY = Math.max(minY, Math.min(maxY, targetY));

          console.log('[GSAP Kit] Bounds applied:', {
            bounds: { minX, minY, maxX, maxY },
            clamped: { x: targetX, y: targetY }
          });
        }

        console.log('[GSAP Kit] Throwing to:', targetX, targetY);

        gsap.to(this.target, {
          x: targetX,
          y: targetY,
          duration: 1.2,
          ease: 'power2.out'
        });
      }

      if (options.onDragEnd) {
        options.onDragEnd.call(this);
      }
    }
  };

  console.log('[GSAP Kit] Inertia 설정:', config);
  return Draggable.create(target, config);
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

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).makeDraggable = makeDraggable;
  (window as any).makeDraggableX = makeDraggableX;
  (window as any).makeDraggableY = makeDraggableY;
  (window as any).makeDraggableWithBounds = makeDraggableWithBounds;
  (window as any).makeDraggableWithInertia = makeDraggableWithInertia;
  (window as any).makeRotatable = makeRotatable;
  (window as any).disableDraggable = disableDraggable;
  (window as any).enableDraggable = enableDraggable;
  (window as any).killDraggable = killDraggable;
}
