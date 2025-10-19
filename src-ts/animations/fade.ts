/**
 * GSAP Kit - Fade 애니메이션 (TypeScript)
 */

/// <reference types="gsap" />

/**
 * 페이드 애니메이션 옵션
 */
interface FadeOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  y?: number;
  x?: number;
  scale?: number;
  stagger?: number;
}

/**
 * 요소를 페이드 인 시킵니다
 */
function fadeIn(
  target: gsap.TweenTarget,
  options: FadeOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const defaults: FadeOptions = {
    duration: 1,
    delay: 0,
    ease: 'power2.out',
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
 */
function fadeOut(
  target: gsap.TweenTarget,
  options: FadeOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const defaults: FadeOptions = {
    duration: 1,
    delay: 0,
    ease: 'power2.in',
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
 */
function fadeInDown(
  target: gsap.TweenTarget,
  options: FadeOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  return fadeIn(target, { ...options, y: -30 });
}

/**
 * 요소를 페이드 인 (아래에서 위로)
 */
function fadeInUp(
  target: gsap.TweenTarget,
  options: FadeOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  return fadeIn(target, { ...options, y: 30 });
}

/**
 * 요소를 페이드 인 (왼쪽에서 오른쪽으로)
 */
function fadeInLeft(
  target: gsap.TweenTarget,
  options: FadeOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const defaults: FadeOptions = {
    duration: 1,
    delay: 0,
    ease: 'power2.out',
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
 */
function fadeInRight(
  target: gsap.TweenTarget,
  options: FadeOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const defaults: FadeOptions = {
    duration: 1,
    delay: 0,
    ease: 'power2.out',
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
 */
function fadeInScale(
  target: gsap.TweenTarget,
  options: FadeOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const defaults: FadeOptions = {
    duration: 1,
    delay: 0,
    ease: 'back.out(1.2)',
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
