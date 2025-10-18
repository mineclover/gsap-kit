# GSAP Kit 컨벤션

## 프로젝트 개요
순수 JavaScript + GSAP CDN을 사용하는 재사용 가능한 인터랙션 함수 라이브러리

**주요 기능**: 드래그 & 인터랙션 중심 (Draggable 플러그인 활용)

## 폴더 구조

```
gsap-kit/
├── src/
│   ├── draggable/          # 🎯 드래그 & 인터랙션 (주요 기능)
│   │   ├── basic.js        # 기본 드래그 함수들
│   │   ├── advanced.js     # 고급 드래그 (스냅, 슬라이더, 정렬 등)
│   │   └── index.js        # 통합 파일
│   ├── animations/         # 애니메이션 함수들
│   │   ├── fade.js         # 페이드 인/아웃
│   │   ├── slide.js        # 슬라이드
│   │   ├── scroll.js       # 스크롤 트리거
│   │   ├── rotate.js       # 회전
│   │   └── index.js        # 통합 파일
│   ├── interactions/       # 기타 인터랙션 (예정)
│   └── utils/              # 유틸리티 함수
│       └── helpers.js      # 공통 헬퍼
├── examples/               # 테스트 및 데모 HTML
│   ├── draggable.html      # 🎯 드래그 예제 (주요)
│   ├── basic.html          # 기본 애니메이션
│   ├── scroll.html         # 스크롤 애니메이션
│   └── ...
├── docs/
│   └── CONVENTIONS.md
└── README.md
```

## 코딩 컨벤션

### 1. 파일 명명 규칙
- 소문자 사용, 하이픈으로 단어 구분: `fade-in.js` ❌ → `fade.js` ✅
- 기능별로 파일 분리
- 각 파일은 관련된 함수들의 모음

### 2. 함수 명명 규칙
- camelCase 사용
- 동작을 명확히 표현하는 이름
- **드래그 함수**: `make` 접두사 사용
- **애니메이션 함수**: 동작 동사 사용
- 예시:
  ```javascript
  // 드래그 함수
  makeDraggable()
  makeDraggableX()
  makeSlider()
  makeSortable()

  // 애니메이션 함수
  fadeIn()
  fadeOut()
  slideFromLeft()
  scrollFadeIn()
  ```

### 3. 함수 구조

#### 드래그 함수 패턴

```javascript
/**
 * @description 함수 설명
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 드래그 옵션
 * @param {string} [options.type="x,y"] - 드래그 타입
 * @param {boolean} [options.inertia=false] - 관성 효과
 * @param {Object|string} [options.bounds] - 드래그 경계
 * @param {Function} [options.onDrag] - 드래그 중 콜백
 * @returns {Array<Draggable>} Draggable 인스턴스 배열
 */
function makeDraggable(target, options = {}) {
  if (!target) {
    console.error('[GSAP Kit] target이 필요합니다');
    return null;
  }

  const defaults = {
    type: "x,y",
    inertia: false
  };

  const config = { ...defaults, ...options };

  return Draggable.create(target, {
    ...config
  });
}
```

#### 애니메이션 함수 패턴

```javascript
/**
 * @description 함수 설명
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} options.duration - 애니메이션 지속 시간 (초)
 * @param {number} options.delay - 지연 시간 (초)
 * @param {string} options.ease - easing 함수
 * @returns {gsap.core.Timeline|gsap.core.Tween} GSAP 인스턴스
 */
function animationName(target, options = {}) {
  const defaults = {
    duration: 1,
    delay: 0,
    ease: "power2.out"
  };

  const config = { ...defaults, ...options };

  return gsap.to(target, config);
}
```

### 4. 옵션 기본값

모든 함수는 기본값을 제공해야 합니다:

```javascript
const defaults = {
  duration: 1,        // 1초
  delay: 0,          // 지연 없음
  ease: "power2.out" // 기본 easing
};
```

### 5. JSDoc 주석

모든 함수에는 JSDoc 주석을 작성합니다:

```javascript
/**
 * 요소를 페이드 인 시킵니다
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 애니메이션 옵션
 * @param {number} [options.duration=1] - 지속 시간 (초)
 * @param {number} [options.delay=0] - 지연 시간 (초)
 * @param {string} [options.ease="power2.out"] - easing 함수
 * @param {number} [options.y=50] - 시작 Y 위치
 * @returns {gsap.core.Tween}
 */
```

### 6. HTML 예제 파일 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>예제 제목 - GSAP Kit</title>
  <style>
    /* 스타일 작성 */
  </style>
</head>
<body>
  <!-- HTML 구조 -->

  <!-- GSAP CDN -->
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/ScrollTrigger.min.js"></script>

  <!-- 유틸리티 함수 -->
  <script src="../src/utils/helpers.js"></script>

  <!-- 애니메이션 함수들 -->
  <script src="../src/animations/fade.js"></script>

  <!-- 실행 스크립트 -->
  <script>
    // 사용 예제
  </script>
</body>
</html>
```

### 7. 에러 처리

```javascript
function animationName(target, options = {}) {
  if (!target) {
    console.error('[GSAP Kit] target이 필요합니다');
    return null;
  }

  // 함수 로직...
}
```

### 8. 반환값

- 항상 GSAP 인스턴스(Tween 또는 Timeline)를 반환
- 체이닝 및 제어 가능하도록 함

```javascript
const animation = fadeIn('.box');
animation.pause();
animation.play();
```

## GSAP 사용 가이드

### 필수 플러그인

```html
<!-- 기본 GSAP (필수) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>

<!-- Draggable (드래그 기능 사용 시) ⭐ 주요 -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/Draggable.min.js"></script>

<!-- ScrollTrigger (스크롤 애니메이션 사용 시) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/ScrollTrigger.min.js"></script>
```

### 드래그 함수 반환값

모든 드래그 함수는 **Draggable 인스턴스 배열**을 반환합니다:

```javascript
const dragInstances = makeDraggable('.box');

// 제어
disableDraggable(dragInstances);  // 비활성화
enableDraggable(dragInstances);   // 활성화
killDraggable(dragInstances);     // 제거
```

### 자주 사용하는 Easing

```javascript
"power1.out"    // 부드러운 감속
"power2.out"    // 중간 감속 (기본값)
"power3.out"    // 강한 감속
"power4.out"    // 매우 강한 감속
"back.out"      // 살짝 튕기는 효과
"elastic.out"   // 탄성 효과
"bounce.out"    // 바운스 효과
```

## Git 커밋 컨벤션

```
feat: 새로운 애니메이션 함수 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 예제 추가/수정
chore: 기타 변경사항
```

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 라이센스

MIT
