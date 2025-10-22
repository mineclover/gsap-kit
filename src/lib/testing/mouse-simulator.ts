/**
 * GSAP Kit - Mouse Simulator
 * 셀렉터 기반 마우스 이벤트 시뮬레이션
 */

import { debug } from '../types';

/**
 * 좌표 타입
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 위치 타입
 */
export type PositionType =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/**
 * 마우스 시뮬레이션 옵션
 */
export interface MouseSimulatorOptions {
  /** 시작 셀렉터 또는 좌표 */
  from: string | Point;

  /** 끝 셀렉터 또는 좌표 */
  to: string | Point;

  /** 시작 위치 (요소 내 상대 위치: 'center', 'top-left', 등) */
  fromPosition?: PositionType;

  /** 끝 위치 */
  toPosition?: PositionType;

  /** 이동 시간 (ms) */
  duration?: number;

  /** 경로 곡률 (0~1, 0=직선, 1=곡선) */
  curvature?: number;

  /** 프레임 레이트 (fps) */
  fps?: number;

  /** 경로 시각화 여부 */
  visualize?: boolean;

  /** 이벤트 디스패치 여부 */
  dispatchEvents?: boolean;

  /** 콜백 */
  onStart?: () => void;
  onMove?: (point: Point, progress: number) => void;
  onEnd?: () => void;
}

/**
 * Hover 시뮬레이션 옵션
 */
export interface HoverSimulatorOptions {
  /** 호버할 대상 셀렉터 */
  target: string;

  /** 대상 내 위치 */
  targetPosition?: PositionType;

  /** 진입 애니메이션 시간 (ms) */
  enterDuration?: number;

  /** 호버 지속 시간 (ms) */
  hoverDuration?: number;

  /** 탈출 애니메이션 시간 (ms) */
  exitDuration?: number;

  /** 시작 위치 (선택적, 없으면 target 밖에서 시작) */
  from?: string | Point;

  /** 시작 위치 타입 */
  fromPosition?: PositionType;

  /** 프레임 레이트 */
  fps?: number;

  /** 이벤트 디스패치 여부 */
  dispatchEvents?: boolean;

  /** 콜백 */
  onStart?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onEnd?: () => void;
}

/**
 * 마우스 시뮬레이터 클래스
 */
export class MouseSimulator {
  private options: Required<MouseSimulatorOptions>;
  private path: Point[] = [];
  private animationFrameId: number | null = null;
  private startElement: HTMLElement | null = null;
  private endElement: HTMLElement | null = null;

  constructor(options: MouseSimulatorOptions) {
    this.options = {
      fromPosition: 'center',
      toPosition: 'center',
      duration: 1000,
      curvature: 0.3,
      fps: 60,
      visualize: false,
      dispatchEvents: true,
      onStart: () => {},
      onMove: () => {},
      onEnd: () => {},
      ...options,
    };
  }

  /**
   * 셀렉터 또는 좌표를 실제 좌표로 변환하고 타겟 요소 저장
   */
  private resolvePoint(target: string | Point, position: string, isStart: boolean): Point {
    // 이미 좌표인 경우
    if (typeof target === 'object' && 'x' in target && 'y' in target) {
      return target;
    }

    // 셀렉터인 경우
    const element = document.querySelector(target as string) as HTMLElement;
    if (!element) {
      throw new Error(`Element not found: ${target}`);
    }

    // line-matching-point가 있는지 확인 (line-matching 인터랙션용)
    const matchingPoint = element.querySelector('.line-matching-point') as HTMLElement;
    if (matchingPoint) {
      const pointRect = matchingPoint.getBoundingClientRect();
      debug(`[MouseSimulator] Found line-matching-point in ${target}`);

      // 요소 레퍼런스 저장
      if (isStart) {
        this.startElement = matchingPoint;
      } else {
        this.endElement = matchingPoint;
      }

      return {
        x: pointRect.left + pointRect.width / 2,
        y: pointRect.top + pointRect.height / 2,
      };
    }

    // 일반 요소인 경우에도 레퍼런스 저장
    if (isStart) {
      this.startElement = element;
    } else {
      this.endElement = element;
    }

    const rect = element.getBoundingClientRect();

    // 위치에 따라 좌표 계산
    switch (position) {
      case 'center':
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      case 'top':
        return {
          x: rect.left + rect.width / 2,
          y: rect.top,
        };
      case 'bottom':
        return {
          x: rect.left + rect.width / 2,
          y: rect.bottom,
        };
      case 'left':
        return {
          x: rect.left,
          y: rect.top + rect.height / 2,
        };
      case 'right':
        return {
          x: rect.right,
          y: rect.top + rect.height / 2,
        };
      case 'top-left':
        return {
          x: rect.left,
          y: rect.top,
        };
      case 'top-right':
        return {
          x: rect.right,
          y: rect.top,
        };
      case 'bottom-left':
        return {
          x: rect.left,
          y: rect.bottom,
        };
      case 'bottom-right':
        return {
          x: rect.right,
          y: rect.bottom,
        };
      default:
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
    }
  }

