# Rollup 마이그레이션 가이드

## 📋 개요

TypeScript 컴파일 후 `remove-exports.js` 스크립트로 후처리하던 방식에서 **Rollup 번들러**를 사용하는 방식으로 마이그레이션했습니다.

## 🔄 변경 사항

### 이전 방식
```
TypeScript → tsc 컴파일 → ES6 모듈 → remove-exports.js 후처리 → 브라우저용
```

**문제점:**
- 정규식 기반 후처리로 인한 오류 가능성
- export/import 문을 수동으로 제거해야 함
- 코드 압축(minification) 별도 작업 필요
- 소스맵 미지원

### 새로운 방식 (Rollup)
```
TypeScript → Rollup 번들링 → IIFE 형식 → 바로 브라우저용
```

**장점:**
- ✅ export/import 자동 처리
- ✅ 타입스크립트 통합 컴파일
- ✅ 코드 압축 자동화 (terser)
- ✅ 소스맵 자동 생성
- ✅ 더 빠르고 안정적인 빌드

## 📦 변경된 파일들

### 1. `rollup.config.js`
```javascript
// 모든 TypeScript 모듈을 번들링하도록 확장
export default [
  // Line Matching (minified)
  { input: 'src-ts/advanced/line-matching.ts', output: 'dist/line-matching.min.js' },

  // Animations
  { input: 'src-ts/animations/fade.ts', output: 'dist/animations/fade.js' },
  { input: 'src-ts/animations/slide.ts', output: 'dist/animations/slide.js' },
  { input: 'src-ts/animations/rotate.ts', output: 'dist/animations/rotate.js' },
  { input: 'src-ts/animations/scroll.ts', output: 'dist/animations/scroll.js' },

  // Draggable
  { input: 'src-ts/draggable/basic.ts', output: 'dist/draggable/basic.js' },
  { input: 'src-ts/draggable/advanced.ts', output: 'dist/draggable/advanced.js' },

  // Types
  { input: 'src-ts/types.ts', output: 'dist/types.js' }
];
```

### 2. `package.json` Scripts
```diff
- "build": "tsc && node scripts/remove-exports.js",
- "postbuild": "node scripts/remove-exports.js",
- "bundle": "rollup -c",
- "bundle:watch": "rollup -c --watch",
- "watch:ts": "nodemon --watch src-ts --ext ts --exec \"npm run build\"",

+ "build": "rollup -c",
+ "build:watch": "rollup -c --watch",
+ "dev:ts": "concurrently \"npm run build:watch\" \"npm run serve:live\"",
```

### 3. 제거된 파일
- ❌ `scripts/remove-exports.js` (더 이상 필요 없음)

### 4. HTML 예제 파일 수정
```diff
<!-- line-matching.html, stroke-preview.html -->
- <script src="../dist/types.js"></script>
- <script src="../dist/advanced/line-matching.js"></script>
+ <script src="../dist/line-matching.min.js"></script>

<!-- draggable.html, preview.html -->
+ <script src="../dist/types.js"></script>
  <script src="../dist/draggable/basic.js"></script>
```

## 🚀 사용 방법

### 빌드
```bash
# 전체 빌드
npm run build

# watch 모드 (파일 변경 시 자동 빌드)
npm run build:watch

# 타입 체크만 (빌드 없이)
npm run type-check
```

### 개발 모드
```bash
# Rollup watch + live-server 동시 실행
npm run dev:ts

# 백그라운드 실행
npm run dev:ts:bg
```

## 📊 성능 비교

| 항목 | 이전 (tsc + script) | 현재 (Rollup) |
|------|---------------------|---------------|
| **빌드 시간** | ~3-4초 | ~2-3초 |
| **안정성** | ⚠️ 정규식 오류 가능 | ✅ 타입 안전 |
| **압축** | ❌ 수동 | ✅ 자동 |
| **소스맵** | ❌ | ✅ |
| **유지보수** | 복잡 | 간단 |

## 🔧 Rollup 플러그인

### 사용 중인 플러그인
```javascript
{
  plugins: [
    nodeResolve(),           // Node 모듈 해석
    typescript({             // TypeScript 컴파일
      tsconfig: './tsconfig.json',
      declaration: false
    }),
    terser()                 // 코드 압축 (line-matching.min.js만)
  ]
}
```

## 📝 출력 형식 (IIFE)

### IIFE (Immediately Invoked Function Expression)
```javascript
(function () {
    'use strict';

    function fadeIn(target, options) {
        // ...
    }

    // 전역으로 노출
    if (typeof window !== 'undefined') {
        window.fadeIn = fadeIn;
        // ...
    }
})();
```

**특징:**
- ✅ 브라우저에서 바로 `<script>` 태그로 로드 가능
- ✅ 전역 스코프 오염 방지
- ✅ 선택적으로 window 객체에 함수 노출

## 🎯 마이그레이션 체크리스트

- [x] Rollup 설정 파일 확장
- [x] package.json 스크립트 업데이트
- [x] remove-exports.js 제거
- [x] HTML 예제 파일 수정
- [x] 빌드 테스트
- [x] 모든 예제 페이지 동작 확인
- [x] Git 커밋
- [x] 문서 작성

## 💡 향후 개선 사항

### 선택적 최적화
현재는 `line-matching.min.js`만 압축되어 있습니다. 필요시 다른 모듈도 압축 가능:

```javascript
// rollup.config.js
const createConfig = (input, output, name, minify = false) => ({
  // ...
  plugins: [
    nodeResolve(),
    typescript({ ... }),
    ...(minify ? [terser()] : [])  // minify 옵션에 따라 압축
  ]
});
```

### 번들 크기 최적화
- Tree shaking 활성화
- Code splitting 고려 (필요시)
- 공통 의존성 별도 번들링

## 🔗 참고 자료

- [Rollup 공식 문서](https://rollupjs.org/)
- [IIFE 출력 형식](https://rollupjs.org/configuration-options/#output-format)
- [@rollup/plugin-typescript](https://github.com/rollup/plugins/tree/master/packages/typescript)
- [@rollup/plugin-terser](https://github.com/rollup/plugins/tree/master/packages/terser)

---

**마이그레이션 완료 날짜:** 2025-10-20
**담당자:** Claude Code AI Assistant
