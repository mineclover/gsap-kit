/**
 * GSAP Kit - Slide 애니메이션 (TypeScript)
 */

/// <reference types="gsap" />

/**
 * 슬라이드 애니메이션 옵션
 */
interface SlideOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  x?: number;
  y?: number;
  stagger?: number;
}

/**
 * 요소를 왼쪽에서 슬라이드 인
 */
function slideInLeft(
  target: gsap.TweenTarget,
  options: SlideOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const defaults: SlideOptions = {
    duration: 1,
    delay: 0,
    ease: 'power3.out',
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
 */
function slideInRight(
  target: gsap.TweenTarget,
  options: SlideOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const defaults: SlideOptions = {
    duration: 1,
    delay: 0,
    ease: 'power3.out',
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
 */
function slideInUp(
  target: gsap.TweenTarget,
  options: SlideOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const defaults: SlideOptions = {
    duration: 1,
    delay: 0,
    ease: 'power3.out',
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
 */
function slideInDown(
  target: gsap.TweenTarget,
  options: SlideOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const defaults: SlideOptions = {
    duration: 1,
    delay: 0,
    ease: 'power3.out',
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
 */
function slideOutLeft(
  target: gsap.TweenTarget,
  options: SlideOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const defaults: SlideOptions = {
    duration: 1,
    delay: 0,
    ease: 'power3.in',
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
 */
function slideOutRight(
  target: gsap.TweenTarget,
  options: SlideOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const defaults: SlideOptions = {
    duration: 1,
    delay: 0,
    ease: 'power3.in',
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
