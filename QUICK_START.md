# GSAP Kit 빠른 시작 가이드

## 🚀 5분 안에 첫 인터렉션 만들기

이 가이드에서는 **Line Matching 인터렉션**을 예제로 GSAP Kit을 시작하는 방법을 설명합니다.

---

## 📋 사전 준비

### 1. 프로젝트 클론 및 설치

```bash
git clone [repository-url]
cd gsap-kit
npm install
```

### 2. 빌드 및 실행

```bash
# 전체 빌드
npm run build

# Line Matching 데모 실행
npm run dev:line-matching
```

브라우저가 자동으로 열리고 Line Matching 데모를 볼 수 있습니다!

---

## 🎯 Line Matching 인터렉션 이해하기

### 무엇을 하는가?

**Line Matching**은 점과 점을 선으로 연결하는 매칭 게임 인터렉션입니다.

- 드래그 또는 클릭으로 포인트 연결
- 정답/오답 자동 체크
- 시각적 피드백 (색상, 애니메이션)
- 다양한 선 스타일 (실선, 점선, 화살표 등)

### 사용 예시

- 교육용 매칭 게임 (단어-뜻, 질문-답)
- 퀴즈 인터페이스
- 다이어그램 연결
- 관계도 시각화

---

## 📝 단계별 구현

### Step 1: HTML 구조 만들기

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>나만의 매칭 게임</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>과일 영어 매칭</h1>

    <!-- A 그룹 (왼쪽) -->
    <div class="group-a">
      <div class="item" id="fruit-1">사과</div>
      <div class="item" id="fruit-2">바나나</div>
      <div class="item" id="fruit-3">오렌지</div>
    </div>

    <!-- B 그룹 (오른쪽) -->
    <div class="group-b">
      <div class="item" id="english-1">Apple</div>
      <div class="item" id="english-2">Banana</div>
      <div class="item" id="english-3">Orange</div>
    </div>

    <!-- 리셋 버튼 -->
    <button onclick="resetGame()">다시 하기</button>

    <!-- 점수 -->
    <div class="score">
      <p>정답: <span id="correct">0</span></p>
      <p>오답: <span id="incorrect">0</span></p>
    </div>
  </div>

  <!-- GSAP CDN -->
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
  <!-- 빌드된 스크립트 -->
  <script src="main.js"></script>
</body>
</html>
```

### Step 2: CSS 스타일링

```css
.container {
  display: flex;
  gap: 100px;
  padding: 50px;
  position: relative; /* 중요: SVG가 absolute로 배치됨 */
}

