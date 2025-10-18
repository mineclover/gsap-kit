/**
 * GSAP Kit - Slide 애니메이션
 */

/**
 * 요소를 왼쪽에서 슬라이드 인
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.duration=1] - 지속 시간 (초)
 * @param {number} [options.delay=0] - 지연 시간 (초)
 * @param {string} [options.ease="power3.out"] - easing 함수
 * @param {number} [options.x=-100] - 시작 X 위치
 * @param {number} [options.stagger=0] - 여러 요소 순차 지연 (초)
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function slideInLeft(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power3.out",
    x: -100,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    x: config.x,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}

/**
 * 요소를 오른쪽에서 슬라이드 인
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.duration=1] - 지속 시간 (초)
 * @param {number} [options.delay=0] - 지연 시간 (초)
 * @param {string} [options.ease="power3.out"] - easing 함수
 * @param {number} [options.x=100] - 시작 X 위치
 * @param {number} [options.stagger=0] - 여러 요소 순차 지연 (초)
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function slideInRight(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power3.out",
    x: 100,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    x: config.x,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}

/**
 * 요소를 위에서 슬라이드 인
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.duration=1] - 지속 시간 (초)
 * @param {number} [options.delay=0] - 지연 시간 (초)
 * @param {string} [options.ease="power3.out"] - easing 함수
 * @param {number} [options.y=-100] - 시작 Y 위치
 * @param {number} [options.stagger=0] - 여러 요소 순차 지연 (초)
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function slideInUp(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power3.out",
    y: -100,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    y: config.y,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}

/**
 * 요소를 아래에서 슬라이드 인
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.duration=1] - 지속 시간 (초)
 * @param {number} [options.delay=0] - 지연 시간 (초)
 * @param {string} [options.ease="power3.out"] - easing 함수
 * @param {number} [options.y=100] - 시작 Y 위치
 * @param {number} [options.stagger=0] - 여러 요소 순차 지연 (초)
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function slideInDown(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power3.out",
    y: 100,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    y: config.y,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}

/**
 * 요소를 왼쪽으로 슬라이드 아웃
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.duration=1] - 지속 시간 (초)
 * @param {number} [options.delay=0] - 지연 시간 (초)
 * @param {string} [options.ease="power3.in"] - easing 함수
 * @param {number} [options.x=-100] - 종료 X 위치
 * @param {number} [options.stagger=0] - 여러 요소 순차 지연 (초)
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function slideOutLeft(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power3.in",
    x: -100,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.to(target, {
    x: config.x,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}

/**
 * 요소를 오른쪽으로 슬라이드 아웃
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.duration=1] - 지속 시간 (초)
 * @param {number} [options.delay=0] - 지연 시간 (초)
 * @param {string} [options.ease="power3.in"] - easing 함수
 * @param {number} [options.x=100] - 종료 X 위치
 * @param {number} [options.stagger=0] - 여러 요소 순차 지연 (초)
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function slideOutRight(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power3.in",
    x: 100,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.to(target, {
    x: config.x,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}
