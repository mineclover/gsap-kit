# TypeScript 개발 가이드

## 개요

GSAP Kit은 TypeScript로 개발하고 순수 JavaScript로 변환하여 사용할 수 있습니다.

## 폴더 구조

```
gsap-kit/
├── src-ts/                 # TypeScript 소스 (개발용)
│   ├── draggable/
│   │   ├── basic.ts
│   │   └── advanced.ts
│   ├── animations/
│   └── utils/
├── dist/                   # 컴파일된 JavaScript (자동 생성)
│   ├── draggable/
│   │   ├── basic.js
│   │   └── basic.d.ts
│   └── ...
└── src/                    # 수동 작성 JavaScript (현재 방식)
    └── draggable/
        └── basic.js
```

## 설치

```bash
# 의존성 설치
npm install

# 또는 yarn
yarn install
```

## 개발 워크플로우

### 1. TypeScript로 개발

```bash
# TypeScript 감시 모드 + 로컬 서버 실행
npm run dev:ts

# 또는 따로 실행
npm run build:watch  # TypeScript 감시
npm run serve        # 로컬 서버
```

### 2. 타입 체크만 실행

```bash
npm run type-check
```

### 3. 빌드 (JS 변환)

```bash
npm run build
```

## TypeScript 예제

### 기본 사용법

```typescript
// src-ts/draggable/basic.ts

interface DraggableOptions {
  type?: 'x' | 'y' | 'x,y' | 'rotation';
  inertia?: boolean;
  bounds?: Window | string | HTMLElement;
  onDrag?: (this: Draggable) => void;
}

function makeDraggable(
  target: string | HTMLElement,
  options: DraggableOptions = {}
): Draggable[] | null {
  // 구현...
}
```

### HTML에서 사용

TypeScript로 개발하더라도 최종 사용은 동일합니다:

```html
<!-- 컴파일된 JavaScript 사용 -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/Draggable.min.js"></script>

<!-- 컴파일된 파일 로드 -->
<script src="../dist/draggable/basic.js"></script>

<script>
  // 사용법은 동일
  makeDraggable('.box', {
    type: 'x,y',
    bounds: window
  });
</script>
```

## 타입 정의

### GSAP 타입

```typescript
/// <reference types="gsap" />

// GSAP 전역 타입 사용 가능
const tween: gsap.core.Tween = gsap.to('.box', { x: 100 });
const draggable: Draggable[] = Draggable.create('.box', { type: 'x,y' });
```

### 커스텀 타입

```typescript
type DragType = 'x' | 'y' | 'x,y' | 'rotation';

interface BoundsRect {
  top?: number;
  left?: number;
  width?: number;
  height?: number;
}

type BoundsType = Window | string | HTMLElement | BoundsRect;
```

## 장점

### 1. 타입 안전성

```typescript
// ✅ 올바른 사용
makeDraggable('.box', { type: 'x,y' });

// ❌ 컴파일 에러
makeDraggable('.box', { type: 'invalid' }); // Error!
```

### 2. IntelliSense

- IDE에서 자동완성
- 함수 시그니처 확인
- 매개변수 힌트

### 3. 리팩토링 안전성

- 타입 변경 시 모든 사용처 확인
- 실수 방지

### 4. 문서화

- JSDoc 자동 생성
- 타입이 곧 문서

## 빌드 출력

컴파일하면 다음 파일들이 생성됩니다:

```
dist/
├── draggable/
│   ├── basic.js        # 컴파일된 JavaScript
│   ├── basic.d.ts      # 타입 정의 파일
│   └── basic.js.map    # 소스맵
└── ...
```

## tsconfig.json 설정

```json
{
  "compilerOptions": {
    "target": "ES2020",           // 최신 브라우저 타겟
    "module": "ESNext",           // 모듈 시스템
    "lib": ["ES2020", "DOM"],     // 라이브러리
    "outDir": "./dist",           // 출력 디렉토리
    "rootDir": "./src-ts",        // 소스 디렉토리
    "strict": true,               // 엄격 모드
    "sourceMap": true,            // 소스맵 생성
    "declaration": true           // .d.ts 파일 생성
  }
}
```

## 권장 워크플로우

### 개발 시

1. **TypeScript로 작성** (`src-ts/`)
2. **자동 컴파일** (`npm run build:watch`)
3. **HTML에서 테스트** (dist 폴더의 JS 사용)

### 배포 시

1. **최종 빌드** (`npm run build`)
2. **dist 폴더 배포**
3. **타입 정의 포함** (.d.ts)

## 마이그레이션

기존 JS 파일을 TS로 마이그레이션:

### 1단계: 파일 복사

```bash
cp src/draggable/basic.js src-ts/draggable/basic.ts
```

### 2단계: 타입 추가

```typescript
// Before (JS)
function makeDraggable(target, options = {}) {
  // ...
}

// After (TS)
function makeDraggable(
  target: string | HTMLElement,
  options: DraggableOptions = {}
): Draggable[] | null {
  // ...
}
```

### 3단계: 인터페이스 정의

```typescript
interface DraggableOptions {
  type?: 'x' | 'y' | 'x,y' | 'rotation';
  inertia?: boolean;
  bounds?: BoundsType;
}
```

### 4단계: 컴파일 & 테스트

```bash
npm run build
# dist 폴더 확인
```

## 주의사항

### 1. HTML에서는 항상 dist 사용

```html
<!-- ❌ 잘못된 사용 -->
<script src="../src-ts/draggable/basic.ts"></script>

<!-- ✅ 올바른 사용 -->
<script src="../dist/draggable/basic.js"></script>
```

### 2. 타입만 체크하고 빌드 안 하기

```bash
# 타입 에러만 확인 (JS 생성 안 함)
npm run type-check
```

### 3. GSAP 타입 참조

```typescript
/// <reference types="gsap" />

// 또는
import type { Draggable } from 'gsap/Draggable';
```

## 예제 파일

`src-ts/draggable/basic.ts` 파일을 참고하세요!

## 문제 해결

### Q: 타입 에러가 나요

```bash
# GSAP 타입 설치
npm install --save-dev @types/gsap
```

### Q: 컴파일이 안 돼요

```bash
# tsconfig.json 확인
cat tsconfig.json

# TypeScript 재설치
npm install -D typescript
```

### Q: dist 폴더가 안 생겨요

```bash
# 수동 빌드
npm run build

# 출력 확인
ls -la dist/
```

## 결론

- ✅ **개발**: TypeScript (타입 안전성)
- ✅ **사용**: JavaScript (번들링 불필요)
- ✅ **베스트**: 둘 다 지원!