.group-a, .group-b {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.item {
  padding: 20px 40px;
  background: #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.item:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

button {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  cursor: pointer;
}

.score {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
```

### Step 3: TypeScript로 인터렉션 적용

`main.ts` 파일을 생성합니다:

```typescript
import { createLineMatching } from '../../lib/advanced/line-matching';

let matchingInstance: ReturnType<typeof createLineMatching> | null = null;
let correctCount = 0;
let incorrectCount = 0;

function initGame(): void {
  // 카운터 초기화
  correctCount = 0;
  incorrectCount = 0;
  updateScore();

  // Line Matching 생성
  matchingInstance = createLineMatching({
    // 📍 1. 아이템 정의 (ID와 선택자, 포인트 위치)
    items: {
      // A 그룹 - 포인트를 오른쪽에 배치
      'a1': { selector: '#fruit-1', point: { x: 'right', y: 'center' } },
      'a2': { selector: '#fruit-2', point: { x: 'right', y: 'center' } },
      'a3': { selector: '#fruit-3', point: { x: 'right', y: 'center' } },

      // B 그룹 - 포인트를 왼쪽에 배치
      'b1': { selector: '#english-1', point: { x: 'left', y: 'center' } },
      'b2': { selector: '#english-2', point: { x: 'left', y: 'center' } },
      'b3': { selector: '#english-3', point: { x: 'left', y: 'center' } },
    },

    // 📍 2. 정답 매핑
    pairs: {
      'a1': 'b1', // 사과 - Apple
      'a2': 'b2', // 바나나 - Banana
      'a3': 'b3', // 오렌지 - Orange
    },

    // 📍 3. 스타일 옵션
    pointSize: 16,
    pointColor: '#667eea',
    pointHoverColor: '#764ba2',
    lineWidth: 3,
    correctColor: '#4CAF50',
    incorrectColor: '#F44336',

    // 📍 4. 선 스타일 (선택)
    lineStyle: 'arrow', // 'solid' | 'dashed' | 'dotted' | 'animated-dash' | 'arrow'

    // 📍 5. 옵션
    allowMultipleAttempts: true,  // 여러 번 시도 허용
    showFeedback: true,            // 시각적 피드백 표시
    bidirectional: false,          // A→B만 가능 (양방향 불가)

    // 📍 6. 콜백 함수
    onCorrect: (fromId, toId) => {
      console.log('✅ 정답!', fromId, '→', toId);
      correctCount++;
      updateScore();
    },

    onIncorrect: (fromId, toId) => {
      console.log('❌ 오답!', fromId, '→', toId);
      incorrectCount++;
      updateScore();
    },

    onComplete: (score, total) => {
      alert(`🎉 완료! ${score}/${total} 정답입니다!`);
    },
  });
}

function resetGame(): void {
  if (matchingInstance) {
    matchingInstance.reset();
    correctCount = 0;
    incorrectCount = 0;
    updateScore();
  }
}

function updateScore(): void {
  const correctEl = document.getElementById('correct');
  const incorrectEl = document.getElementById('incorrect');
  if (correctEl) correctEl.textContent = String(correctCount);
  if (incorrectEl) incorrectEl.textContent = String(incorrectCount);
}

// 페이지 로드 시 게임 초기화
window.addEventListener('load', () => {
  initGame();
});

// 전역 함수로 노출 (버튼 onclick용)
(window as any).resetGame = resetGame;
```

### Step 4: 빌드 및 실행

프로젝트 루트에서 다음 명령어를 실행합니다:

```bash
# 빌드
npm run build

# 로컬 서버 실행
npm run serve
```

브라우저에서 `http://localhost:8000/dist/pages/[your-page]/`를 열면 완성!

---

## 🎨 커스터마이징

### 1. 다중 정답 지원

하나의 항목이 여러 개와 매칭될 수 있습니다:

```typescript
pairs: {
  'a1': ['b1', 'b2'], // a1은 b1 또는 b2 모두 정답
  'a2': 'b3',
}
```

### 2. 선 스타일 변경

다양한 선 스타일을 사용할 수 있습니다:

```typescript
// 실선 (기본)
lineStyle: 'solid'

// 점선
lineStyle: 'dashed'
dashArray: '10,5' // 커스텀 점선 패턴

// 점 스타일
lineStyle: 'dotted'

// 애니메이션 점선
lineStyle: 'animated-dash'

// 화살표
lineStyle: 'arrow'
arrowSize: 20 // 화살표 크기
```

💡 **팁**: `src/pages/stroke-preview/` 데모에서 모든 스타일을 미리 볼 수 있습니다!

```bash
npm run dev:stroke-preview
```

### 3. 포인트 위치 조정

포인트는 요소의 다양한 위치에 배치할 수 있습니다:

```typescript
point: { x: 'left', y: 'top' }       // 왼쪽 위
point: { x: 'center', y: 'center' }  // 정중앙
point: { x: 'right', y: 'bottom' }   // 오른쪽 아래
point: { x: '25%', y: '75%' }        // 퍼센트
point: { x: 100, y: 50 }             // 픽셀 값
```

### 4. 양방향 연결

A→B뿐만 아니라 B→A도 허용:

```typescript
bidirectional: true
```

---

## 🔍 고급 기능

### Container 지정

SVG가 특정 컨테이너 내에만 그려지도록 제한:

```typescript
createLineMatching({
  container: '#game-area', // 또는 HTMLElement
  // ...
})
```

### 커서 숨김 (화살표 스타일 사용 시)

```typescript
lineStyle: 'arrow',
hideCursor: true, // 드래그 중 시스템 커서 숨김
```

### 피드백 제어

```typescript
showFeedback: false, // 시각적 피드백 비활성화
allowMultipleAttempts: false, // 오답 시 다시 시도 불가
```

---

## 📚 다음 단계

### 1. 다른 데모 살펴보기

```bash
npm run dev:draggable      # 드래그 인터렉션
npm run dev:scroll         # 스크롤 애니메이션
npm run dev:custom-cursor  # SVG 마커 데모
```

### 2. 새 인터렉션 만들기

[INTERACTION_BUILDER_GUIDE.md](./INTERACTION_BUILDER_GUIDE.md)를 참고하여 나만의 인터렉션을 만들어보세요!

### 3. 전체 프로젝트 구조 이해하기

[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)에서 프로젝트 구조를 자세히 알아보세요.

---

## ❓ FAQ

### Q: 요소가 찾아지지 않는다고 에러가 나요

A: 선택자가 올바른지, HTML에 해당 ID가 존재하는지 확인하세요.

```typescript
// ❌ Bad: 잘못된 선택자
items: {
  'a1': { selector: '.fruit-1' } // ID인데 class 선택자 사용
}

// ✅ Good
items: {
  'a1': { selector: '#fruit-1' } // ID 선택자
}
```

### Q: 포인트가 안 보여요

A: 부모 요소에 `overflow: hidden`이 있는지 확인하세요. 포인트는 부모 요소 밖으로 나갈 수 있어야 합니다.

```css
/* ❌ Bad */
.item {
  overflow: hidden; /* 포인트가 잘림 */
}

/* ✅ Good */
.item {
  overflow: visible; /* 또는 속성 제거 */
}
```

### Q: SVG 선이 화면을 벗어나요

A: 컨테이너를 지정하세요.

```typescript
createLineMatching({
  container: '.game-container', // 특정 영역으로 제한
  // ...
})
```

### Q: 빌드 에러가 나요

A: TypeScript 컴파일 확인:

```bash
npm run type-check
```

---

## 🎉 완료!

축하합니다! 첫 GSAP Kit 인터렉션을 성공적으로 만들었습니다.

이제 다음을 시도해보세요:

- 다른 선 스타일 적용하기
- 더 많은 아이템 추가하기
- 커스텀 디자인 적용하기
- 새로운 인터렉션 개발하기

질문이 있다면 [Issues](https://github.com/...)에 남겨주세요!