  /**
   * 베지어 곡선 경로 생성
   */
  private generateBezierPath(start: Point, end: Point): Point[] {
    const { duration, fps, curvature } = this.options;
    const frames = Math.ceil((duration / 1000) * fps);
    const path: Point[] = [];

    // 제어점 계산 (곡선의 중간 지점)
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    // 수직 방향으로 곡률 적용
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 곡선 제어점 (중간점에서 수직으로 offset)
    const controlX = midX - dy * curvature * 0.3;
    const controlY = midY + dx * curvature * 0.3;

    // 쿼드라틱 베지어 곡선 생성
    for (let i = 0; i <= frames; i++) {
      const t = i / frames;
      const invT = 1 - t;

      // Quadratic Bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
      const x = invT * invT * start.x + 2 * invT * t * controlX + t * t * end.x;
      const y = invT * invT * start.y + 2 * invT * t * controlY + t * t * end.y;

      path.push({ x, y });
    }

    return path;
  }

  /**
   * 마우스 이벤트 디스패치
   */
  private dispatchMouseEvent(
    type: 'mousedown' | 'mousemove' | 'mouseup' | 'click',
    point: Point,
    targetElement?: HTMLElement | null
  ): void {
    // 타겟 요소가 지정되면 그것을 사용, 아니면 좌표로 요소 찾기
    let element = targetElement;
    if (!element) {
      element = document.elementFromPoint(point.x, point.y) as HTMLElement;
    }

    if (!element) return;

    const event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: point.x,
      clientY: point.y,
      screenX: point.x,
      screenY: point.y,
      button: 0,
      buttons: type === 'mousemove' ? 1 : 0, // 드래그 중일 때 버튼 누름 상태
    });

    element.dispatchEvent(event);
    debug(
      `[MouseSimulator] ${type} at (${Math.round(point.x)}, ${Math.round(point.y)}) on ${element.className || element.tagName}`
    );
  }

  /**
   * 시뮬레이션 실행
   */
  async simulate(): Promise<void> {
    debug('[MouseSimulator] Simulation started');

    // 시작점과 끝점 계산 (요소 레퍼런스도 저장)
    const start = this.resolvePoint(this.options.from, this.options.fromPosition, true);
    const end = this.resolvePoint(this.options.to, this.options.toPosition, false);

    debug(
      `[MouseSimulator] Path: (${Math.round(start.x)}, ${Math.round(start.y)}) → (${Math.round(end.x)}, ${Math.round(end.y)})`
    );

    // 경로 생성
    this.path = this.generateBezierPath(start, end);

    // 시작 콜백
    this.options.onStart();

    // mousedown 이벤트 - 시작 요소에 디스패치
    if (this.options.dispatchEvents) {
      this.dispatchMouseEvent('mousedown', start, this.startElement);
    }

    // 경로를 따라 이동
    return new Promise<void>(resolve => {
      let frameIndex = 0;
      const frameDelay = 1000 / this.options.fps;

      const animate = () => {
        if (frameIndex >= this.path.length) {
          // 종료
          if (this.options.dispatchEvents) {
            // mouseup과 click은 끝 요소에 디스패치
            this.dispatchMouseEvent('mouseup', end, this.endElement);

            // click 이벤트는 동기적으로 디스패치
            // (setTimeout을 사용하면 다음 테스트의 reset과 race condition 발생)
            if (this.endElement) {
              this.dispatchMouseEvent('click', end, this.endElement);
            }
          }

          this.options.onEnd();
          debug('[MouseSimulator] Simulation completed');
          resolve();
          return;
        }

        const point = this.path[frameIndex];
        const progress = frameIndex / (this.path.length - 1);

        // mousemove 이벤트 - 좌표에 있는 요소에 디스패치
        if (this.options.dispatchEvents && frameIndex > 0) {
          this.dispatchMouseEvent('mousemove', point);
        }

        // 콜백
        this.options.onMove(point, progress);

        frameIndex++;
        setTimeout(animate, frameDelay);
      };

      animate();
    });
  }

  /**
   * 생성된 경로 가져오기
   */
  getPath(): Point[] {
    return this.path;
  }

  /**
   * 시뮬레이션 중단
   */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      debug('[MouseSimulator] Simulation stopped');
    }
  }
}

