# GSAP Kit

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![GSAP](https://img.shields.io/badge/GSAP-3.13-green.svg)

순수 JavaScript와 GSAP CDN을 사용하는 재사용 가능한 인터랙션 함수 라이브러리입니다.

번들링이 필요 없이 HTML 파일에 바로 포함하여 사용할 수 있습니다.

**🔗 저장소**: [github.com/mineclover/gsap-kit](https://github.com/mineclover/gsap-kit)

## 특징

- 🎯 **드래그 & 인터랙션 중심**: Draggable 플러그인을 활용한 다양한 드래그 기능
- ✅ **TypeScript 지원**: 완전한 타입 정의와 타입 안전성
- ✅ **순수 JavaScript 출력**: 번들러 없이 바로 사용 가능
- ✅ **GSAP CDN**: 간단한 CDN 로드만으로 시작
- ✅ **재사용 가능한 함수**: 일반적인 패턴을 함수화
- ✅ **실시간 개발 환경**: tsc --watch로 자동 컴파일
- ✅ **테스트 환경**: 바로 실행 가능한 HTML 예제 포함
- ✅ **확장 가능**: 쉽게 커스터마이징하고 새로운 함수 추가 가능

## 빠른 시작

### 1. HTML에 GSAP CDN 추가

```html
<!-- 기본 GSAP -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>

<!-- Draggable (드래그 기능 사용 시) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/Draggable.min.js"></script>

<!-- ScrollTrigger (스크롤 애니메이션 사용 시) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/ScrollTrigger.min.js"></script>
```

### 2. 함수 파일 추가

```html
<!-- 드래그 기능 -->
<script src="./dist/draggable/basic.js"></script>
<script src="./dist/draggable/advanced.js"></script>

<!-- 애니메이션 -->
<script src="./dist/animations/fade.js"></script>
<script src="./dist/animations/slide.js"></script>

<!-- 유틸리티 -->
<script src="./dist/utils/helpers.js"></script>
```

### 3. 사용하기

```html
<div class="box">드래그해보세요!</div>

<script>
  // 기본 드래그
  makeDraggable('.box');

  // 옵션과 함께
  makeDraggable('.box', {
    type: "x,y",
    bounds: window,
    inertia: true
  });

  // 그리드 스냅 드래그
  makeDraggableSnap('.box', {
    gridSize: 50
  });

  // 애니메이션과 함께
  fadeIn('.box');
</script>
```

## 프로젝트 구조

```
gsap-kit/
├── src-ts/                 # 📝 TypeScript 소스 코드
│   ├── draggable/          # 🎯 드래그 & 인터랙션 (주요 기능)
│   │   ├── basic.ts        # 기본 드래그 함수들
│   │   ├── advanced.ts     # 고급 드래그 (스냅, 슬라이더, 정렬 등)
│   │   └── index.ts        # 통합 파일
│   ├── animations/         # 애니메이션 함수들
│   │   ├── fade.ts         # 페이드 인/아웃
│   │   ├── slide.ts        # 슬라이드
│   │   ├── scroll.ts       # 스크롤 트리거
│   │   ├── rotate.ts       # 회전
│   │   └── index.ts        # 통합 파일
│   └── utils/              # 유틸리티 함수
│       └── helpers.ts      # 공통 헬퍼
├── dist/                   # 📦 컴파일된 JavaScript (자동 생성)
│   ├── draggable/          # 브라우저에서 사용할 파일들
│   ├── animations/
│   └── utils/
├── examples/               # 테스트 및 데모 HTML
│   ├── draggable.html      # 🎯 드래그 예제 (주요)
│   ├── basic.html          # 기본 애니메이션
│   ├── preview.html        # 미리보기
│   └── scroll.html         # 스크롤 애니메이션
├── docs/
│   └── CONVENTIONS.md      # 코딩 컨벤션
├── tsconfig.json           # TypeScript 설정
└── README.md
```

## 함수 목록

### 🎯 Draggable 함수 (주요 기능)

#### 기본 드래그 (basic.js)

| 함수 | 설명 |
|------|------|
| `makeDraggable()` | 자유롭게 드래그 가능 |
| `makeDraggableX()` | X축(가로)으로만 드래그 |
| `makeDraggableY()` | Y축(세로)으로만 드래그 |
| `makeDraggableWithBounds()` | 경계 제한 드래그 |
| `makeDraggableInParent()` | 부모 요소 내에서만 드래그 |
| `makeDraggableWithInertia()` | 관성(던지기) 효과 |
| `makeRotatable()` | 회전 가능 |
| `enableDraggable()` | 드래그 활성화 |
| `disableDraggable()` | 드래그 비활성화 |
| `killDraggable()` | 드래그 제거 |

#### 고급 드래그 (advanced.js)

| 함수 | 설명 |
|------|------|
| `makeDraggableSnap()` | 그리드에 스냅되는 드래그 |
| `makeSlider()` | 슬라이더/레인지 만들기 |
| `makeSortable()` | 정렬 가능한 리스트 |
| `makeSwipeable()` | 스와이프 감지 (모바일) |
| `makeDraggableWithRange()` | 값 매핑 드래그 |

### Fade 애니메이션 (fade.js)

| 함수 | 설명 |
|------|------|
| `fadeIn()` | 페이드 인 |
| `fadeOut()` | 페이드 아웃 |
| `fadeInUp()` | 아래에서 위로 페이드 인 |
| `fadeInDown()` | 위에서 아래로 페이드 인 |
| `fadeInLeft()` | 왼쪽에서 페이드 인 |
| `fadeInRight()` | 오른쪽에서 페이드 인 |
| `fadeInScale()` | 확대하면서 페이드 인 |

### Slide 애니메이션 (slide.js)

| 함수 | 설명 |
|------|------|
| `slideInLeft()` | 왼쪽에서 슬라이드 인 |
| `slideInRight()` | 오른쪽에서 슬라이드 인 |
| `slideInUp()` | 위에서 슬라이드 인 |
| `slideInDown()` | 아래에서 슬라이드 인 |
| `slideOutLeft()` | 왼쪽으로 슬라이드 아웃 |
| `slideOutRight()` | 오른쪽으로 슬라이드 아웃 |

### Scroll 애니메이션 (scroll.js)

| 함수 | 설명 |
|------|------|
| `scrollFadeIn()` | 스크롤 시 페이드 인 |
| `scrollSlideInLeft()` | 스크롤 시 왼쪽에서 슬라이드 인 |
| `scrollSlideInRight()` | 스크롤 시 오른쪽에서 슬라이드 인 |
| `scrollProgress()` | 스크롤 진행도에 따른 애니메이션 |
| `parallax()` | 패럴랙스 효과 |
| `scrollPin()` | 스크롤 시 요소 고정 |
| `scrollStagger()` | 스크롤 시 순차 애니메이션 |

### Rotate 애니메이션 (rotate.js)

| 함수 | 설명 |
|------|------|
| `rotate()` | 회전 |
| `rotateIn()` | 회전하면서 페이드 인 |
| `rotateOut()` | 회전하면서 페이드 아웃 |
| `flipX()` | X축 기준 플립 |
| `flipY()` | Y축 기준 플립 |
| `spinInfinite()` | 무한 회전 |

## 사용 예제

### 🎯 드래그 기능

#### 기본 드래그

```javascript
// 자유롭게 드래그
makeDraggable('.box');

// X축만 드래그
makeDraggableX('.slider-handle');

// 경계 제한
makeDraggableInParent('.box');

// 관성 효과 (던지기)
makeDraggableWithInertia('.box', {
  bounds: window
});
```

#### 그리드 스냅

```javascript
// 50px 그리드에 맞춰 스냅
makeDraggableSnap('.box', {
  gridSize: 50,
  bounds: '.container'
});
```

#### 슬라이더 만들기

```javascript
makeSlider('.slider-handle', {
  axis: 'x',
  min: 0,
  max: 100,
  bounds: '.slider-track',
  onChange: (value) => {
    console.log('값:', value);
    document.getElementById('output').textContent = value;
  }
});
```

#### 정렬 가능한 리스트

```javascript
makeSortable('.list-item', {
  onSort: (newOrder) => {
    console.log('새로운 순서:', newOrder);
  }
});
```

#### 스와이프 감지

```javascript
makeSwipeable('.card', {
  threshold: 80,
  onSwipeLeft: () => console.log('왼쪽 스와이프'),
  onSwipeRight: () => console.log('오른쪽 스와이프'),
  onSwipeUp: () => console.log('위 스와이프'),
  onSwipeDown: () => console.log('아래 스와이프')
});
```

#### 드래그 제어

```javascript
// 드래그 인스턴스 저장
const drag = makeDraggable('.box');

// 비활성화
disableDraggable(drag);

// 활성화
enableDraggable(drag);

// 제거
killDraggable(drag);
```

### 기본 페이드 애니메이션

```javascript
// 단순 페이드 인
fadeIn('.element');

// 옵션과 함께
fadeIn('.element', {
  duration: 1.5,
  delay: 0.5,
  ease: "power2.out",
  y: 50
});

// 여러 요소에 순차 적용
fadeIn('.items', {
  stagger: 0.2  // 각 요소마다 0.2초 간격
});
```

### 스크롤 애니메이션

```javascript
// 스크롤 시 페이드 인
scrollFadeIn('.section', {
  start: "top 80%",    // 요소의 top이 viewport의 80% 지점에 올 때 시작
  end: "bottom 20%",   // 요소의 bottom이 viewport의 20% 지점에 올 때 종료
  scrub: true          // 스크롤과 동기화
});

// 패럴랙스 효과
parallax('.background', {
  speed: 0.5  // 0~1: 느림, 1: 일반, 1+: 빠름
});

// 요소 고정
scrollPin('.sticky-section', {
  start: "top top",
  end: "+=500"  // 500px 스크롤 동안 고정
});
```

### 슬라이드 애니메이션

```javascript
// 왼쪽에서 슬라이드
slideInLeft('.menu');

// 여러 요소 순차 슬라이드
slideInRight('.cards', {
  stagger: 0.15,
  duration: 0.8
});
```

### 회전 애니메이션

```javascript
// 360도 회전
rotate('.logo', {
  rotation: 360,
  duration: 2
});

// 무한 회전
spinInfinite('.loader', {
  duration: 1,
  clockwise: true
});

// 3D 플립
flipY('.card', {
  rotationY: 180,
  duration: 0.6
});
```

## 예제 실행하기

### 빠른 시작 (순수 JS)

```bash
# 로컬 서버 실행
npm run dev

# 브라우저에서 examples/draggable.html 자동 열림
```

### TypeScript 개발 모드 ⭐

```bash
# 의존성 설치
npm install

# TypeScript 컴파일 + 감시 모드
npx tsc --watch

# 또는 백그라운드에서 실행
npm run dev:ts
```

**자동으로 실행되는 것들**:
- ✅ tsc --watch가 TypeScript 파일 변경 감지
- ✅ 자동으로 JavaScript로 컴파일
- ✅ src-ts/ → dist/ 자동 변환
- ✅ 타입 체크 및 에러 검출

**실시간 개발 워크플로우**:
1. `src-ts/draggable/basic.ts` 수정
2. 저장 (Cmd+S / Ctrl+S)
3. 자동으로 `dist/draggable/basic.js` 생성
4. HTML 파일에서 dist/ 경로로 로드
5. 브라우저 새로고침으로 확인!

**파일 구조**:
- `src-ts/` - TypeScript 소스 (여기서 개발)
- `dist/` - 컴파일된 JavaScript (자동 생성, Git 무시)
- `examples/` - HTML 테스트 파일 (dist/ 참조)

## 옵션 파라미터

대부분의 함수는 다음과 같은 공통 옵션을 지원합니다:

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `duration` | number | 1 | 애니메이션 지속 시간 (초) |
| `delay` | number | 0 | 애니메이션 지연 시간 (초) |
| `ease` | string | "power2.out" | Easing 함수 |
| `stagger` | number | 0 | 여러 요소 순차 지연 (초) |

### 자주 사용하는 Easing

```javascript
"power1.out"    // 부드러운 감속
"power2.out"    // 중간 감속 (기본값)
"power3.out"    // 강한 감속
"back.out"      // 살짝 튕기는 효과
"elastic.out"   // 탄성 효과
"bounce.out"    // 바운스 효과
```

[GSAP Easing Visualizer](https://gsap.com/docs/v3/Eases)에서 더 많은 easing을 확인할 수 있습니다.

## 고급 사용법

### Timeline과 함께 사용

```javascript
const tl = gsap.timeline();

tl.add(fadeIn('.title'))
  .add(slideInLeft('.menu'), '-=0.5')  // 0.5초 전에 시작
  .add(fadeInUp('.content'));
```

### 애니메이션 제어

```javascript
// 애니메이션 인스턴스 저장
const anim = fadeIn('.box');

// 제어
anim.pause();
anim.play();
anim.reverse();
anim.kill();
```

### 콜백 함수

```javascript
fadeIn('.box', {
  duration: 1,
  onComplete: () => {
    console.log('애니메이션 완료!');
  },
  onStart: () => {
    console.log('애니메이션 시작!');
  }
});
```

## 커스터마이징

새로운 애니메이션 함수를 추가하려면:

1. `src-ts/animations/` 폴더에 새 .ts 파일 생성
2. TypeScript로 함수 작성 (타입 안전하게)
3. tsc --watch가 자동으로 dist/로 컴파일
4. HTML에서 컴파일된 파일 로드

```typescript
// src-ts/animations/custom.ts
/// <reference types="gsap" />

interface CustomOptions {
  duration?: number;
  ease?: string;
  customProp?: number;
}

function customAnimation(
  target: gsap.TweenTarget,
  options: CustomOptions = {}
): gsap.core.Tween {
  const defaults: CustomOptions = {
    duration: 1,
    ease: "power2.out"
  };

  const config = { ...defaults, ...options };

  return gsap.to(target, {
    // 애니메이션 속성
    ...config
  });
}
```

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 참고 자료

- [GSAP 공식 문서](https://gsap.com/docs/)
- [GSAP Draggable](https://gsap.com/docs/v3/Plugins/Draggable/)
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP Easing](https://gsap.com/docs/v3/Eases)

## 라이센스

MIT License

## 기여하기

이슈 및 PR을 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 로드맵

- [ ] 추가 드래그 함수 (충돌 감지, 드롭존 등)
- [ ] 더 많은 애니메이션 프리셋
- [ ] npm 패키지 배포
- [ ] 온라인 데모 사이트
- [ ] 더 많은 예제

## 스타 히스토리

[![Star History Chart](https://api.star-history.com/svg?repos=mineclover/gsap-kit&type=Date)](https://star-history.com/#mineclover/gsap-kit&Date)

---

**GSAP Kit** - 순수 JavaScript로 만드는 아름다운 인터랙션 ✨

Made with ❤️ by [mineclover](https://github.com/mineclover)
