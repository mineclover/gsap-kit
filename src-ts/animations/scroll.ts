/**
 * GSAP Kit - Scroll 애니메이션 (TypeScript)
 * ScrollTrigger CDN: https://cdn.jsdelivr.net/npm/gsap@3.13/dist/ScrollTrigger.min.js
 */

/// <reference types="gsap" />

import { AnimationTarget, BaseAnimationOptions } from '../types';

/**
 * ScrollTrigger 등록
 */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * 스크롤 애니메이션 옵션
 */
export interface ScrollOptions extends BaseAnimationOptions {
  y?: number;
  x?: number;
  trigger?: gsap.DOMTarget;
  start?: string;
  end?: string;
  toggleActions?: string;
  scrub?: boolean | number;
  markers?: boolean;
}

/**
 * 스크롤 진행도 옵션
 */
export interface ScrollProgressOptions {
  to?: gsap.TweenVars;
  trigger?: gsap.DOMTarget;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
}

/**
 * 패럴랙스 옵션
 */
export interface ParallaxOptions {
  speed?: number;
  trigger?: gsap.DOMTarget;
  start?: string;
  end?: string;
  markers?: boolean;
}

/**
 * 스크롤 핀 옵션
 */
export interface ScrollPinOptions {
  start?: string;
  end?: string;
  pin?: boolean;
  markers?: boolean;
}

/**
 * 스크롤 시 페이드 인
 */
function scrollFadeIn(
  target: AnimationTarget,
  options: ScrollOptions = {}
): gsap.core.Tween {
  const defaults: ScrollOptions = {
    duration: 1,
    ease: 'power2.out',
    y: 50,
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none none',
    scrub: false,
    markers: false
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    opacity: 0,
    y: config.y,
    duration: config.duration,
    ease: config.ease,
    scrollTrigger: {
      trigger: config.trigger || (target as gsap.DOMTarget),
      start: config.start,
      end: config.end,
      toggleActions: config.toggleActions,
      scrub: config.scrub,
      markers: config.markers
    }
  });
}

/**
 * 스크롤 시 왼쪽에서 슬라이드 인
 */
function scrollSlideInLeft(
  target: AnimationTarget,
  options: ScrollOptions = {}
): gsap.core.Tween {
  const defaults: ScrollOptions = {
    duration: 1,
    ease: 'power2.out',
    x: -100,
    start: 'top 80%',
    toggleActions: 'play none none none',
    scrub: false,
    markers: false
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    opacity: 0,
    x: config.x,
    duration: config.duration,
    ease: config.ease,
    scrollTrigger: {
      trigger: config.trigger || (target as gsap.DOMTarget),
      start: config.start,
      toggleActions: config.toggleActions,
      scrub: config.scrub,
      markers: config.markers
    }
  });
}

/**
 * 스크롤 시 오른쪽에서 슬라이드 인
 */
function scrollSlideInRight(
  target: AnimationTarget,
  options: ScrollOptions = {}
): gsap.core.Tween {
  const defaults: ScrollOptions = {
    duration: 1,
    ease: 'power2.out',
    x: 100,
    start: 'top 80%',
    toggleActions: 'play none none none',
    scrub: false,
    markers: false
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    opacity: 0,
    x: config.x,
    duration: config.duration,
    ease: config.ease,
    scrollTrigger: {
      trigger: config.trigger || (target as gsap.DOMTarget),
      start: config.start,
      toggleActions: config.toggleActions,
      scrub: config.scrub,
      markers: config.markers
    }
  });
}

/**
 * 스크롤 진행도에 따라 애니메이션 (scrub 모드)
 */
function scrollProgress(
  target: AnimationTarget,
  options: ScrollProgressOptions = {}
): gsap.core.Tween {
  const defaults: ScrollProgressOptions = {
    to: { y: 100 },
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    markers: false
  };

  const config = { ...defaults, ...options };

  return gsap.to(target, {
    ...config.to,
    scrollTrigger: {
      trigger: config.trigger || (target as gsap.DOMTarget),
      start: config.start,
      end: config.end,
      scrub: config.scrub,
      markers: config.markers
    }
  });
}

/**
 * 패럴랙스 효과 (요소가 다른 속도로 스크롤)
 */
function parallax(
  target: AnimationTarget,
  options: ParallaxOptions = {}
): gsap.core.Tween {
  const defaults: ParallaxOptions = {
    speed: 0.5,
    start: 'top bottom',
    end: 'bottom top',
    markers: false
  };

  const config = { ...defaults, ...options };
  const yPercent = -(1 - config.speed!) * 100;

  return gsap.to(target, {
    yPercent: yPercent,
    ease: 'none',
    scrollTrigger: {
      trigger: config.trigger || (target as gsap.DOMTarget),
      start: config.start,
      end: config.end,
      scrub: true,
      markers: config.markers
    }
  });
}

/**
 * 스크롤 시 핀 고정 (요소를 화면에 고정)
 */
function scrollPin(
  target: gsap.DOMTarget,
  options: ScrollPinOptions = {}
): ScrollTrigger {
  const defaults: ScrollPinOptions = {
    start: 'top top',
    end: '+=500',
    pin: true,
    markers: false
  };

  const config = { ...defaults, ...options };

  return ScrollTrigger.create({
    trigger: target,
    start: config.start,
    end: config.end,
    pin: config.pin,
    markers: config.markers
  });
}

/**
 * 스크롤 시 각 아이템 순차 애니메이션 (배치 처리)
 */
function scrollStagger(
  target: AnimationTarget,
  options: ScrollOptions = {}
): gsap.core.Timeline | gsap.core.Tween {
  const defaults: ScrollOptions = {
    duration: 0.8,
    ease: 'power2.out',
    stagger: 0.2,
    y: 50,
    start: 'top 80%',
    toggleActions: 'play none none none',
    markers: false
  };

  const config = { ...defaults, ...options };

  return gsap.from(target, {
    opacity: 0,
    y: config.y,
    duration: config.duration,
    ease: config.ease,
    stagger: config.stagger,
    scrollTrigger: {
      trigger: config.trigger || (target as gsap.DOMTarget),
      start: config.start,
      toggleActions: config.toggleActions,
      markers: config.markers
    }
  });
}
