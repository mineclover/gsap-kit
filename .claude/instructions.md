# GSAP Kit - 프로젝트 지침

## 프로젝트 목적

**선택자로 쉽게 제어 가능한 GSAP 인터랙션 라이브러리**

순수 JavaScript/TypeScript와 GSAP CDN을 활용하여, HTML 선택자만으로 쉽게 드래그 & 애니메이션을 구현할 수 있는 재사용 가능한 함수 라이브러리를 제공합니다.

## 프로젝트 구조

```
gsap-kit/
├── src-ts/                 # TypeScript 소스 코드 (개발 영역)
│   ├── draggable/          # 드래그 & 인터랙션 함수
│   │   ├── basic.ts        # 기본 드래그 함수들
│   │   ├── basic.md        # basic.ts 스펙 정의
│   │   ├── advanced.ts     # 고급 드래그 함수들
│   │   ├── advanced.md     # advanced.ts 스펙 정의
│   │   └── index.ts
│   ├── animations/         # 애니메이션 함수
│   │   ├── fade.ts
│   │   ├── fade.md         # fade.ts 스펙 정의
│   │   ├── slide.ts
│   │   ├── slide.md
│   │   └── ...
│   └── utils/
│       ├── helpers.ts
│       └── helpers.md
├── dist/                   # 컴파일된 JavaScript (자동 생성, Git 무시)
│   ├── draggable/
│   ├── animations/
│   └── utils/
├── examples/               # 테스트용 HTML 파일
│   ├── draggable.html      # 드래그 기능 테스트
│   ├── basic.html          # 기본 애니메이션 테스트
│   └── preview.html        # 통합 미리보기
└── tsconfig.json
```

## 스크립트 분류

### 1. 기본 기능 테스트 스크립트
- **위치**: `examples/` 디렉토리
- **목적**: 구현된 함수들의 동작을 확인하고 테스트
- **특징**:
  - 각 함수의 기본 사용법 시연
  - 옵션 파라미터 테스트
  - 시각적 피드백 제공

**예시**: `examples/draggable.html`
```html
<div class="box">드래그 테스트</div>
<script src="../dist/draggable/basic.js"></script>
<script>
  // 기본 기능 테스트
  makeDraggable('.box');
</script>
```

### 2. 목적에 부합하게 구현하는 스크립트
- **위치**: `src-ts/` 디렉토리
- **목적**: 선택자 기반의 쉬운 제어를 제공하는 재사용 가능한 함수
- **특징**:
  - TypeScript로 작성 (타입 안전성)
  - 직관적인 함수명과 옵션
  - 일관된 API 디자인
  - 상세한 JSDoc/TSDoc 주석

**예시**: `src-ts/draggable/basic.ts`
```typescript
/**
 * 요소를 자유롭게 드래그 가능하게 만듭니다
 * @param target - CSS 선택자 또는 DOM 요소
 * @param options - 드래그 옵션
 */
function makeDraggable(
  target: string | HTMLElement,
  options?: DraggableOptions
): Draggable[]
```

## 스펙 문서 관리

### 규칙
각 TypeScript 파일과 **같은 위치, 같은 이름**으로 `.md` 파일을 생성하여 스펙을 정의합니다.

### 스펙 문서 구조

```markdown
# [파일명] 스펙 정의

## 개요
이 모듈의 목적과 역할

## 함수 목록

### functionName()
**목적**: 함수가 해결하는 문제

**사용 예시**:
\`\`\`javascript
functionName('.selector', {
  option1: value1,
  option2: value2
});
\`\`\`

**파라미터**:
- `target` (string | HTMLElement): 대상 요소
- `options` (object): 옵션 객체
  - `option1` (type): 설명
  - `option2` (type): 설명

**반환값**: 반환 타입 및 의미

**동작 방식**:
1. 단계별 설명
2. 주요 로직
3. 예외 처리

**관련 함수**: 연관된 다른 함수들

## 타입 정의

\`\`\`typescript
interface OptionsInterface {
  // ...
}
\`\`\`

## 변경 이력
- YYYY-MM-DD: 초기 작성
- YYYY-MM-DD: 기능 추가/수정
```

### 예시 파일 구조

