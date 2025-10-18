/**
 * GSAP Kit - Scroll 애니메이션 (ScrollTrigger 필요)
 * ScrollTrigger CDN: https://cdn.jsdelivr.net/npm/gsap@3.13/dist/ScrollTrigger.min.js
 */

/**
 * ScrollTrigger 등록 (최초 1회 실행)
 */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * 스크롤 시 페이드 인
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.duration=1] - 지속 시간 (초)
 * @param {string} [options.ease="power2.out"] - easing 함수
 * @param {number} [options.y=50] - 시작 Y 위치
 * @param {string} [options.trigger] - 트리거 요소 (기본: target)
 * @param {string} [options.start="top 80%"] - 시작 지점
 * @param {string} [options.end="bottom 20%"] - 종료 지점
 * @param {boolean} [options.toggleActions=true] - 반복 재생 여부
 * @param {boolean} [options.scrub=false] - 스크롤과 동기화
 * @param {boolean} [options.markers=false] - 디버그 마커 표시
 * @returns {gsap.core.Tween}
 */
function scrollFadeIn(target, options = {}) {
  const defaults = {
    duration: 1,
    ease: "power2.out",
    y: 50,
    start: "top 80%",
    end: "bottom 20%",
    toggleActions: "play none none none",
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
      trigger: config.trigger || target,
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
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @returns {gsap.core.Tween}
 */
function scrollSlideInLeft(target, options = {}) {
  const defaults = {
    duration: 1,
    ease: "power2.out",
    x: -100,
    start: "top 80%",
    toggleActions: "play none none none",
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
      trigger: config.trigger || target,
      start: config.start,
      toggleActions: config.toggleActions,
      scrub: config.scrub,
      markers: config.markers
    }
  });
}

/**
 * 스크롤 시 오른쪽에서 슬라이드 인
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @returns {gsap.core.Tween}
 */
function scrollSlideInRight(target, options = {}) {
  const defaults = {
    duration: 1,
    ease: "power2.out",
    x: 100,
    start: "top 80%",
    toggleActions: "play none none none",
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
      trigger: config.trigger || target,
      start: config.start,
      toggleActions: config.toggleActions,
      scrub: config.scrub,
      markers: config.markers
    }
  });
}

/**
 * 스크롤 진행도에 따라 애니메이션 (scrub 모드)
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {Object} [options.to] - 애니메이션 종료 속성값
 * @param {string} [options.start="top bottom"] - 시작 지점
 * @param {string} [options.end="bottom top"] - 종료 지점
 * @param {boolean|number} [options.scrub=true] - 스크롤 동기화 (true 또는 지연시간)
 * @returns {gsap.core.Tween}
 */
function scrollProgress(target, options = {}) {
  const defaults = {
    to: { y: 100 },
    start: "top bottom",
    end: "bottom top",
    scrub: true,
    markers: false
  };

  const config = { ...defaults, ...options };

  return gsap.to(target, {
    ...config.to,
    scrollTrigger: {
      trigger: config.trigger || target,
      start: config.start,
      end: config.end,
      scrub: config.scrub,
      markers: config.markers
    }
  });
}

/**
 * 패럴랙스 효과 (요소가 다른 속도로 스크롤)
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.speed=0.5] - 스크롤 속도 (0~1: 느림, 1: 일반, 1+: 빠름)
 * @param {string} [options.start="top bottom"] - 시작 지점
 * @param {string} [options.end="bottom top"] - 종료 지점
 * @returns {gsap.core.Tween}
 */
function parallax(target, options = {}) {
  const defaults = {
    speed: 0.5,
    start: "top bottom",
    end: "bottom top",
    markers: false
  };

  const config = { ...defaults, ...options };
  const yPercent = -(1 - config.speed) * 100;

  return gsap.to(target, {
    yPercent: yPercent,
    ease: "none",
    scrollTrigger: {
      trigger: config.trigger || target,
      start: config.start,
      end: config.end,
      scrub: true,
      markers: config.markers
    }
  });
}

/**
 * 스크롤 시 핀 고정 (요소를 화면에 고정)
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {string} [options.start="top top"] - 시작 지점
 * @param {string} [options.end="+=500"] - 종료 지점 (픽셀 또는 상대값)
 * @param {boolean} [options.pin=true] - 핀 고정 여부
 * @returns {Object} ScrollTrigger 인스턴스
 */
function scrollPin(target, options = {}) {
  const defaults = {
    start: "top top",
    end: "+=500",
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
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.stagger=0.2] - 각 요소간 지연 시간
 * @param {number} [options.duration=0.8] - 지속 시간
 * @returns {gsap.core.Timeline}
 */
function scrollStagger(target, options = {}) {
  const defaults = {
    duration: 0.8,
    ease: "power2.out",
    stagger: 0.2,
    y: 50,
    start: "top 80%",
    toggleActions: "play none none none",
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
      trigger: config.trigger || target,
      start: config.start,
      toggleActions: config.toggleActions,
      markers: config.markers
    }
  });
}
