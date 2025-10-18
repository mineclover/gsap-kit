/**
 * GSAP Kit - Fade 애니메이션
 */

/**
 * 요소를 페이드 인 시킵니다
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.duration=1] - 지속 시간 (초)
 * @param {number} [options.delay=0] - 지연 시간 (초)
 * @param {string} [options.ease="power2.out"] - easing 함수
 * @param {number} [options.y=30] - 시작 Y 위치
 * @param {number} [options.stagger=0] - 여러 요소 순차 지연 (초)
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function fadeIn(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power2.out",
    y: 30,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    opacity: 0,
    y: config.y,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}

/**
 * 요소를 페이드 아웃 시킵니다
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.duration=1] - 지속 시간 (초)
 * @param {number} [options.delay=0] - 지연 시간 (초)
 * @param {string} [options.ease="power2.in"] - easing 함수
 * @param {number} [options.y=-30] - 종료 Y 위치
 * @param {number} [options.stagger=0] - 여러 요소 순차 지연 (초)
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function fadeOut(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power2.in",
    y: -30,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.to(target, {
    opacity: 0,
    y: config.y,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}

/**
 * 요소를 페이드 인 (위에서 아래로)
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function fadeInDown(target, options = {}) {
  return fadeIn(target, { ...options, y: -30 });
}

/**
 * 요소를 페이드 인 (아래에서 위로)
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function fadeInUp(target, options = {}) {
  return fadeIn(target, { ...options, y: 30 });
}

/**
 * 요소를 페이드 인 (왼쪽에서 오른쪽으로)
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.x=-50] - 시작 X 위치
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function fadeInLeft(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power2.out",
    x: -50,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    opacity: 0,
    x: config.x,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}

/**
 * 요소를 페이드 인 (오른쪽에서 왼쪽으로)
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.x=50] - 시작 X 위치
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function fadeInRight(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power2.out",
    x: 50,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    opacity: 0,
    x: config.x,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}

/**
 * 요소를 확대하면서 페이드 인
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.scale=0.8] - 시작 스케일
 * @returns {gsap.core.Tween|gsap.core.Timeline}
 */
function fadeInScale(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "back.out(1.2)",
    scale: 0.8,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    opacity: 0,
    scale: config.scale,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}
