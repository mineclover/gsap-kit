/**
 * GSAP Kit - Rotate 애니메이션
 */

/**
 * 요소를 회전시킵니다
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.duration=1] - 지속 시간 (초)
 * @param {number} [options.delay=0] - 지연 시간 (초)
 * @param {string} [options.ease="power2.out"] - easing 함수
 * @param {number} [options.rotation=360] - 회전 각도
 * @param {number} [options.stagger=0] - 여러 요소 순차 지연 (초)
 * @returns {gsap.core.Tween}
 */
function rotate(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power2.out",
    rotation: 360,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.to(target, {
    rotation: config.rotation,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}

/**
 * 요소를 회전하면서 페이드 인
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.rotation=-180] - 시작 회전 각도
 * @returns {gsap.core.Tween}
 */
function rotateIn(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "back.out(1.5)",
    rotation: -180,
    scale: 0.5,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    opacity: 0,
    rotation: config.rotation,
    scale: config.scale,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}

/**
 * 요소를 회전하면서 페이드 아웃
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.rotation=180] - 종료 회전 각도
 * @returns {gsap.core.Tween}
 */
function rotateOut(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "back.in(1.5)",
    rotation: 180,
    scale: 0.5,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.to(target, {
    opacity: 0,
    rotation: config.rotation,
    scale: config.scale,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger
  });
}

/**
 * 요소를 3D Y축 기준으로 회전 (플립)
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.rotationY=360] - Y축 회전 각도
 * @returns {gsap.core.Tween}
 */
function flipY(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power2.inOut",
    rotationY: 360,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.to(target, {
    rotationY: config.rotationY,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger,
    transformPerspective: 1000
  });
}

/**
 * 요소를 3D X축 기준으로 회전 (플립)
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.rotationX=360] - X축 회전 각도
 * @returns {gsap.core.Tween}
 */
function flipX(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power2.inOut",
    rotationX: 360,
    stagger: 0
  };

  const config = { ...defaults, ...options };

  return gsap.to(target, {
    rotationX: config.rotationX,
    duration: config.duration,
    delay: config.delay,
    ease: config.ease,
    stagger: config.stagger,
    transformPerspective: 1000
  });
}

/**
 * 요소를 무한 회전
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.duration=2] - 1회전 지속 시간 (초)
 * @param {string} [options.ease="none"] - easing 함수 (보통 linear)
 * @param {boolean} [options.clockwise=true] - 시계방향 여부
 * @returns {gsap.core.Tween}
 */
function spinInfinite(target, options = {}) {
  const defaults = {
    duration: 2,
    ease: "none",
    clockwise: true
  };

  const config = { ...defaults, ...options };
  const rotation = config.clockwise ? 360 : -360;

  return gsap.to(target, {
    rotation: rotation,
    duration: config.duration,
    ease: config.ease,
    repeat: -1
  });
}
