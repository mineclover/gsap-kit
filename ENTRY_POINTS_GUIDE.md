# 진입점 관리 가이드 (Entry Points Management Guide)

## 📌 개요

GSAP Kit은 **다중 진입점(Multiple Entry Points)** 시스템을 사용합니다. 이 가이드는 진입점을 안전하게 추가, 수정, 삭제하는 방법을 설명합니다.

## 🎯 진입점의 종류

GSAP Kit은 3가지 유형의 진입점을 관리합니다:

### 1. CDN 라이브러리 진입점 (16개)
`build.config.js`에 명시적으로 정의된 개별 라이브러리 파일들

```
src/lib/animations/fade.ts → dist/lib/animations/fade.js
src/lib/draggable/basic.ts → dist/lib/draggable/basic.js
src/lib/advanced/line-matching.ts → dist/lib/line-matching.min.js
... (총 16개)
```

**용도**: CDN 방식으로 `<script>` 태그로 개별 로드

### 2. 페이지 진입점 (9개)
`src/pages/**/main.ts` 패턴으로 자동 탐색

```
src/pages/basic/main.ts → dist/pages/basic/main.js
src/pages/line-matching/main.ts → dist/pages/line-matching/main.js
... (총 9개)
```

**용도**: 데모/테스트 페이지의 JavaScript 번들

### 3. Bundle 진입점 (1개)
`src/index.ts` - 모든 모듈을 하나로 번들링

```
src/index.ts → dist/main.esm.js, dist/main.umd.js
```

**용도**: NPM 패키지, `import` 문으로 사용

---

## 🛠️ 진입점 추가하기

### 1. CDN 라이브러리 추가

**단계:**

1. `src/lib/` 아래에 새 TypeScript 파일 생성
   ```typescript
   // src/lib/animations/bounce.ts
   export function bounceIn(target: string) {
     // 구현...
   }
   ```

2. `build.config.js`의 `cdnEntries` 배열에 추가
   ```javascript
   {
     input: 'src/lib/animations/bounce.ts',
     output: 'dist/lib/animations/bounce.js',
     name: null, // 또는 'bounceAnimations' (전역 함수명)
     minify: false, // true면 minified 출력
   }
   ```

3. Bundle 진입점에도 export 추가 (선택)
   ```typescript
   // src/index.ts
   export * from './lib/animations/bounce';
   ```

4. 검증 실행
   ```bash
   npm run validate:entries
   ```

### 2. 페이지 추가

**자동 탐색되므로 `build.config.js` 수정 불필요!**

1. 새 페이지 디렉토리 생성
   ```bash
   mkdir -p src/pages/my-demo
   ```

2. `main.ts`, `index.html`, `style.css` 생성
   ```
   src/pages/my-demo/
   ├── main.ts      # JavaScript 로직
   ├── index.html   # HTML 페이지
   └── style.css    # 스타일
   ```

3. 빌드 시 자동으로 `dist/pages/my-demo/`로 번들링

---

## ✅ 진입점 검증

### 자동 검증 (빌드 시)

빌드 전에 자동으로 검증이 실행됩니다:

```bash
npm run build        # prebuild 훅에서 자동 검증
npm run build:cdn    # 마찬가지
npm run build:bundle # 마찬가지
```

### 수동 검증

언제든지 수동으로 검증 가능:

```bash
npm run validate:entries
```

### 검증 항목

✅ `build.config.js`의 모든 `input` 파일이 실제 존재하는가?
✅ `src/lib`의 파일들이 `build.config.js`에 누락되지 않았는가?
✅ 중복 진입점이 없는가?
✅ `src/index.ts`의 export가 유효한가?
✅ 페이지 진입점이 올바른가?

---

## 🔍 검증 스크립트 출력 예시

### 성공 시

```
🔍 GSAP Kit - 진입점 검증 시작
============================================================

1. build.config.js 진입점 검증
✅ build.config.js에 정의된 진입점: 16개
✅ 실제 존재하는 파일: 16개

2. src/lib 파일 누락 검증
✅ 모든 src/lib 파일이 build.config.js에 등록되어 있습니다.

3. 중복 진입점 검증
✅ 중복된 진입점이 없습니다.

4. Bundle 진입점 (src/index.ts) 검증
✅ src/index.ts의 모든 export가 유효합니다.

5. 페이지 진입점 검증
✅ 자동 탐색된 페이지 진입점: 9개

6. 빌드 출력 디렉토리 검증
ℹ️  빌드 출력 디렉토리: 6개

📊 검증 결과 요약
CDN 진입점: 16개
페이지 진입점: 9개
Bundle 진입점: 1개 (src/index.ts)
총 진입점: 26개

✅ 모든 검증을 통과했습니다! 🎉
```

### 경고 시

```
2. src/lib 파일 누락 검증
⚠️  build.config.js에 등록되지 않은 src/lib 파일 (1개):
  - src/lib/utils/helpers.ts
ℹ️  👉 의도적으로 제외된 파일이라면 무시하세요.

⚠️  검증 완료 (경고 있음). 위의 경고를 확인해주세요.
```

### 에러 시

```
1. build.config.js 진입점 검증
❌ build.config.js에 정의되었지만 존재하지 않는 파일 (1개):
  - src/lib/animations/missing.ts

❌ 검증 실패! 위의 에러를 수정해주세요.
```

---

## 📋 진입점 목록 확인

### 1. CDN 라이브러리 진입점

현재 등록된 목록:

