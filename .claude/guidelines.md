# GSAP Kit - Development Guidelines

## 🎯 프로젝트 목적

**이 프로젝트는 HTML 파일에서 직접 사용할 수 있는 JavaScript 파일을 생성하는 것이 목적입니다.**

- ❌ Node.js 서버 기반 애플리케이션이 **아닙니다**
- ❌ 웹 서버가 필요한 앱이 **아닙니다**
- ✅ `<script src="dist/xxx.js"></script>`로 로드할 수 있는 **브라우저용 JS 라이브러리**입니다
- ✅ TypeScript로 작성 → JavaScript로 컴파일 → HTML에서 바로 사용

## 🔧 빌드 시스템

### 개발 모드 (`npm run dev:ts`)
```bash
npm run dev:ts
```

이 명령어는 다음을 실행합니다:
1. **TypeScript 파일 감시**: `src-ts/` 폴더의 `.ts` 파일을 감시
2. **자동 컴파일**: 파일이 변경되면 자동으로 `dist/` 폴더에 `.js` 파일 생성

**최종 목적은 dist/ 폴더의 JavaScript 파일 생성입니다.**

### 프로덕션 빌드 (`npm run build`)
```bash
npm run build
```

이 명령어는:
1. TypeScript 컴파일 (`tsc`)
2. Export 구문 제거 (`scripts/remove-exports.js`)
3. `dist/` 폴더에 브라우저용 JavaScript 파일 생성

생성된 `dist/` 파일들은 어떤 HTML 파일에서든 `<script>` 태그로 로드할 수 있습니다.

## HTML 데모 페이지 작성 규칙

### 1. 스크립트 로딩 순서

HTML 데모 페이지를 작성할 때 다음 순서로 스크립트를 로드해야 합니다:

```html
<!-- 1. GSAP 라이브러리 (CDN) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>

<!-- 2. GSAP 플러그인 (필요한 경우) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/Draggable.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/ScrollTrigger.min.js"></script>

<!-- 3. GSAP Kit 타입 정의 -->
<script src="../dist/types.js"></script>

<!-- 4. GSAP Kit 모듈 (사용하는 모듈만) -->
<script src="../dist/draggable/basic.js"></script>
<script src="../dist/draggable/advanced.js"></script>
<script src="../dist/animations/fade.js"></script>
<!-- 등등 -->

<!-- 5. 데모 스크립트 -->
<script>
  // 여기서 GSAP Kit 함수 사용
</script>
```

### 2. 모듈별 경로

현재 프로젝트는 **개별 모듈 방식**으로 빌드되므로, 필요한 모듈만 선택적으로 로드하세요:

#### Draggable 모듈
```html
<script src="../dist/draggable/basic.js"></script>
<script src="../dist/draggable/advanced.js"></script>
```

#### Animation 모듈
```html
<script src="../dist/animations/fade.js"></script>
<script src="../dist/animations/slide.js"></script>
<script src="../dist/animations/rotate.js"></script>
<script src="../dist/animations/scroll.js"></script>
```

#### Advanced 모듈
```html
<script src="../dist/advanced/line-matching.js"></script>
```

#### Utils 모듈
```html
<script src="../dist/utils/helpers.js"></script>
```

### 3. 번들 파일 사용 (현재 미지원)

⚠️ **주의**: 현재 프로젝트는 통합 번들 파일(`gsap-kit.js`)을 생성하지 않습니다.

만약 통합 번들이 필요한 경우, 다음 중 하나를 선택하세요:

1. **Webpack/Rollup 설정** 추가
2. **개별 모듈 방식** 유지 (권장)

### 4. TypeScript 소스에서 export

모든 TypeScript 소스 파일은 함수를 `export`하고, 브라우저 환경에서는 `window` 객체에도 노출합니다:

```typescript
// TypeScript 소스
export function myFunction() { ... }

// 브라우저 전역으로 노출
if (typeof window !== 'undefined') {
  (window as any).myFunction = myFunction;
}
```

이렇게 하면 HTML에서 직접 함수를 호출할 수 있습니다:

```html
<script>
  // 전역 함수로 사용 가능
  const result = myFunction();
</script>
```

### 5. 데모 페이지 템플릿

새로운 데모 페이지를 만들 때 다음 템플릿을 사용하세요:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GSAP Kit - [기능명] Demo</title>
  <style>
    /* 스타일 */
  </style>
</head>
<body>
  <!-- HTML 구조 -->

  <!-- GSAP 라이브러리 -->
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
  <!-- 필요한 GSAP 플러그인 추가 -->

  <!-- GSAP Kit 모듈 -->
  <script src="../dist/types.js"></script>
  <!-- 사용할 모듈 추가 -->

  <script>
    // 데모 코드
  </script>
