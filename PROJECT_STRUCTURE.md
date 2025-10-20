# GSAP Kit 프로젝트 구조 가이드

## 📁 폴더 구조 (2025년 10월 개편)

페이지 중심 개발 방식으로 전환되었습니다. 이제 각 페이지는 독립적인 폴더에서 HTML, CSS, TypeScript를 함께 관리합니다.

```
gsap-kit/
├── src/                    # 소스 코드
│   ├── lib/               # 공통 라이브러리 (재사용 가능한 함수들)
│   │   ├── animations/    # 애니메이션 함수
│   │   │   ├── fade.ts
│   │   │   ├── slide.ts
│   │   │   ├── rotate.ts
│   │   │   └── scroll.ts
│   │   ├── draggable/    # 드래그 & 인터랙션
│   │   │   ├── basic.ts
│   │   │   └── advanced.ts
│   │   ├── advanced/     # 고급 기능
│   │   │   └── line-matching.ts
│   │   └── types.ts      # 공통 타입 정의
│   │
│   └── pages/            # 페이지별 소스
│       ├── basic/        # 기본 애니메이션 예제
│       │   ├── index.html
│       │   ├── style.css
│       │   └── main.ts
│       ├── draggable/    # 드래그 예제
│       │   ├── index.html
│       │   ├── style.css
│       │   └── main.ts
│       ├── scroll/       # 스크롤 애니메이션 예제
│       │   ├── index.html
│       │   ├── style.css
│       │   └── main.ts
│       ├── line-matching/     # 선 연결 매칭 게임
│       │   ├── index.html
│       │   ├── style.css
│       │   └── main.ts
│       ├── custom-cursor/     # SVG Marker-End 데모
│       │   ├── index.html
│       │   ├── style.css
│       │   └── main.ts
│       ├── stroke-preview/    # 선 스타일 프리뷰
│       │   ├── index.html
│       │   ├── style.css
│       │   └── main.ts
│       └── preview/           # 개발용 라이브 프리뷰
│           ├── index.html
│           ├── style.css
│           └── main.ts
│
├── dist/                  # 빌드 결과물
│   ├── lib/              # 라이브러리 번들
│   │   ├── animations/
│   │   ├── draggable/
│   │   └── line-matching.min.js
│   └── pages/            # 페이지별 번들
│       ├── index.html    # 자동 생성된 페이지 목록
│       ├── basic/
│       │   ├── index.html
│       │   ├── style.css
│       │   └── main.js
│       ├── draggable/
│       ├── scroll/
│       ├── line-matching/
│       ├── custom-cursor/
│       ├── stroke-preview/
│       └── preview/
│
├── scripts/              # 빌드 스크립트
│   ├── copy-assets.js   # HTML/CSS 복사 스크립트
│   └── generate-index.js # 페이지 목록 자동 생성
│
├── rollup.config.js     # Rollup 번들러 설정
├── tsconfig.json        # TypeScript 설정
└── package.json         # 프로젝트 설정
```

## 🚀 개발 워크플로우

### 1. 새 페이지 만들기

```bash
# 1. 페이지 폴더 생성
mkdir -p src/pages/my-page

# 2. 파일 생성
touch src/pages/my-page/index.html
touch src/pages/my-page/style.css
touch src/pages/my-page/main.ts
```

### 2. 페이지 작성

**index.html**
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <!-- 컨텐츠 -->

  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
  <script src="./main.js"></script>
</body>
</html>
```

**style.css**
```css
body {
  margin: 0;
  padding: 0;
}
/* 스타일 작성 */
```

**main.ts**
```typescript
import { fadeIn } from '../../lib/animations/fade';

// 라이브러리 함수 사용
fadeIn('.element');

// 페이지 로직 작성
console.log('My page loaded!');
```

### 3. 빌드 & 실행

```bash
# 빌드 (TypeScript → JavaScript 변환)
npm run build

# 개발 서버 실행 (자동 빌드 + 라이브 리로드)
npm run dev:basic           # basic 페이지
npm run dev:draggable       # draggable 페이지
npm run dev:scroll          # scroll 페이지
npm run dev:line-matching   # line-matching 페이지
npm run dev:custom-cursor   # custom-cursor 페이지
npm run dev:stroke-preview  # stroke-preview 페이지
npm run dev:preview         # preview 페이지

