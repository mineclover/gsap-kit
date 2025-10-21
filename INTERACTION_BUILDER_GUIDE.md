# GSAP Kit 인터렉션 빌더 가이드

## 📖 프로젝트 개요

GSAP Kit은 **셀렉터 기반 인터렉션 빌더**로, DOM 조건을 만족하면 자동으로 인터렉션이 적용되는 시스템입니다.

### 핵심 목표
- 시각적으로 컨텐츠에 몰입도를 주는 인터렉션 제공
- 선행 조건(DOM 개수, 상위 요소 등)을 자동으로 체크
- 사전 정의된 인터렉션을 쉽게 재사용
- 셀렉터 기반으로 간단하게 적용

---

## 🏗️ 인터렉션 빌더 아키텍처

### 1. 인터렉션 타입 (현재 및 예정)

#### ✅ 구현 완료
- **Line Matching**: 점과 점을 선으로 잇는 매칭 게임
  - 드래그 앤 드롭 또는 클릭으로 연결
  - 정답/오답 체크
  - 다양한 선 스타일 (solid, dashed, arrow 등)

#### 🚧 구현 예정
- **Puzzle Drag & Drop**: 카드를 지정 DOM으로 드래그하면 달라붙는 퍼즐
  - Snap 기능 (자석처럼 달라붙기)
  - 정확한 위치 체크
  - 완성도 추적

- **Keyboard Control**: 키보드로 DOM 조작
  - 방향키로 이동
  - 스페이스바로 액션
  - 커스텀 키 바인딩

### 2. 인터렉션 클래스 구조

모든 인터렉션은 다음 패턴을 따릅니다:

```typescript
interface InteractionOptions {
  // 선택자 및 조건
  selector?: string;              // 대상 요소 선택자
  container?: string | HTMLElement; // 컨테이너

  // 검증 조건
  minElements?: number;           // 최소 요소 개수
  maxElements?: number;           // 최대 요소 개수
  requiredParent?: string;        // 필수 상위 요소

  // 스타일 옵션
  // (각 인터렉션마다 다름)

  // 콜백
  onInit?: () => void;
  onSuccess?: (...args: any[]) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

interface InteractionInstance {
  reset(): void;    // 인터렉션 초기화
  destroy(): void;  // 인터렉션 파괴 및 정리
  update?(): void;  // 동적 업데이트 (선택)
}
```

---

## 📁 파일 구조 컨벤션

### 1. 라이브러리 파일 구조

```
src/lib/
├── types.ts                  # 공통 타입 및 유틸리티
├── core/                     # (예정) 코어 시스템
│   ├── validator.ts          # DOM 조건 검증
│   ├── builder.ts            # 인터렉션 빌더 베이스
│   └── registry.ts           # 인터렉션 레지스트리
├── animations/               # 기본 애니메이션
│   ├── fade.ts
│   ├── slide.ts
│   └── ...
├── draggable/               # 드래그 인터렉션
│   ├── basic.ts
│   └── advanced.ts
└── advanced/                # 고급 인터렉션
    ├── line-matching.ts     # ✅ 구현 완료
    ├── puzzle.ts            # 🚧 예정
    └── keyboard-control.ts  # 🚧 예정
```

### 2. 새 인터렉션 추가 시 필수 파일

새 인터렉션 `foo`를 추가할 때:

```
src/lib/advanced/foo.ts       # 인터렉션 구현
src/lib/advanced/foo.md       # 사용 가이드 (선택)
src/pages/foo/                # 데모 페이지
├── index.html
├── style.css
└── main.ts
```

---

## 🎯 개발 컨벤션

### 1. 네이밍 컨벤션

#### 함수명
- **생성 함수**: `create[InteractionName]()`
  - 예: `createLineMatching()`, `createPuzzle()`
- **검증 함수**: `validate[Thing]()`
  - 예: `validateTarget()`, `validateElements()`
- **헬퍼 함수**: 동사로 시작
  - 예: `getPointCenter()`, `updateLineSvg()`

#### 타입명
- **옵션 인터페이스**: `[InteractionName]Options`
  - 예: `LineMatchingOptions`, `PuzzleOptions`
