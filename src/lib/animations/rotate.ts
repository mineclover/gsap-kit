/**
 * GSAP Kit - Rotate 애니메이션 (TypeScript)
 */

/// <reference types="gsap" />

import { AnimationTarget, BaseAnimationOptions } from '../types';

/**
 * 회전 애니메이션 옵션
 */
export interface RotateOptions extends BaseAnimationOptions {
  rotation?: number;
  rotationX?: number;
  rotationY?: number;
  scale?: number;
  clockwise?: boolean;
}

/**
 * 요소를 회전시킵니다
 */
export function rotate(
  target: AnimationTarget,
  options: RotateOptions = {}
): gsap.core.Tween {
  const defaults: RotateOptions = {
    duration: 1,
    delay: 0,
    ease: 'power2.out',
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
 */
export function rotateIn(
  target: AnimationTarget,
  options: RotateOptions = {}
): gsap.core.Tween {
  const defaults: RotateOptions = {
    duration: 1,
    delay: 0,
    ease: 'back.out(1.5)',
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
 */
export function rotateOut(
  target: AnimationTarget,
  options: RotateOptions = {}
): gsap.core.Tween {
  const defaults: RotateOptions = {
    duration: 1,
    delay: 0,
    ease: 'back.in(1.5)',
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
 */
export function flipY(
  target: AnimationTarget,
  options: RotateOptions = {}
): gsap.core.Tween {
  const defaults: RotateOptions = {
    duration: 1,
    delay: 0,
    ease: 'power2.inOut',
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
 */
export function flipX(
  target: AnimationTarget,
  options: RotateOptions = {}
): gsap.core.Tween {
  const defaults: RotateOptions = {
    duration: 1,
    delay: 0,
    ease: 'power2.inOut',
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
 */
export function spinInfinite(
  target: AnimationTarget,
  options: RotateOptions = {}
): gsap.core.Tween {
  const defaults: RotateOptions = {
    duration: 2,
    ease: 'none',
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

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).rotate = rotate;
  (window as any).rotateIn = rotateIn;
  (window as any).rotateOut = rotateOut;
  (window as any).flipY = flipY;
  (window as any).flipX = flipX;
  (window as any).spinInfinite = spinInfinite;
}
