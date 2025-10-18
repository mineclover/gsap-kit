# 개발 가이드

## 🚀 빠른 시작

### 순수 JavaScript 개발 (기존 방식)

```bash
# 로컬 서버 실행
npm run dev

# 브라우저에서 examples/draggable.html 열림
```

**파일 구조**:
- 작성: `src/draggable/basic.js`
- 사용: HTML에서 직접 `<script src="../src/draggable/basic.js">`

---

### TypeScript 개발 (권장 🎯)

```bash
# 의존성 설치
npm install

# TypeScript 개발 모드 실행
npm run dev:ts
```

**실행 내용**:
1. ✅ **nodemon**이 `src-ts/` 폴더 감시
2. ✅ TypeScript 파일 변경 시 자동으로 `tsc` 실행
3. ✅ 컴파일된 JS가 `dist/` 폴더에 생성
4. ✅ **live-server**가 변경 감지 후 자동 리로드
5. ✅ `examples/preview.html`이 자동으로 열림

**파일 구조**:
- 작성: `src-ts/draggable/basic.ts` (TypeScript)
- 컴파일: `dist/draggable/basic.js` (자동 생성)
- 사용: HTML에서 `<script src="../dist/draggable/basic.js">`

---

## 📁 폴더 구조

```
gsap-kit/
├── src-ts/              # TypeScript 소스 (개발)
│   └── draggable/
│       └── basic.ts     # ✏️ 여기서 작성
│
├── dist/                # 컴파일 결과 (자동 생성)
│   └── draggable/
│       ├── basic.js     # 🎯 HTML에서 사용
│       └── basic.d.ts   # 타입 정의
│
├── src/                 # 순수 JS (선택)
│   └── draggable/
│       └── basic.js
│
└── examples/
    ├── preview.html     # TypeScript 테스트용
    └── draggable.html   # 완성 예제
```

---

## 🔄 개발 워크플로우

### 1단계: TypeScript 개발 환경 실행

```bash
npm run dev:ts
```

자동으로 두 가지가 동시에 실행됩니다:
- **nodemon**: `src-ts/` 감시 → 변경 시 자동 빌드
- **live-server**: `dist/`, `examples/` 감시 → 변경 시 브라우저 리로드

### 2단계: TypeScript 파일 수정

```typescript
// src-ts/draggable/basic.ts

function makeDraggable(
  target: string | HTMLElement,
  options: DraggableOptions = {}
): Draggable[] | null {
  // 코드 수정...
}
```

**저장하면**:
1. nodemon이 변경 감지 ⚡
2. `tsc` 실행 → `dist/` 폴더에 JS 생성 📦
3. live-server가 감지 → 브라우저 자동 리로드 🔄

### 3단계: 브라우저에서 확인

`examples/preview.html`이 자동으로 열립니다.
- 실시간 로그 확인
- 드래그 테스트
- 에러 확인

---

## 📝 npm 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 순수 JS 개발 (http-server) |
| `npm run dev:ts` | **TypeScript 개발** (nodemon + live-server) ⭐ |
| `npm run build` | TypeScript → JavaScript 1회 빌드 |
| `npm run build:watch` | TypeScript 감시 모드 (컴파일만) |
| `npm run type-check` | 타입 체크만 (빌드 안 함) |
| `npm run serve` | 로컬 서버만 실행 |
| `npm run serve:live` | live-server 실행 |

---

## 🎯 실시간 개발 시스템

### nodemon 설정 (`nodemon.json`)

```json
{
  "watch": ["src-ts"],        // 감시 폴더
  "ext": "ts",                // 감시 확장자
  "exec": "npm run build",    // 실행 명령
  "delay": 500                // 500ms 지연
}
```

**동작 방식**:
1. `src-ts/**/*.ts` 파일 변경
2. 500ms 대기 (연속 저장 방지)
3. `npm run build` (tsc) 실행
4. `dist/` 폴더에 JS 생성

### live-server 설정

