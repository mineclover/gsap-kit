/**
 * GSAP Test Page - Animation Testing
 */

// GSAP은 CDN에서 로드됨
declare const gsap: any;

import { runTestsFromFile, setupGlobalAutomation, testRunner } from '../../lib/testing';
import * as gsapAssertions from '../../lib/testing/gsap-assertions';
import type { TestFileSpec } from '../../lib/testing/spec-loader';
import { AssertionValidator, TestSpecLoader } from '../../lib/testing/spec-loader';

// Animation references
let fadeAnimation: gsap.core.Tween | null = null;
let slideAnimation: gsap.core.Tween | null = null;
let scaleAnimation: gsap.core.Tween | null = null;
let rotationAnimation: gsap.core.Tween | null = null;
let timeline: gsap.core.Timeline | null = null;
let progressAnimation: gsap.core.Tween | null = null;

/**
 * Initialize all animations
 */
function initAnimations() {
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
      duration: 1,
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

  // Create timeline
  timeline = gsap.timeline({ paused: true });
  timeline
    .to(timelineBox, {
      x: 100,
      duration: 1,
      ease: 'power2.inOut',
    })
    .to(timelineBox, {
      y: 100,
      duration: 1,
      ease: 'power2.inOut',
    })
    .to(timelineBox, {
      x: 0,
      duration: 1,
      ease: 'power2.inOut',
    })
    .to(timelineBox, {
      y: 0,
      duration: 1,
      ease: 'power2.inOut',
    });

  timelinePlay?.addEventListener('click', () => {
    timeline?.play();
  });

  timelinePause?.addEventListener('click', () => {
    timeline?.pause();
  });

  timelineRestart?.addEventListener('click', () => {
    timeline?.restart();
  });

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
}

/**
 * Reset all animations (for testing)
 */
function resetAllAnimations() {
  // Kill all tweens
  gsap.killTweensOf('.fade-box');
  gsap.killTweensOf('.slide-box');
  gsap.killTweensOf('.scale-box');
  gsap.killTweensOf('.rotation-box');
  gsap.killTweensOf('.timeline-box');
  gsap.killTweensOf('.progress-box');

  // Reset timeline
  timeline?.kill();
  timeline = null;

  // Reset all properties
  gsap.set('.fade-box', { opacity: 0 });
  gsap.set('.slide-box', { x: 0 });
  gsap.set('.scale-box', { scale: 1 });
  gsap.set('.rotation-box', { rotation: 0 });
  gsap.set('.timeline-box', { x: 0, y: 0 });
  gsap.set('.progress-box', { x: 0 });

  // Reset progress display
  const progressValue = document.getElementById('progress-value');
  if (progressValue) {
    progressValue.textContent = '0%';
  }

  // Re-initialize animations
  initAnimations();
}

/**
 * Trigger fade animation (for testing)
 */
function triggerFadeAnimation() {
  const fadeTrigger = document.getElementById('fade-trigger') as HTMLButtonElement;
  fadeTrigger?.click();
}

/**
 * Trigger slide animation (for testing)
 */
function triggerSlideAnimation() {
  const slideTrigger = document.getElementById('slide-trigger') as HTMLButtonElement;
  slideTrigger?.click();
}

/**
 * Trigger scale animation (for testing)
 */
function triggerScaleAnimation() {
  const scaleTrigger = document.getElementById('scale-trigger') as HTMLButtonElement;
  scaleTrigger?.click();
}

/**
 * Trigger rotation animation (for testing)
 */
function triggerRotationAnimation() {
  const rotationTrigger = document.getElementById('rotation-trigger') as HTMLButtonElement;
  rotationTrigger?.click();
}

/**
 * Start timeline (for testing)
 */
function startTimeline() {
  timeline?.play();
}

/**
 * Pause timeline (for testing)
 */
function pauseTimeline() {
  timeline?.pause();
}

/**
 * Restart timeline (for testing)
 */
function restartTimeline() {
  timeline?.restart();
}

/**
 * Trigger progress animation (for testing)
 */
function triggerProgressAnimation() {
  const progressTrigger = document.getElementById('progress-trigger') as HTMLButtonElement;
  progressTrigger?.click();
}

/**
 * Get current timeline (for testing)
 */
function getTimeline() {
  return timeline;
}

/**
 * Run JSON spec tests
 */
async function runSpecTests(specPath: string) {
  try {
    return await runTestsFromFile(specPath);
  } catch (error) {
    console.error('[GSAP Test] Failed to run spec tests:', error);
    throw error;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();

  console.log('[GSAP Test] Page initialized');
  console.log('[GSAP Test] Available test functions:');
  console.log('  - resetAllAnimations()');
  console.log('  - triggerFadeAnimation()');
  console.log('  - triggerSlideAnimation()');
  console.log('  - triggerScaleAnimation()');
  console.log('  - triggerRotationAnimation()');
  console.log('  - startTimeline()');
  console.log('  - pauseTimeline()');
  console.log('  - restartTimeline()');
  console.log('  - triggerProgressAnimation()');
  console.log('  - getTimeline()');
  console.log('  - runSpecTests(specPath)');
});

// Expose to window for testing
if (typeof window !== 'undefined') {
  (window as any).gsapTest = {
    resetAllAnimations,
    triggerFadeAnimation,
    triggerSlideAnimation,
    triggerScaleAnimation,
    triggerRotationAnimation,
    startTimeline,
    pauseTimeline,
    restartTimeline,
    triggerProgressAnimation,
    getTimeline,
    runSpecTests,
  };

  // Expose testing utilities
  (window as any).TestSpecLoader = TestSpecLoader;
  (window as any).AssertionValidator = AssertionValidator;
  (window as any).gsapAssertions = gsapAssertions;
  (window as any).runTestsFromFile = runTestsFromFile;

  // Setup global automation API
  setupGlobalAutomation(testRunner, {
    autoStart: false,
  });
}