/**
 * 간단한 드래그 시뮬레이션 헬퍼
 */
export async function simulateDrag(
  from: string | Point,
  to: string | Point,
  options: Partial<MouseSimulatorOptions> = {}
): Promise<void> {
  const simulator = new MouseSimulator({
    from,
    to,
    ...options,
  });

  return simulator.simulate();
}

/**
 * 클릭 시뮬레이션 헬퍼
 */
export function simulateClick(target: string | Point, position: 'center' = 'center'): void {
  const simulator = new MouseSimulator({
    from: target,
    to: target,
    duration: 100,
    dispatchEvents: true,
    fromPosition: position,
    toPosition: position,
  });

  simulator.simulate();
}

/**
 * Hover 시뮬레이션 헬퍼
 */
export async function simulateHover(options: HoverSimulatorOptions): Promise<void> {
  const {
    target,
    targetPosition = 'center',
    enterDuration = 300,
    hoverDuration = 500,
    exitDuration = 300,
    from,
    fromPosition = 'center',
    fps = 60,
    dispatchEvents = true,
    onStart,
    onHoverStart,
    onHoverEnd,
    onEnd,
  } = options;

  debug('[simulateHover] Starting hover simulation');

  // 타겟 요소 찾기
  const targetElement = document.querySelector(target) as HTMLElement;
  if (!targetElement) {
    throw new Error(`Target element not found: ${target}`);
  }

  // 타겟 좌표 계산
  const targetRect = targetElement.getBoundingClientRect();
  const targetPoint = getPointFromPosition(targetRect, targetPosition);

  // 시작 좌표 계산
  let startPoint: Point;
  if (from) {
    if (typeof from === 'string') {
      const fromElement = document.querySelector(from) as HTMLElement;
      if (!fromElement) {
        throw new Error(`From element not found: ${from}`);
      }
      const fromRect = fromElement.getBoundingClientRect();
      startPoint = getPointFromPosition(fromRect, fromPosition);
    } else {
      startPoint = from;
    }
  } else {
    // from이 없으면 타겟 왼쪽 밖에서 시작
    startPoint = {
      x: targetRect.left - 100,
      y: targetPoint.y,
    };
  }

  // 탈출 좌표 계산 (타겟 오른쪽 밖으로)
  const exitPoint: Point = {
    x: targetRect.right + 100,
    y: targetPoint.y,
  };

  onStart?.();

  // Phase 1: 진입 (from → target)
  debug('[simulateHover] Phase 1: Enter');
  await new Promise<void>(resolve => {
    const enterPath = generateStraightPath(startPoint, targetPoint, Math.floor((enterDuration / 1000) * fps));
    let frameIndex = 0;
    const frameDelay = 1000 / fps;

    const enterAnimate = () => {
      if (frameIndex >= enterPath.length) {
        // mouseenter 이벤트
        if (dispatchEvents) {
          dispatchMouseEventTo('mouseenter', targetPoint, targetElement);
          dispatchMouseEventTo('mouseover', targetPoint, targetElement);
        }
        onHoverStart?.();
        resolve();
        return;
      }

      const point = enterPath[frameIndex];
      if (dispatchEvents && frameIndex > 0) {
        dispatchMouseEventTo('mousemove', point);
      }

      frameIndex++;
      setTimeout(enterAnimate, frameDelay);
    };

    enterAnimate();
  });

  // Phase 2: 호버 지속
  debug('[simulateHover] Phase 2: Hover');
  await new Promise(resolve => setTimeout(resolve, hoverDuration));

  // Phase 3: 탈출 (target → exit)
  debug('[simulateHover] Phase 3: Exit');
  await new Promise<void>(resolve => {
    if (dispatchEvents) {
      dispatchMouseEventTo('mouseleave', targetPoint, targetElement);
      dispatchMouseEventTo('mouseout', targetPoint, targetElement);
    }
    onHoverEnd?.();

    const exitPath = generateStraightPath(targetPoint, exitPoint, Math.floor((exitDuration / 1000) * fps));
    let frameIndex = 0;
    const frameDelay = 1000 / fps;

    const exitAnimate = () => {
      if (frameIndex >= exitPath.length) {
        resolve();
        return;
      }

      const point = exitPath[frameIndex];
      if (dispatchEvents && frameIndex > 0) {
        dispatchMouseEventTo('mousemove', point);
      }

      frameIndex++;
      setTimeout(exitAnimate, frameDelay);
    };

    exitAnimate();
  });

  onEnd?.();
  debug('[simulateHover] Hover simulation completed');
}