- **인스턴스 클래스**: `[InteractionName]Instance`
  - 예: `LineMatchingInstance`, `PuzzleInstance`
- **데이터 인터페이스**: 명사형
  - 예: `Point`, `Connection`, `MatchItem`

#### CSS 클래스명
- **BEM 스타일**: `[interaction]-[element]--[modifier]`
  - 예: `.line-matching-point`, `.line-matching-svg`
  - 예: `.puzzle-card--dragging`, `.keyboard-control-target--active`

### 2. 코드 스타일

#### TypeScript
```typescript
// ✅ Good: 타입 명시, JSDoc 주석
/**
 * 포인트 중심 좌표 가져오기
 */
private getPointCenter(pointDiv: HTMLElement): { x: number; y: number } {
  const rect = pointDiv.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

// ❌ Bad: 타입 미명시, 주석 없음
private getPointCenter(pointDiv) {
  const rect = pointDiv.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
```

#### 옵션 기본값 처리
```typescript
// ✅ Good: 명시적 기본값 설정
this.options = {
  pointSize: options.pointSize || 12,
  pointColor: options.pointColor || '#667eea',
  lineWidth: options.lineWidth || 2,
  // ...
};

// ✅ Better: 타입 안전성
this.options = {
  pointSize: options.pointSize ?? 12,  // 0도 유효한 값으로 처리
  // ...
} as Required<InteractionOptions>;
```

### 3. 에러 처리 및 디버깅

```typescript
// ✅ Good: 명확한 에러 메시지
if (elements.length === 0) {
  console.error(`[GSAP Kit] 아이템 "${id}": 선택자 "${selector}"에 해당하는 요소를 찾을 수 없습니다.`);
  return;
}

// ✅ Good: 디버그 로그 활용
import { debug } from '../types';
debug(`포인트 생성: ${id} at (${position.x}, ${position.y})`);
```

### 4. 브라우저 호환성

```typescript
// ✅ Good: 전역 노출 (CDN 사용 시)
if (typeof window !== 'undefined') {
  (window as any).createLineMatching = createLineMatching;
}

// ✅ Good: GSAP 타입 참조
/// <reference types="gsap" />
```

---

## 🧪 테스트 및 프리뷰 컨벤션

### 1. 데모 페이지 구조

각 인터렉션은 독립적인 데모 페이지를 가져야 합니다.

```
src/pages/[interaction-name]/
├── index.html      # 데모 HTML
├── style.css       # 데모 스타일
└── main.ts         # 데모 로직
```

### 2. 데모 페이지 필수 요소

#### index.html
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>[인터렉션명] - GSAP Kit</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <div class="container">
    <h1>[인터렉션명] 데모</h1>
    <p class="description">간단한 설명...</p>

    <!-- 인터렉션 데모 영역 -->
    <div id="demo-area">
      <!-- 예제 요소들 -->
    </div>

    <!-- 컨트롤 -->
    <div class="controls">
      <button onclick="resetGame()">리셋</button>
    </div>

    <!-- 상태 표시 -->
    <div class="status">
      <p>정답: <span id="correct-count">0</span></p>
      <p>오답: <span id="incorrect-count">0</span></p>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
  <script src="./main.js"></script>
</body>
</html>
```

#### main.ts
```typescript
import { create[InteractionName] } from '../../lib/advanced/[interaction-name]';

let instance: ReturnType<typeof create[InteractionName]> | null = null;

function init(): void {
  instance = create[InteractionName]({
    // 옵션 설정
    onSuccess: () => {
      console.log('성공!');
    },
    onError: (error) => {
      console.error('에러:', error);
    },
  });
}

function reset(): void {
  if (instance) {
    instance.reset();
  }
}

window.addEventListener('load', () => {
  init();
});

(window as any).resetGame = reset;
```

### 3. 빌드 및 실행

```bash
# 개발 모드 (자동 빌드 + 라이브 리로드)
npm run dev:[interaction-name]

