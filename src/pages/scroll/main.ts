import { scrollFadeIn, scrollSlideInLeft, scrollSlideInRight, parallax, scrollStagger, scrollProgress, scrollPin } from '../../lib/animations/scroll';

// Hero 애니메이션
gsap.from('.hero-title', {
  opacity: 0,
  y: 50,
  duration: 1,
  ease: "power3.out"
});

gsap.from('.hero-subtitle', {
  opacity: 0,
  y: 30,
  duration: 1,
  delay: 0.3,
  ease: "power3.out"
});

// 섹션 타이틀 스크롤 애니메이션
scrollFadeIn('.scroll-title', {
  y: 80,
  duration: 0.8
});

// Fade Items
scrollFadeIn('.fade-item', {
  stagger: 0.2,
  start: "top 85%"
});

// Slide Items
document.querySelectorAll('.slide-left').forEach(el => {
  scrollSlideInLeft(el, { start: "top 85%" });
});

document.querySelectorAll('.slide-right').forEach(el => {
  scrollSlideInRight(el, { start: "top 85%" });
});

// Parallax
parallax('.parallax-bg-layer', {
  speed: 0.5
});

// Stagger
scrollStagger('.stagger-item', {
  stagger: 0.1,
  y: 60,
  start: "top 85%"
});

// Scrub (스크롤 진행에 따른 애니메이션)
scrollProgress('.scrub-box', {
  to: {
    rotation: 360,
    scale: 1.5,
    borderRadius: "50%"
  },
  scrub: 1,
  start: "top bottom",
  end: "bottom top"
});

// Pin
scrollPin('.pin-element', {
  start: "top top",
  end: "+=1000"
});

// 스크롤 진행도 표시
ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    const progress = Math.round(self.progress * 100);
    const progressElement = document.getElementById('progress');
    if (progressElement) {
      progressElement.textContent = progress + '%';
    }
  }
});

console.log('[GSAP Kit] 스크롤 애니메이션 예제가 로드되었습니다');
