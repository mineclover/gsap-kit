/**
 * GSAP Kit - Slide 애니메이션 (TypeScript)
 */

/// <reference types="gsap" />

import { AnimationTarget, BaseAnimationOptions } from '../types';

/**
 * 슬라이드 애니메이션 옵션
 */
export interface SlideOptions extends BaseAnimationOptions {
  x?: number;
  y?: number;
}

/**
 * 요소를 왼쪽에서 슬라이드 인
 */
function slideInLeft(
  target: AnimationTarget,
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
  target: AnimationTarget,
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
  target: AnimationTarget,
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
  target: AnimationTarget,
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
  target: AnimationTarget,
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
  target: AnimationTarget,
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

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).slideInLeft = slideInLeft;
  (window as any).slideInRight = slideInRight;
  (window as any).slideInUp = slideInUp;
  (window as any).slideInDown = slideInDown;
  (window as any).slideOutLeft = slideOutLeft;
  (window as any).slideOutRight = slideOutRight;
}
