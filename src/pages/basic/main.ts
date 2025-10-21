import { fadeIn, fadeInDown, fadeInLeft, fadeInRight, fadeInScale, fadeInUp } from '../../lib/animations/fade';
import { flipX, flipY, rotate, rotateIn } from '../../lib/animations/rotate';
import { slideInDown, slideInLeft, slideInRight, slideInUp } from '../../lib/animations/slide';

// Fade 애니메이션 실행
function runFadeAnimations() {
  fadeIn('.fade-box');
  fadeInUp('.fade-up-box', { delay: 0.1 });
  fadeInDown('.fade-down-box', { delay: 0.2 });
  fadeInLeft('.fade-left-box', { delay: 0.3 });
  fadeInRight('.fade-right-box', { delay: 0.4 });
  fadeInScale('.fade-scale-box', { delay: 0.5 });
}

// Slide 애니메이션 실행
function runSlideAnimations() {
  slideInLeft('.slide-left-box');
  slideInRight('.slide-right-box', { delay: 0.1 });
  slideInUp('.slide-up-box', { delay: 0.2 });
  slideInDown('.slide-down-box', { delay: 0.3 });
}

// Rotate 애니메이션 실행
function runRotateAnimations() {
  rotate('.rotate-box', { rotation: 360 });
  rotateIn('.rotate-in-box', { delay: 0.1 });
  flipX('.flip-x-box', { delay: 0.2 });
  flipY('.flip-y-box', { delay: 0.3 });
}

// Stagger 애니메이션 실행
function runStaggerAnimation() {
  fadeInUp('.stagger-box', {
    stagger: 0.1,
    duration: 0.6,
  });
}

// 전역으로 노출 (HTML onclick에서 사용)
(window as any).runFadeAnimations = runFadeAnimations;
(window as any).runSlideAnimations = runSlideAnimations;
(window as any).runRotateAnimations = runRotateAnimations;
(window as any).runStaggerAnimation = runStaggerAnimation;

// 개별 박스 클릭 이벤트
document.querySelectorAll('.box').forEach(box => {
  box.addEventListener('click', function (this: HTMLElement) {
    gsap.to(this, {
      scale: 1.1,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });
  });
});

// 페이지 로드 시 초기 애니메이션
window.addEventListener('load', () => {
  gsap.from('h1', {
    opacity: 0,
    y: -50,
    duration: 1,
    ease: 'power3.out',
  });

  gsap.from('.section-title', {
    opacity: 0,
    x: -50,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
  });
});