# 예시
npm run dev:line-matching
npm run dev:puzzle
```

---

## 📚 문서화 컨벤션

### 1. JSDoc 주석

모든 public 함수와 인터페이스는 JSDoc을 작성합니다.

```typescript
/**
 * 선 연결 매칭 게임 생성
 *
 * @public
 * @param {LineMatchingOptions} options - 매칭 게임 설정 옵션
 * @returns {LineMatchingInstance} 매칭 인스턴스 (reset, destroy 메서드 제공)
 *
 * @example
 * ```typescript
 * const matching = createLineMatching({
 *   items: {
 *     'a': { selector: '.point-a' },
 *     'b': { selector: '.point-b' }
 *   },
 *   pairs: { 'a': 'b' }
 * });
 * ```
 */
export function createLineMatching(options: LineMatchingOptions): LineMatchingInstance {
  return new LineMatchingInstance(options);
}
```

### 2. README 및 가이드 문서

각 인터렉션은 선택적으로 별도의 `.md` 파일을 가질 수 있습니다.

```
src/lib/draggable/basic.md
src/lib/draggable/advanced.md
```

내용:
- 기본 사용법
- 옵션 설명
- 예제 코드
- 주의사항

---

## 🔧 인터렉션 개발 체크리스트

새 인터렉션을 개발할 때 다음을 확인하세요:

### 코드
- [ ] TypeScript로 작성 (`src/lib/[category]/[name].ts`)
- [ ] 타입 정의 (`[Name]Options`, `[Name]Instance`)
- [ ] 생성 함수 (`create[Name]()`)
- [ ] 인스턴스 메서드 (`reset()`, `destroy()`)
- [ ] 전역 노출 (브라우저 환경)
- [ ] JSDoc 주석 작성
- [ ] 에러 처리 및 디버그 로그

### 데모
- [ ] 데모 페이지 생성 (`src/pages/[name]/`)
- [ ] `index.html` 작성
- [ ] `style.css` 작성
- [ ] `main.ts` 작성
- [ ] `package.json`에 dev 스크립트 추가
- [ ] `scripts/generate-index.js`에 메타데이터 추가

### 빌드 & 테스트
- [ ] `npm run build` 성공
- [ ] `npm run dev:[name]` 실행 확인
- [ ] 브라우저에서 동작 확인
- [ ] 리셋 기능 테스트
- [ ] 에러 케이스 테스트

### 문서화
- [ ] 옵션 설명 (JSDoc)
- [ ] 사용 예제 (JSDoc)
- [ ] (선택) 별도 가이드 문서 (`.md`)

---

## 🎨 디자인 가이드라인

### 색상 팔레트

인터렉션에서 사용하는 기본 색상:

```css
/* Primary */
--primary-color: #667eea;
--primary-hover: #764ba2;

/* Feedback */
--success-color: #4CAF50;
--error-color: #F44336;
--warning-color: #FF9800;

/* Neutral */
--gray-light: #999;
--gray-dark: #333;
```

### 애니메이션 타이밍

```css
/* 빠른 피드백 */
--duration-fast: 0.15s;

/* 일반 전환 */
--duration-normal: 0.3s;

/* 느린 효과 */
--duration-slow: 0.5s;
```

---

## 🚀 향후 개선 계획

### Phase 1: 코어 시스템 (다음 단계)
- [ ] `Validator` 클래스: DOM 조건 자동 검증
- [ ] `InteractionBuilder` 베이스 클래스: 공통 로직 추출
- [ ] `Registry` 시스템: 인터렉션 등록 및 자동 감지

### Phase 2: 자동화
- [ ] 데이터 속성 기반 자동 초기화
  ```html
  <div data-interaction="line-matching"
       data-pairs='{"a":"b"}'></div>
  ```
- [ ] 조건부 활성화
  ```typescript
  autoInit({
    selector: '[data-interaction]',
    validateBefore: true
  });
  ```

### Phase 3: 새 인터렉션
- [ ] Puzzle Drag & Drop
- [ ] Keyboard Control
- [ ] Timeline Scrubber
- [ ] Card Flip Memory Game

---

## 📖 참고 자료

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 전체 프로젝트 구조
- [Line Matching 소스](./src/lib/advanced/line-matching.ts) - 참고 구현
- [GSAP 공식 문서](https://greensock.com/docs/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