```
src-ts/draggable/
├── basic.ts              # 구현 코드
├── basic.md              # 스펙 정의
│   ├── makeDraggable() 스펙
│   ├── makeDraggableX() 스펙
│   └── ...
├── advanced.ts           # 구현 코드
└── advanced.md           # 스펙 정의
    ├── makeDraggableSnap() 스펙
    ├── makeSlider() 스펙
    └── ...
```

## 개발 워크플로우

### 1. TypeScript 개발 환경

```bash
# tsc --watch 실행 (백그라운드)
npx tsc --watch
```

**실시간 컴파일**:
1. `src-ts/` 파일 수정
2. 저장 (Cmd+S / Ctrl+S)
3. 자동으로 `dist/` 컴파일 ✅
4. 타입 체크 및 에러 표시

### 2. 새 기능 추가 프로세스

1. **스펙 정의 작성**
   - `src-ts/[module]/[name].md` 생성
   - 함수 목적, 파라미터, 반환값, 동작 방식 명시

2. **TypeScript 구현**
   - `src-ts/[module]/[name].ts` 작성
   - 인터페이스 정의
   - 함수 구현
   - TSDoc 주석 작성

3. **컴파일 확인**
   - tsc --watch가 에러 없이 컴파일되는지 확인
   - `dist/` 폴더에 JavaScript 생성 확인

4. **테스트 HTML 작성**
   - `examples/[name].html` 생성
   - 다양한 옵션으로 함수 테스트
   - 시각적 피드백 확인

5. **문서 업데이트**
   - README.md의 함수 목록에 추가
   - 사용 예시 추가

### 3. 코드 스타일

**TypeScript 규칙**:
- 모든 함수는 타입 정의 필수
- 옵션 객체는 인터페이스로 정의
- 기본값은 defaults 객체로 관리
- `/// <reference types="gsap" />` 추가

**네이밍 규칙**:
- 함수: camelCase (예: `makeDraggable`)
- 인터페이스: PascalCase (예: `DraggableOptions`)
- 파일: kebab-case 또는 camelCase (예: `basic.ts`)

**주석 규칙**:
```typescript
/**
 * 함수 설명
 * @param target - 파라미터 설명
 * @param options - 옵션 설명
 * @returns 반환값 설명
 */
```

## 테스트 가이드

### HTML 테스트 파일 구조

```html
<!DOCTYPE html>
<html>
<head>
  <title>기능 테스트</title>
  <style>
    /* 테스트를 위한 스타일 */
  </style>
</head>
<body>
  <h1>기능 테스트</h1>

  <!-- 테스트 요소 -->
  <div class="test-element">테스트</div>

  <!-- GSAP CDN -->
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/Draggable.min.js"></script>

  <!-- 함수 파일 -->
  <script src="../dist/draggable/basic.js"></script>

  <!-- 테스트 스크립트 -->
  <script>
    // 기본 사용
    makeDraggable('.test-element');

    // 옵션과 함께
    makeDraggable('.test-element', {
      type: 'x,y',
      bounds: window
    });
  </script>
</body>
</html>
```

## 중요 원칙

1. **선택자 우선**: 모든 함수는 CSS 선택자를 첫 번째 인자로 받을 수 있어야 함
2. **옵션 객체**: 두 번째 인자는 항상 옵션 객체 (선택적)
3. **기본값 제공**: 옵션 없이도 동작해야 함
4. **일관된 API**: 비슷한 기능은 비슷한 API 구조 유지
5. **타입 안전성**: TypeScript의 타입 시스템을 최대한 활용
6. **문서화**: 코드만큼 문서도 중요 (스펙 .md 파일 필수)

## Git 관리

### Git 무시 대상
- `dist/` - 자동 생성되는 컴파일 결과물
- `node_modules/` - npm 의존성

### 버전 관리 대상
- `src-ts/` - TypeScript 소스 코드
- `src-ts/**/*.md` - 스펙 정의 문서
- `examples/` - 테스트 HTML 파일
- `tsconfig.json` - TypeScript 설정
- `package.json` - 프로젝트 설정

## 자주 사용하는 명령어

```bash
# TypeScript 컴파일 (watch 모드)
npx tsc --watch

# 타입 체크만 (컴파일 없이)
npm run type-check

# 빌드 (일회성)
npm run build
```

## 문의 및 기여

이슈 및 PR 환영합니다!
