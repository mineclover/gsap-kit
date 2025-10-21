# GSAP Kit 빌드 시스템 가이드

## 🎭 이중 빌드 모드의 이유

GSAP Kit은 **두 가지 사용 방식**을 모두 지원하는 특별한 빌드 시스템을 가지고 있습니다:

### 1️⃣ CDN 모드 (교육/데모용)
```html
<!-- GSAP CDN 로드 -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
<!-- 기능별 개별 스크립트 -->
<script src="./line-matching.min.js"></script>
<script>
  // 전역 함수로 바로 사용
  const matching = createLineMatching({ ... });
</script>
```

**용도:**
- 빠른 프로토타이핑
- 교육용 예제
- 데모 페이지
- 코드펜, JSFiddle 등

**장점:**
- 설치 없이 바로 시작
- CDN 캐싱 활용
- 간단한 HTML 파일로 동작

### 2️⃣ Bundle 모드 (프로덕션/NPM용)
```javascript
// NPM 설치
npm install gsap-kit gsap

// ESM import
import { createLineMatching } from 'gsap-kit';
// 또는 UMD require
const { createLineMatching } = require('gsap-kit');

const matching = createLineMatching({ ... });
```

**용도:**
- 프로덕션 애플리케이션
- React, Vue, Svelte 등 프레임워크
- 번들러 환경 (Webpack, Vite, Rollup)
- TypeScript 프로젝트

**장점:**
- 트리 쉐이킹
- 타입 정의 제공
- 모던 빌드 파이프라인 통합

---

## 📦 빌드 모드 비교

| 특징 | CDN 모드 | Bundle 모드 |
|------|----------|-------------|
| **빌드 명령** | `BUILD_MODE=cdn` | `BUILD_MODE=bundle` |
| **출력 포맷** | IIFE (즉시 실행) | ESM + UMD |
| **GSAP 처리** | External (CDN 사용) | External (peerDependency) |
| **파일 구조** | 기능별 개별 파일 | 단일 main.js |
| **타입 정의** | ❌ | ✅ (.d.ts 생성) |
| **전역 노출** | ✅ (window 객체) | ❌ (import만) |
| **용도** | 데모/교육/빠른 테스트 | 프로덕션 앱 통합 |
| **번들 크기** | 작음 (기능별 분리) | 중간 (트리쉐이킹 가능) |

---

## 🔧 빌드 명령어

### 기본 빌드
```bash
# CDN 모드 빌드 (기본값)
npm run build
# 또는 명시적으로
npm run build:cdn

# Bundle 모드 빌드
npm run build:bundle

# 두 모드 모두 빌드
npm run build:all
```

### 개발 모드
```bash
# CDN 모드 + 소스맵 + watch
npm run build:dev

# 페이지별 개발 서버
npm run dev:line-matching
npm run dev:draggable
```

### 프로덕션 모드
```bash
# 최적화된 프로덕션 빌드
npm run build:prod
```

---

## 📂 빌드 출력 구조

### CDN 모드 출력
```
dist/
├── lib/                          # 개별 라이브러리 파일
│   ├── line-matching.min.js      # IIFE, 전역 함수 노출
│   ├── animations/
│   │   ├── fade.js
│   │   ├── slide.js
│   │   └── ...
│   └── draggable/
│       ├── basic.js
│       └── advanced.js
│
└── pages/                        # 페이지별 번들
    ├── line-matching/
    │   ├── index.html
    │   ├── style.css
    │   └── main.js               # IIFE, 페이지 로직
    └── ...
```

**CDN 모드 특징:**
- 각 파일은 독립적으로 사용 가능
- GSAP은 `<script>` CDN으로 로드 필요
- `window` 객체에 함수 자동 노출

### Bundle 모드 출력
```
dist/
├── main.esm.js                   # ESM 번들
├── main.esm.js.map               # 소스맵
├── main.umd.js                   # UMD 번들
├── main.umd.min.js               # UMD minified
├── index.d.ts                    # 타입 정의
├── index.d.ts.map
└── [각 모듈].d.ts                # 개별 타입 정의
```

