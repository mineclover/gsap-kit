/**
 * GSAP Kit - 공통 타입 정의
 */

/// <reference types="gsap" />

// ==================== 타겟 타입 ====================

/**
 * DOM 요소 타겟 타입 (Draggable 함수에서 사용)
 * 선택자 기반 인터페이스를 위한 타입
 */
export type DOMTarget = string | HTMLElement | NodeListOf<HTMLElement> | HTMLElement[];

/**
 * 애니메이션 타겟 타입 (Animation 함수에서 사용)
 * GSAP의 TweenTarget 타입 별칭
 */
export type AnimationTarget = gsap.TweenTarget;

// ==================== 옵션 인터페이스 ====================

/**
 * 기본 드래그 옵션 인터페이스
 */
export interface BaseDraggableOptions {
  bounds?: Window | string | HTMLElement | DOMRect | { top?: number; left?: number; width?: number; height?: number };
  onDragStart?: (this: Draggable) => void;
  onDrag?: (this: Draggable) => void;
  onDragEnd?: (this: Draggable) => void;
}

/**
 * 기본 애니메이션 옵션 인터페이스
 * 모든 애니메이션 함수에서 공통으로 사용하는 속성들
 */
export interface BaseAnimationOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
}

/**
 * 타겟 검증 유틸리티
 */
export function validateTarget(target: any, functionName: string): boolean {
  if (!target) {
    console.error(`[GSAP Kit] ${functionName}: target이 필요합니다`);
    return false;
  }
  return true;
}

/**
 * 디버그 모드 (개발 환경에서만 로그 출력)
 * 브라우저 환경에서는 항상 false (프로덕션 빌드 시 로그 제거)
 */
const IS_DEV = true; // 개발 시 필요하면 true로 변경

export function debug(...args: any[]): void {
  if (IS_DEV) {
    console.log('[GSAP Kit]', ...args);
  }
}

/**
 * 요소를 배열로 변환하는 유틸리티
 */
export function toElementArray(target: DOMTarget): HTMLElement[] {
  if (typeof target === 'string') {
    return Array.from(document.querySelectorAll(target)) as HTMLElement[];
  }

  if (target instanceof NodeList) {
    return Array.from(target) as HTMLElement[];
  }

  if (Array.isArray(target)) {
    return target;
  }

  return [target];
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).validateTarget = validateTarget;
  (window as any).debug = debug;
  (window as any).toElementArray = toElementArray;
}
