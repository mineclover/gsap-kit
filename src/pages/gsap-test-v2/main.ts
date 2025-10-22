/**
 * GSAP Test Page (Web Component Version)
 * 웹 컴포넌트를 사용한 간소화된 버전
 */

declare const gsap: any;

// Import test runner component
import '../../lib/testing/test-runner-component';

// Animation references
let fadeAnimation: any = null;
let slideAnimation: any = null;
let scaleAnimation: any = null;
let rotationAnimation: any = null;
let timeline: any = null;
let progressAnimation: any = null;

/**
 * Initialize all GSAP animations
 */
function initAnimations(): void {
  console.log('🎬 Initializing GSAP animations...');

  // 1. Fade Animation
  const fadeBox = document.querySelector('.fade-box');
  const fadeTrigger = document.getElementById('fade-trigger');
  let isFadedIn = false;

  fadeTrigger?.addEventListener('click', () => {
    if (!fadeBox) return;

    fadeAnimation = gsap.to(fadeBox, {
      opacity: isFadedIn ? 0 : 1,
      duration: 1,
      ease: 'power2.inOut',
    });

    isFadedIn = !isFadedIn;
  });

  // 2. Slide Animation
  const slideBox = document.querySelector('.slide-box');
  const slideTrigger = document.getElementById('slide-trigger');
  const slideReset = document.getElementById('slide-reset');

  slideTrigger?.addEventListener('click', () => {
    if (!slideBox) return;
    slideAnimation = gsap.to(slideBox, {
      x: 200,
      duration: 1.5,
      ease: 'power2.out',
    });
  });

  slideReset?.addEventListener('click', () => {
    if (!slideBox) return;
    slideAnimation = gsap.to(slideBox, {
      x: 0,
      duration: 0.5,
      ease: 'power2.in',
    });
  });

  // 3. Scale Animation
  const scaleBox = document.querySelector('.scale-box');
  const scaleTrigger = document.getElementById('scale-trigger');
  const scaleReset = document.getElementById('scale-reset');

  scaleTrigger?.addEventListener('click', () => {
    if (!scaleBox) return;
    scaleAnimation = gsap.to(scaleBox, {
      scale: 1.5,
      duration: 1.5,
      ease: 'elastic.out(1, 0.5)',
    });
  });

  scaleReset?.addEventListener('click', () => {
    if (!scaleBox) return;
    scaleAnimation = gsap.to(scaleBox, {
      scale: 1,
      duration: 0.5,
      ease: 'power2.in',
    });
  });

  // 4. Rotation Animation
  const rotationBox = document.querySelector('.rotation-box');
  const rotationTrigger = document.getElementById('rotation-trigger');
  const rotationReset = document.getElementById('rotation-reset');

  rotationTrigger?.addEventListener('click', () => {
    if (!rotationBox) return;
    rotationAnimation = gsap.to(rotationBox, {
      rotation: 360,
      duration: 2,
      ease: 'power2.inOut',
    });
  });

  rotationReset?.addEventListener('click', () => {
    if (!rotationBox) return;
    rotationAnimation = gsap.to(rotationBox, {
      rotation: 0,
      duration: 0.5,
      ease: 'power2.in',
    });
  });

  // 5. Timeline Control
  const timelineBox = document.querySelector('.timeline-box');
  const timelinePlay = document.getElementById('timeline-play');
  const timelinePause = document.getElementById('timeline-pause');
  const timelineRestart = document.getElementById('timeline-restart');

  timeline = gsap.timeline({ paused: true });
  timeline
    .to(timelineBox, { x: 100, duration: 1, ease: 'power2.inOut' })
    .to(timelineBox, { y: 100, duration: 1, ease: 'power2.inOut' })
    .to(timelineBox, { x: 0, duration: 1, ease: 'power2.inOut' })
    .to(timelineBox, { y: 0, duration: 1, ease: 'power2.inOut' });

  timelinePlay?.addEventListener('click', () => timeline?.play());
  timelinePause?.addEventListener('click', () => timeline?.pause());
  timelineRestart?.addEventListener('click', () => timeline?.restart());

  // 6. Progress Tracking
  const progressBox = document.querySelector('.progress-box');
  const progressTrigger = document.getElementById('progress-trigger');
  const progressValue = document.getElementById('progress-value');

  progressTrigger?.addEventListener('click', () => {
    if (!progressBox) return;

    progressAnimation = gsap.to(progressBox, {
      x: 300,
      duration: 3,
      ease: 'none',
      onUpdate: function () {
        const progress = this.progress();
        if (progressValue) {
          progressValue.textContent = `${Math.round(progress * 100)}%`;
        }
      },
      onComplete: () => {
        if (progressValue) {
          progressValue.textContent = '100%';
        }
      },
    });
  });

  console.log('✓ Animations initialized');
}

/**
 * Reset all animations
 */
function resetAllAnimations(): void {
  console.log('🔄 Resetting all animations...');

  gsap.killTweensOf('.fade-box');
  gsap.killTweensOf('.slide-box');
  gsap.killTweensOf('.scale-box');
  gsap.killTweensOf('.rotation-box');
  gsap.killTweensOf('.timeline-box');
  gsap.killTweensOf('.progress-box');

  timeline?.kill();
  timeline = null;

  gsap.set('.fade-box', { opacity: 0 });
  gsap.set('.slide-box', { x: 0 });
  gsap.set('.scale-box', { scale: 1 });
  gsap.set('.rotation-box', { rotation: 0 });
  gsap.set('.timeline-box', { x: 0, y: 0 });
  gsap.set('.progress-box', { x: 0 });

  const progressValue = document.getElementById('progress-value');
  if (progressValue) {
    progressValue.textContent = '0%';
  }

  initAnimations();
  console.log('✓ Reset complete');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAnimations);

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).gsapTest = {
    resetAllAnimations,
    getTimeline: () => timeline,
  };
}