```bash
live-server --port=8000 \
  --open=/examples/preview.html \  # 시작 페이지
  --watch=dist,examples \          # 감시 폴더
  --no-css-inject                  # CSS 변경 시 전체 리로드
```

**동작 방식**:
1. `dist/` 또는 `examples/` 폴더 변경 감지
2. WebSocket으로 브라우저에 알림
3. 브라우저 자동 리로드

---

## 🔍 디버깅

### 브라우저 콘솔 확인

`examples/preview.html`에는 실시간 로그가 표시됩니다:

```javascript
[14:23:45] 페이지 로드됨
[14:23:45] makeDraggable 함수 호출 중...
[14:23:45] ✅ Draggable 인스턴스 생성 성공!
[14:23:50] ✅ 드래그 시작!
[14:23:52] ✅ 드래그 종료: x=234, y=156
```

### TypeScript 에러 확인

터미널에서 컴파일 에러를 실시간으로 확인:

```bash
src-ts/draggable/basic.ts:45:12 - error TS2322:
Type 'string' is not assignable to type 'number'.

45   duration: 'invalid',
   ~~~~~~~~
```

---

## 🎨 HTML에서 사용

### TypeScript로 개발한 경우

```html
<!-- dist 폴더의 컴파일된 JS 사용 -->
<script src="../dist/draggable/basic.js"></script>

<script>
  // 타입 안전성은 개발 시에만, 사용은 순수 JS처럼
  makeDraggable('.box', {
    type: 'x,y',
    bounds: window
  });
</script>
```

### 순수 JS로 개발한 경우

```html
<!-- src 폴더의 JS 직접 사용 -->
<script src="../src/draggable/basic.js"></script>

<script>
  makeDraggable('.box', {
    type: 'x,y',
    bounds: window
  });
</script>
```

---

## 💡 팁

### 1. TypeScript 파일만 수정

TypeScript로 개발할 때는 **절대 `dist/` 폴더를 직접 수정하지 마세요!**
- ✅ `src-ts/` 수정 → 자동으로 `dist/` 생성
- ❌ `dist/` 직접 수정 → 다음 빌드 시 덮어써짐

### 2. 빠른 테스트

```bash
# preview.html을 기본 브라우저로 바로 열기
open examples/preview.html

# 그리고 터미널에서
npm run watch:ts  # nodemon만 실행
```

### 3. 프로덕션 빌드

```bash
# 1회 빌드 (배포용)
npm run build

# dist 폴더 확인
ls -la dist/draggable/
```

### 4. 타입만 체크

```bash
# 컴파일 없이 타입 에러만 확인
npm run type-check
```

---

## 🐛 문제 해결

### Q: nodemon이 파일 변경을 감지하지 못해요

```bash
# nodemon 재설치
npm install -D nodemon

# 또는 직접 실행
npx nodemon --watch src-ts --ext ts --exec "npm run build"
```

### Q: live-server가 리로드되지 않아요

```bash
# live-server 재설치
npm install -D live-server

# 또는 수동 새로고침 (Cmd+R / Ctrl+R)
```

### Q: TypeScript 컴파일 에러

```bash
# tsconfig.json 확인
cat tsconfig.json

# TypeScript 재설치
npm install -D typescript

# 수동 빌드
npx tsc
```

### Q: dist 폴더가 안 생겨요

```bash
# 1. tsconfig.json의 outDir 확인
# 2. 수동으로 폴더 생성
mkdir -p dist/draggable

# 3. 빌드 실행
npm run build
```

---

## ✅ 권장 워크플로우

1. **TypeScript로 개발** (`src-ts/`)
   - 타입 안전성
   - IntelliSense
   - 리팩토링 용이

2. **nodemon + live-server로 실시간 확인**
   - 저장 즉시 반영
   - 브라우저 자동 리로드

3. **preview.html에서 테스트**
   - 실시간 로그
   - 드래그 기능 확인

4. **완성 후 dist 배포**
   - 순수 JS로 변환됨
   - HTML에서 바로 사용 가능

---

**Happy Coding! 🚀**
