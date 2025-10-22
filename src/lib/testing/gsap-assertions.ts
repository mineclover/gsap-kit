/**
 * GSAP Kit - GSAP Assertions
 * GSAP 애니메이션 상태 검증 유틸리티
 */

// GSAP을 CDN에서 로드하므로 window.gsap 사용
declare const gsap: any;

/**
 * GSAP Assertion 타입
 */
export type GSAPAssertionType =
  | 'gsap-is-animating' // 애니메이션 진행 중
  | 'gsap-is-paused' // 일시정지 상태
  | 'gsap-progress' // 진행도
  | 'gsap-duration' // 지속 시간
  | 'gsap-property-value' // CSS 속성 값
  | 'gsap-transform' // transform 속성
  | 'gsap-timeline-state'; // 타임라인 상태

/**
 * Transform 속성 타입
 */
export type TransformProperty = 'x' | 'y' | 'rotation' | 'scale' | 'scaleX' | 'scaleY';

/**
 * GSAP Assertion 옵션
 */
export interface GSAPAssertionOptions {
  type: GSAPAssertionType;
  selector: string;

  // Property value용
  property?: string;
  expected?: any;
  tolerance?: number;

  // Progress용
  minProgress?: number;
  maxProgress?: number;

  // Transform용
  transformProperty?: TransformProperty;

  // 타이밍
  waitForAnimation?: boolean;
  timeout?: number;
}

/**
 * 숫자 값 비교 (허용 오차 포함)
 */
function compareWithTolerance(actual: number, expected: number, tolerance = 0): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

/**
 * 요소가 애니메이션 중인지 확인
 */
export function isAnimating(selector: string): boolean {
  const element = document.querySelector(selector);
  if (!element) return false;

  const tweens = gsap.getTweensOf(element);
  return tweens.some(tween => tween.isActive());
}

/**
 * 요소의 애니메이션이 일시정지 상태인지 확인
 */
export function isPaused(selector: string): boolean {
  const element = document.querySelector(selector);
  if (!element) return false;

  const tweens = gsap.getTweensOf(element);
  return tweens.some(tween => tween.paused());
}

/**
 * 애니메이션 진행도 가져오기
 */
export function getProgress(selector: string): number | null {
  const element = document.querySelector(selector);
  if (!element) return null;

  const tweens = gsap.getTweensOf(element);
  if (tweens.length === 0) return null;

  // 가장 최근 tween의 진행도 반환
  return tweens[tweens.length - 1].progress();
}

/**
 * 애니메이션 진행도 검증
 */
export function checkProgress(selector: string, min?: number, max?: number): boolean {
  const progress = getProgress(selector);
  if (progress === null) return false;

  if (min !== undefined && progress < min) return false;
  if (max !== undefined && progress > max) return false;

  return true;
}

/**
 * 애니메이션 지속 시간 가져오기
 */
export function getDuration(selector: string): number | null {
  const element = document.querySelector(selector);
  if (!element) return null;

  const tweens = gsap.getTweensOf(element);
  if (tweens.length === 0) return null;

  return tweens[tweens.length - 1].duration();
}

/**
 * 애니메이션 지속 시간 검증
 */
export function checkDuration(selector: string, expected: number, tolerance = 0): boolean {
  const duration = getDuration(selector);
  if (duration === null) return false;

  return compareWithTolerance(duration, expected, tolerance);
}

/**
 * CSS 속성 값 가져오기
 */
export function getPropertyValue(selector: string, property: string): any {
  const element = document.querySelector(selector);
  if (!element) return null;

  return gsap.getProperty(element, property);
}

/**
 * CSS 속성 값 검증
 */
export function checkPropertyValue(selector: string, property: string, expected: any, tolerance?: number): boolean {
  const actual = getPropertyValue(selector, property);
  if (actual === null) return false;

  // 숫자 값이면 tolerance 적용
  if (typeof actual === 'number' && typeof expected === 'number') {
    return compareWithTolerance(actual, expected, tolerance || 0);
  }

  // 문자열이나 다른 타입은 정확히 비교
  return actual === expected;
}

/**
 * Transform 속성 값 가져오기
 */
export function getTransformValue(selector: string, transformProperty: TransformProperty): number | null {
  const element = document.querySelector(selector);
  if (!element) return null;

  const value = gsap.getProperty(element, transformProperty);
  return typeof value === 'number' ? value : null;
}

/**
 * Transform 속성 값 검증
 */
export function checkTransformValue(
  selector: string,
  transformProperty: TransformProperty,
  expected: number,
  tolerance = 0
): boolean {
  const actual = getTransformValue(selector, transformProperty);
  if (actual === null) return false;

  return compareWithTolerance(actual, expected, tolerance);
}

/**
 * 애니메이션 완료 대기
 */
export async function waitForAnimation(selector: string, timeout = 5000): Promise<boolean> {
  const element = document.querySelector(selector);
  if (!element) return false;

  const startTime = Date.now();

  return new Promise(resolve => {
    const checkInterval = setInterval(() => {
      const tweens = gsap.getTweensOf(element);
      const isActive = tweens.some(tween => tween.isActive());

      // 타임아웃 체크
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(false);
        return;
      }

      // 모든 애니메이션이 완료되면
      if (!isActive && tweens.length > 0) {
        clearInterval(checkInterval);
        resolve(true);
        return;
      }
    }, 16); // ~60fps
  });
}

/**
 * GSAP Assertion 실행
 */
export async function validateGSAPAssertion(options: GSAPAssertionOptions): Promise<boolean> {
  const { type, selector, waitForAnimation: shouldWait, timeout } = options;

  // 애니메이션 완료 대기가 필요하면
  if (shouldWait) {
    const completed = await waitForAnimation(selector, timeout);
    if (!completed) {
      console.warn(`[GSAP Assertion] Animation wait timeout for ${selector}`);
    }
  }

  switch (type) {
    case 'gsap-is-animating':
      return isAnimating(selector);

    case 'gsap-is-paused':
      return isPaused(selector);

    case 'gsap-progress':
      return checkProgress(selector, options.minProgress, options.maxProgress);

    case 'gsap-duration':
      if (options.expected === undefined) return false;
      return checkDuration(selector, options.expected, options.tolerance);

    case 'gsap-property-value':
      if (!options.property || options.expected === undefined) return false;
      return checkPropertyValue(selector, options.property, options.expected, options.tolerance);

    case 'gsap-transform':
      if (!options.transformProperty || options.expected === undefined) return false;
      return checkTransformValue(selector, options.transformProperty, options.expected, options.tolerance);

    case 'gsap-timeline-state':
      // TODO: Timeline state checking
      console.warn('[GSAP Assertion] Timeline state checking not yet implemented');
      return true;

    default:
      console.warn(`[GSAP Assertion] Unknown type: ${type}`);
      return false;
  }
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).gsapAssertions = {
    isAnimating,
    isPaused,
    getProgress,
    checkProgress,
    getDuration,
    checkDuration,
    getPropertyValue,
    checkPropertyValue,
    getTransformValue,
    checkTransformValue,
    waitForAnimation,
    validateGSAPAssertion,
  };
}