/**
 * DOMRect와 위치 타입으로부터 좌표 계산
 */
function getPointFromPosition(rect: DOMRect, position: PositionType): Point {
  switch (position) {
    case 'center':
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    case 'top':
      return { x: rect.left + rect.width / 2, y: rect.top };
    case 'bottom':
      return { x: rect.left + rect.width / 2, y: rect.bottom };
    case 'left':
      return { x: rect.left, y: rect.top + rect.height / 2 };
    case 'right':
      return { x: rect.right, y: rect.top + rect.height / 2 };
    case 'top-left':
      return { x: rect.left, y: rect.top };
    case 'top-right':
      return { x: rect.right, y: rect.top };
    case 'bottom-left':
      return { x: rect.left, y: rect.bottom };
    case 'bottom-right':
      return { x: rect.right, y: rect.bottom };
    default:
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
}

/**
 * 직선 경로 생성
 */
function generateStraightPath(start: Point, end: Point, frames: number): Point[] {
  const path: Point[] = [];
  for (let i = 0; i <= frames; i++) {
    const t = i / frames;
    path.push({
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    });
  }
  return path;
}

/**
 * 마우스 이벤트 디스패치 (특정 요소에)
 */
function dispatchMouseEventTo(
  type: 'mouseenter' | 'mouseleave' | 'mouseover' | 'mouseout' | 'mousemove',
  point: Point,
  targetElement?: HTMLElement
): void {
  const element = targetElement || (document.elementFromPoint(point.x, point.y) as HTMLElement);
  if (!element) return;

  const event = new MouseEvent(type, {
    bubbles: type === 'mouseover' || type === 'mouseout' || type === 'mousemove',
    cancelable: true,
    view: window,
    clientX: point.x,
    clientY: point.y,
    screenX: point.x,
    screenY: point.y,
    button: 0,
    buttons: 0,
  });

  element.dispatchEvent(event);
  debug(
    `[simulateHover] ${type} at (${Math.round(point.x)}, ${Math.round(point.y)}) on ${element.className || element.tagName}`
  );
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).MouseSimulator = MouseSimulator;
  (window as any).simulateDrag = simulateDrag;
  (window as any).simulateClick = simulateClick;
  (window as any).simulateHover = simulateHover;
}