</body>
</html>
```

### 6. 파일 저장 위치

- **데모 HTML**: `examples/` 폴더
- **컴파일된 JS**: `dist/` 폴더 (자동 생성)
- **TypeScript 소스**: `src-ts/` 폴더

### 7. 개발 워크플로우

#### 개발 중 (`npm run dev:ts` 실행 상태)

1. **TypeScript 파일 수정** (`src-ts/` 폴더)
2. **자동 컴파일** → `dist/` 폴더에 JavaScript 생성
3. **HTML 파일에서 테스트** → 브라우저에서 HTML 파일 열어서 확인

#### 최종 배포

1. **빌드 실행**: `npm run build`
2. **dist/ 폴더 확인**: 브라우저용 JavaScript 파일 생성 완료
3. **HTML 파일에서 사용**:
   ```html
   <script src="path/to/dist/types.js"></script>
   <script src="path/to/dist/advanced/line-matching.js"></script>
   ```

#### 기타 명령어

```bash
# 타입 체크만 (컴파일 안 함)
npm run type-check

# 수동 빌드 (개발 모드 없이)
npm run build
```

**핵심:** 실제 목적은 `dist/` 폴더의 JavaScript 파일을 생성하여 **어떤 HTML에서든 사용 가능**하게 하는 것입니다.

### 8. 주의사항

1. **절대 통합 번들 파일(`gsap-kit.js`)을 참조하지 마세요** - 현재 존재하지 않습니다
2. **항상 `types.js`를 먼저 로드**하세요 - 다른 모듈이 이에 의존합니다
3. **GSAP CDN을 먼저 로드**하세요 - GSAP Kit이 GSAP에 의존합니다
4. **필요한 모듈만 로드**하세요 - 불필요한 로딩 방지

## 예시: line-matching.html

```html
<!-- GSAP & Draggable -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/Draggable.min.js"></script>

<!-- GSAP Kit Modules -->
<script src="../dist/types.js"></script>
<script src="../dist/advanced/line-matching.js"></script>

<script>
  const matchingInstance = createLineMatching({
    groupA: [...],
    groupB: [...],
    // 옵션
  });
</script>
```

이 가이드라인을 따르면 모든 데모 페이지가 올바르게 작동합니다! ✅

---

## 📚 프로젝트 가이드 문서

프로젝트의 상세한 가이드 문서는 다음 위치에서 확인하세요:

### 필수 문서
- **[CONVENTIONS.md](../CONVENTIONS.md)** - 개발 컨벤션 (Single Source of Truth)
  - 코딩 스타일, Git 규칙, 아키텍처 등 모든 개발 규칙
  - **유일한 공식 컨벤션 문서**

### 시스템 가이드
- **[ENTRY_POINTS_GUIDE.md](../ENTRY_POINTS_GUIDE.md)** - 다중 진입점 관리 가이드
  - CDN/Bundle/Pages 진입점 관리 방법
  - 진입점 추가/수정/삭제 절차

- **[AUTO_EXPANSION_GUIDE.md](../AUTO_EXPANSION_GUIDE.md)** - 자동 확장 시스템 가이드
  - 파일 추가 시 자동 진입점 등록 시스템
  - Override 설정 방법

- **[SINGLE_SOURCE_SYSTEM.md](../SINGLE_SOURCE_SYSTEM.md)** - 단일 원천 관리 시스템
  - 설정 파일 단일 원천 관리
  - 자동 검증 시스템

### 빌드 시스템
현재 프로젝트는 **자동 확장 시스템**을 사용합니다:
- `src/lib/` 폴더의 TypeScript 파일이 자동으로 진입점에 추가됨
- 수동 설정은 `build.config.js`의 `overrides`에서 가능
- 자세한 내용은 [AUTO_EXPANSION_GUIDE.md](../AUTO_EXPANSION_GUIDE.md) 참조

---

## 📌 핵심 요약

### 이 프로젝트는...

✅ **HTML에서 바로 사용할 수 있는 JavaScript 라이브러리를 만듭니다**
```html
<!-- 어디서든 이렇게 사용 가능 -->
<script src="dist/advanced/line-matching.js"></script>
<script>
  createLineMatching({ /* 옵션 */ });
</script>
```

✅ **npm run dev:ts는 개발 도구입니다**
- TypeScript 파일 감시 및 자동 컴파일
- **최종 목적은 dist/ 폴더 생성**

✅ **최종 결과물: dist/ 폴더의 JavaScript 파일**
- `dist/types.js` - 타입 정의
- `dist/draggable/*.js` - 드래그 모듈
- `dist/animations/*.js` - 애니메이션 모듈
- `dist/advanced/*.js` - 고급 기능 모듈
- `dist/utils/*.js` - 유틸리티 모듈

❌ **이것이 아닙니다**
- Node.js 서버 애플리케이션 ❌
- SPA (Single Page Application) ❌
- 웹 서버가 필요한 앱 ❌

### 개발 플로우

```
[TypeScript 작성]
    ↓
[npm run dev:ts 실행]
    ↓
[자동 컴파일 → dist/ 생성]
    ↓
[HTML 파일 열어서 테스트]
    ↓
[dist/ 파일 → HTML에서 사용]
```

### 배포 플로우

```
[npm run build 실행]
    ↓
[dist/ 폴더 생성 완료]
    ↓
[dist/ 파일을 프로젝트에 복사]
    ↓
[HTML에서 <script> 태그로 로드]
    ↓
[완료! 🎉]
```
