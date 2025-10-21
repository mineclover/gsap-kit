/**
 * GSAP Kit - 유틸리티 헬퍼 함수 (TypeScript)
 */

/**
 * CSS 선택자 또는 DOM 요소를 검증하고 반환합니다
 * @deprecated 이 함수는 더 이상 사용되지 않습니다. types.ts의 toElementArray() 또는 validateTarget()을 사용하세요.
 */
function _getElement(target: string | HTMLElement | NodeList): HTMLElement | NodeList | null {
  if (!target) {
    console.error('[GSAP Kit] target이 필요합니다');
    return null;
  }

  if (typeof target === 'string') {
    const elements = document.querySelectorAll(target);
    return elements.length === 1 ? (elements[0] as HTMLElement) : elements;
  }

  return target;
}

/**
 * 기본 옵션과 사용자 옵션을 병합합니다
 */
function _mergeOptions<T extends object>(defaults: T, options: Partial<T> = {}): T {
  return { ...defaults, ...options };
}

/**
 * 배열 또는 NodeList를 순회하며 각 요소에 콜백 실행
 */
export function forEachElement(
  elements: HTMLElement[] | NodeList | HTMLElement,
  callback: (element: HTMLElement, index: number, delay: number) => void,
  stagger = 0
): void {
  if (!elements) return;

  const items = 'length' in elements ? (Array.from(elements) as HTMLElement[]) : [elements];

  items.forEach((element, index) => {
    const delay = stagger * index;
    callback(element, index, delay);
  });
}

/**
 * 뷰포트에 요소가 보이는지 확인
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 디바운스 함수
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait = 300): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 스로틀 함수
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit = 300): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
