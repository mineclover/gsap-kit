/**
 * GSAP Kit - 유틸리티 헬퍼 함수
 */

/**
 * CSS 선택자 또는 DOM 요소를 검증하고 반환합니다
 * @param {string|HTMLElement|NodeList} target - CSS 선택자 또는 DOM 요소
 * @returns {HTMLElement|NodeList|null}
 */
function getElement(target) {
  if (!target) {
    console.error('[GSAP Kit] target이 필요합니다');
    return null;
  }

  if (typeof target === 'string') {
    const elements = document.querySelectorAll(target);
    return elements.length === 1 ? elements[0] : elements;
  }

  return target;
}

/**
 * 기본 옵션과 사용자 옵션을 병합합니다
 * @param {Object} defaults - 기본 옵션
 * @param {Object} options - 사용자 옵션
 * @returns {Object} 병합된 옵션
 */
function mergeOptions(defaults, options = {}) {
  return { ...defaults, ...options };
}

/**
 * 배열 또는 NodeList를 순회하며 각 요소에 콜백 실행
 * @param {Array|NodeList} elements - 요소 배열
 * @param {Function} callback - 콜백 함수
 * @param {number} stagger - 각 요소간 지연 시간 (초)
 */
function forEachElement(elements, callback, stagger = 0) {
  if (!elements) return;

  const items = elements.length ? Array.from(elements) : [elements];

  items.forEach((element, index) => {
    const delay = stagger * index;
    callback(element, index, delay);
  });
}

/**
 * 뷰포트에 요소가 보이는지 확인
 * @param {HTMLElement} element - 확인할 요소
 * @returns {boolean}
 */
function isInViewport(element) {
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
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (ms)
 * @returns {Function}
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
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
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간 (ms)
 * @returns {Function}
 */
function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