```javascript
// build.config.js
cdnEntries: [
  // Core System (2개)
  'src/lib/core/validator.ts',
  'src/lib/core/builder.ts',

  // Advanced Features (1개)
  'src/lib/advanced/line-matching.ts',

  // Animations (4개)
  'src/lib/animations/fade.ts',
  'src/lib/animations/slide.ts',
  'src/lib/animations/rotate.ts',
  'src/lib/animations/scroll.ts',

  // Draggable (2개)
  'src/lib/draggable/basic.ts',
  'src/lib/draggable/advanced.ts',

  // Types & Utilities (2개)
  'src/lib/types.ts',
  'src/lib/utils/helpers.ts',

  // Testing (5개)
  'src/lib/testing/mouse-simulator.ts',
  'src/lib/testing/path-visualizer.ts',
  'src/lib/testing/test-runner.ts',
  'src/lib/testing/reporter.ts',
  'src/lib/testing/index.ts',
]
```

### 2. 페이지 진입점

현재 페이지 목록 (자동 탐색):

```
- basic            (기본 애니메이션 데모)
- custom-cursor    (커스텀 커서 데모)
- draggable        (드래그 인터렉션 데모)
- interaction-test (자동화 테스트)
- line-matching    (선 연결 매칭 데모)
- preview          (미리보기)
- scroll           (스크롤 애니메이션)
- stroke-preview   (SVG 스트로크 프리뷰)
- test-viewer      (테스트 뷰어)
```

### 3. Bundle 진입점

```typescript
// src/index.ts
export * from './lib/advanced/line-matching';
export * from './lib/animations/fade';
export * from './lib/animations/rotate';
export * from './lib/animations/scroll';
export * from './lib/animations/slide';
export * from './lib/core';
export * from './lib/draggable/advanced';
export * from './lib/draggable/basic';
export * from './lib/testing';
export * from './lib/types';
export * from './lib/utils/helpers';
```

---

## 🚨 주의사항

### 1. `name` 필드 설정

CDN 모드에서 IIFE 번들의 경우 `name` 필드 필요:

```javascript
// ✅ Good: 전역 함수로 노출
{
  input: 'src/lib/advanced/line-matching.ts',
  name: 'createLineMatching',
}

// ⚠️ Warning: name 없으면 export에 접근 불가
{
  input: 'src/lib/animations/fade.ts',
  name: null,
}
```

**경험 법칙:**
- 단일 함수 export → `name` 지정 (예: `'createLineMatching'`)
- 여러 함수 export → `name: null` (개별 함수명으로 접근)

### 2. `index.ts` 파일 제외

`index.ts` 파일은 재export용이므로 CDN 진입점으로 등록 불필요:

```javascript
// ❌ Bad: index.ts는 중간 파일
{
  input: 'src/lib/animations/index.ts',
  output: 'dist/lib/animations/index.js',
}

// ✅ Good: 실제 구현 파일만 등록
{
  input: 'src/lib/animations/fade.ts',
  output: 'dist/lib/animations/fade.js',
}
```

### 3. 의존성 관리

진입점 간 의존성이 있다면 순서 고려:

```javascript
// ✅ Good: 의존성 먼저 로드
<script src="dist/lib/types.js"></script>
<script src="dist/lib/core/validator.js"></script>
<script src="dist/lib/core/builder.js"></script>
```

---

## 🔧 트러블슈팅

### 문제: 검증이 실패함

**해결:**
1. 에러 메시지 확인
2. 파일 경로가 정확한지 확인
3. 오타가 없는지 확인

```bash
# 모든 src/lib 파일 목록
find src/lib -type f -name "*.ts" | sort

# build.config.js와 비교
cat build.config.js | grep "input:"
```

### 문제: 빌드 후 파일이 없음

**해결:**
1. `build.config.js`의 `output` 경로 확인
2. 빌드 로그에서 에러 찾기

```bash
npm run build:cdn 2>&1 | tee build.log
```

### 문제: 페이지가 자동 탐색되지 않음

**해결:**
1. `src/pages/**/main.ts` 패턴에 맞는지 확인
2. 파일명이 정확히 `main.ts`인지 확인

```bash
# 페이지 진입점 찾기
find src/pages -name "main.ts"
```

---

## 📝 베스트 프랙티스

### 1. 진입점 추가 워크플로우

```bash
# 1. 파일 생성
touch src/lib/animations/bounce.ts

# 2. 코드 작성
# (에디터에서 작성)

# 3. build.config.js 업데이트
# (에디터에서 수정)

# 4. 검증
npm run validate:entries

# 5. src/index.ts에 export 추가 (Bundle용)
# export * from './lib/animations/bounce';

# 6. 빌드 테스트
npm run build:cdn
```

### 2. 정기 검증

Pull Request 전:

```bash
npm run validate:entries
npm run type-check
npm run build:all
```

### 3. CI/CD 통합

`.github/workflows/build.yml`:

```yaml
- name: Validate Entry Points
  run: npm run validate:entries

- name: Build
  run: npm run build:all
```

---

## 🎓 참고 자료

- [BUILD_SYSTEM_GUIDE.md](./BUILD_SYSTEM_GUIDE.md) - 이중 빌드 시스템 상세
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 프로젝트 구조
- [rollup.config.js](./rollup.config.js) - Rollup 설정
- [build.config.js](./build.config.js) - 빌드 설정

---

## 📊 통계 (현재)

| 항목 | 개수 |
|------|------|
| CDN 진입점 | 16개 |
| 페이지 진입점 | 9개 |
| Bundle 진입점 | 1개 |
| **총 진입점** | **26개** |

---

**진입점 관리의 핵심**:
- `build.config.js`가 **Single Source of Truth**
- 자동 검증으로 **동기화 보장**
- 명확한 **카테고리 분류**