**Bundle 모드 특징:**
- ESM: `import` 문 사용
- UMD: `require()` 또는 `<script>` 태그 모두 지원
- TypeScript 타입 정의 포함
- GSAP은 peerDependency로 별도 설치 필요

---

## ⚙️ Rollup 설정 상세

### 공통 설정 (두 모드 공통)

```javascript
// rollup.config.js
external: ['gsap']  // GSAP은 항상 external
```

**이유:**
1. GSAP은 유료 플러그인 포함 (GreenSock 라이선스)
2. 사용자가 원하는 버전 선택 가능
3. CDN 캐싱 활용 (CDN 모드)
4. 중복 번들링 방지 (Bundle 모드)

### CDN 모드 설정

```javascript
{
  format: 'iife',                    // 즉시 실행 함수
  name: 'createLineMatching',        // 전역 함수명
  globals: {
    gsap: 'gsap'                     // window.gsap 사용
  }
}
```

### Bundle 모드 설정

```javascript
// ESM
{
  format: 'esm',
  generateTypes: true                // .d.ts 생성
}

// UMD
{
  format: 'umd',
  name: 'GSAPKit',                   // window.GSAPKit
  globals: {
    gsap: 'gsap'
  }
}
```

---

## 🛠️ build.config.js 관리

새로운 인터렉션을 추가할 때는 `build.config.js`를 업데이트하세요.

### Core 모듈 추가 예시

```javascript
// build.config.js
export const buildConfig = {
  cdnEntries: [
    // Core System (새로 추가)
    {
      input: 'src/lib/core/validator.ts',
      output: 'dist/lib/core/validator.js',
      name: 'DOMValidator',
    },
    {
      input: 'src/lib/core/builder.ts',
      output: 'dist/lib/core/builder.js',
      name: 'InteractionBuilder',
    },

    // Advanced Features
    {
      input: 'src/lib/advanced/line-matching.ts',
      output: 'dist/lib/line-matching.min.js',
      name: 'createLineMatching',
      minify: true,
    },

    // ... 기존 항목들
  ],

  bundleEntry: {
    input: 'src/index.ts',           // 모든 모듈 export
    output: 'dist/main.js',
    name: 'GSAPKit',
  },
};
```

---

## 📝 src/index.ts (Bundle 진입점)

Bundle 모드에서 export할 모든 함수를 정의합니다:

```typescript
// src/index.ts
export * from './lib/core';
export * from './lib/advanced/line-matching';
export * from './lib/animations';
export * from './lib/draggable';
export * from './lib/types';
```

---

## 🎯 사용 시나리오별 가이드

### 시나리오 1: 빠른 프로토타입 (CDN)

```bash
# 빌드
npm run build:cdn
```

```html
<!DOCTYPE html>
<html>
<head>
  <title>빠른 데모</title>
</head>
<body>
  <div id="item-1">사과</div>
  <div id="item-2">Apple</div>

  <!-- GSAP CDN -->
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
  <!-- Line Matching -->
  <script src="dist/lib/line-matching.min.js"></script>

  <script>
    // 전역 함수 사용
    createLineMatching({
      items: {
        'a': { selector: '#item-1' },
        'b': { selector: '#item-2' }
      },
      pairs: { 'a': 'b' }
    });
  </script>
</body>
</html>
```

### 시나리오 2: React 앱에 통합 (Bundle)

```bash
# NPM 설치
npm install gsap-kit gsap
```