# 모든 페이지 자동 감지하여 빌드
npm run build:watch
```

## 📦 빌드 시스템

### Rollup 설정 (rollup.config.js)

페이지별 main.ts를 자동으로 탐색하여 번들링합니다:

```javascript
// src/pages/**/main.ts 파일들을 자동 탐색
const pageEntries = glob.sync('src/pages/**/main.ts').reduce((entries, file) => {
  const pageName = path.basename(path.dirname(file));
  entries[pageName] = file;
  return entries;
}, {});

// 각 페이지를 dist/pages/[페이지명]/main.js로 번들링
```

### 빌드 결과

```
npm run build 실행 시:

1. TypeScript 컴파일 (src/lib → dist/lib)
2. 페이지 번들링 (src/pages/*/main.ts → dist/pages/*/main.js)
3. 에셋 복사 (HTML, CSS → dist/pages)
4. 인덱스 자동 생성 (dist/pages/index.html)
```

## 🎯 라이브러리 사용 방법

### src/lib에서 함수 import

```typescript
// 애니메이션
import { fadeIn, fadeInUp } from '../../lib/animations/fade';
import { slideInLeft } from '../../lib/animations/slide';
import { scrollFadeIn } from '../../lib/animations/scroll';

// 드래그
import { makeDraggable, makeDraggableX } from '../../lib/draggable/basic';

// 고급 기능
import { createLineMatching } from '../../lib/advanced/line-matching';
```

## 🔧 주요 npm 스크립트

```bash
# 빌드
npm run build              # 전체 빌드 (TypeScript + 에셋 복사 + 인덱스 생성)
npm run build:watch        # 파일 변경 시 자동 빌드
npm run copy:assets        # HTML/CSS만 복사
npm run generate:index     # 페이지 목록 인덱스 생성

# 개발
npm run dev                # 인덱스 페이지 열기
npm run dev:basic          # basic 페이지 개발 모드
npm run dev:draggable      # draggable 페이지 개발 모드
npm run dev:scroll         # scroll 페이지 개발 모드
npm run dev:line-matching  # line-matching 페이지 개발 모드
npm run dev:custom-cursor  # custom-cursor 페이지 개발 모드
npm run dev:stroke-preview # stroke-preview 페이지 개발 모드
npm run dev:preview        # preview 페이지 개발 모드

# 타입 체크
npm run type-check         # TypeScript 타입 오류 확인
```

## 📝 페이지 추가 체크리스트

새 페이지를 추가할 때 확인사항:

- [ ] `src/pages/[페이지명]/` 폴더 생성
- [ ] `index.html` 작성 (GSAP CDN + ./main.js 포함)
- [ ] `style.css` 작성
- [ ] `main.ts` 작성 (라이브러리 import)
- [ ] `scripts/generate-index.js`에 페이지 메타데이터 추가 (아이콘, 제목, 설명, 태그)
- [ ] `npm run build` 실행 → `dist/pages/[페이지명]/` 확인
- [ ] `dist/pages/index.html`에 자동 추가되었는지 확인
- [ ] package.json에 `dev:[페이지명]` 스크립트 추가 (선택사항)

## 🎨 장점

### 1. 페이지 단위 독립성
- 각 페이지의 HTML, CSS, TS를 한 폴더에서 관리
- 페이지 복사/이동이 쉬움
- 다른 프로젝트로 페이지 이동 용이

### 2. 자동화된 빌드
- `src/pages/**/main.ts`를 자동 탐색
- 새 페이지 추가 시 rollup 설정 수정 불필요
- 페이지 목록 index.html 자동 생성

### 3. 재사용 가능한 라이브러리
- `src/lib` 함수들은 모든 페이지에서 사용 가능
- TypeScript로 타입 안정성 보장

### 4. 개발 편의성
- 라이브 리로드로 빠른 개발
- 페이지별 독립 실행 가능

## 🔄 마이그레이션 내역

**변경 전 (2025.10 이전)**
```
- examples/ 폴더에 HTML만 존재
- HTML 내부에 <script> 태그로 로직 작성
- src-ts/ 폴더에 TypeScript 소스
```

**변경 후 (2025.10)**
```
- src/pages/ 폴더에 페이지별 독립 관리 (총 7개 페이지)
- HTML, CSS, TS 파일 분리
- src/lib/ 폴더로 공통 라이브러리 관리
- Rollup으로 자동 번들링
- examples/ 폴더 삭제 (완전 마이그레이션 완료)
- 빌드 시 페이지 목록 index.html 자동 생성
```

## 📚 참고

- GSAP 공식 문서: https://greensock.com/docs/
- Rollup 문서: https://rollupjs.org/
- TypeScript 문서: https://www.typescriptlang.org/