```typescript
// App.tsx
import { useEffect } from 'react';
import { createLineMatching } from 'gsap-kit';
import type { LineMatchingOptions } from 'gsap-kit';

export default function MatchingGame() {
  useEffect(() => {
    const options: LineMatchingOptions = {
      items: {
        'a': { selector: '#item-1' },
        'b': { selector: '#item-2' }
      },
      pairs: { 'a': 'b' }
    };

    const instance = createLineMatching(options);

    return () => {
      instance.destroy();
    };
  }, []);

  return (
    <div>
      <div id="item-1">사과</div>
      <div id="item-2">Apple</div>
    </div>
  );
}
```

### 시나리오 3: 교육용 코드펜 (CDN)

```html
<!-- CodePen 또는 JSFiddle -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
<script src="https://unpkg.com/gsap-kit/dist/lib/line-matching.min.js"></script>

<script>
  // 즉시 사용 가능
  createLineMatching({ ... });
</script>
```

---

## 🚨 주의사항

### 1. GSAP은 항상 별도 설치/로드

#### CDN 모드
```html
<!-- ⚠️ 반드시 GSAP을 먼저 로드 -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
<script src="dist/lib/line-matching.min.js"></script>
```

#### Bundle 모드
```bash
# ⚠️ GSAP을 peerDependency로 설치
npm install gsap gsap-kit
```

### 2. CDN 모드에서 전역 충돌 방지

```javascript
// ❌ Bad: 전역 변수 오염
var createLineMatching = function() { ... };

// ✅ Good: IIFE로 격리
(function() {
  const matching = createLineMatching({ ... });
})();
```

### 3. Bundle 모드에서 트리 쉐이킹

```javascript
// ✅ Good: 필요한 것만 import
import { createLineMatching } from 'gsap-kit';

// ❌ Bad: 전체 import
import * as GSAPKit from 'gsap-kit';
const { createLineMatching } = GSAPKit;
```

---

## 🔄 빌드 워크플로우

### 개발 중
```bash
# 1. CDN 모드로 데모 페이지 개발
npm run dev:line-matching

# 2. 파일 저장 시 자동 빌드 + 리로드
# (watch 모드 활성화)
```

### 릴리스 전
```bash
# 1. 타입 체크
npm run type-check

# 2. 린트 & 포맷
npm run check:write

# 3. 두 모드 모두 빌드
npm run build:all

# 4. 결과 확인
ls -lh dist/
```

### NPM 배포 시
```bash
# package.json exports 확인
{
  "main": "dist/main.umd.js",       # CommonJS
  "module": "dist/main.esm.js",     # ESM
  "types": "dist/index.d.ts",       # TypeScript
  "exports": {
    ".": {
      "import": "./dist/main.esm.js",
      "require": "./dist/main.umd.js"
    }
  }
}

# 배포
npm publish
```

---

## 🎓 교육적 가치

이 이중 빌드 시스템은 다음을 배울 수 있습니다:

1. **모듈 시스템의 차이**
   - IIFE vs ESM vs UMD
   - 전역 변수 vs import/export

2. **빌드 도구 이해**
   - Rollup 설정
   - 환경 변수 활용
   - 플러그인 체인

3. **패키지 배포 전략**
   - CDN vs NPM
   - peerDependencies
   - exports 필드

4. **최적화 기법**
   - 트리 쉐이킹
   - 코드 분할
   - 소스맵

---

## 📚 참고 자료

- [Rollup 공식 문서](https://rollupjs.org/)
- [GSAP 설치 가이드](https://greensock.com/docs/v3/Installation)
- [UMD 패턴](https://github.com/umdjs/umd)
- [package.json exports](https://nodejs.org/api/packages.html#exports)

---

## 🎉 요약

**GSAP Kit은 두 가지 세계를 모두 지원합니다:**

- 🚀 **CDN 모드**: 빠른 시작, 교육, 데모
- 📦 **Bundle 모드**: 프로덕션, NPM, TypeScript

이 유연성 덕분에:
- 초보자는 쉽게 시작
- 전문가는 프로덕션에 통합
- 교육자는 예제 공유
- 개발자는 타입 안전성 확보

모두가 행복한 빌드 시스템! 🎊
