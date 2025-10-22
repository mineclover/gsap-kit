# GSAP Kit - Automated Testing

GSAP Kit의 자동화된 테스트 시스템입니다.

## 🎯 개요

이 프로젝트는 **두 가지 레벨의 테스트**를 제공합니다:

1. **브라우저 내부 테스트** (`src/lib/testing`):
   - MouseSimulator를 사용한 인터랙션 시뮬레이션
   - 브라우저에서 직접 실행 가능한 테스트 스위트
   - 시각적 피드백 제공

2. **E2E 테스트** (`tests/e2e`):
   - Playwright를 사용한 자동화된 브라우저 테스트
   - CI/CD 파이프라인에서 실행 가능
   - 여러 브라우저에서 동시 테스트

## 📦 설치

Playwright 브라우저 설치:

```bash
npm run test:install
```

## 🧪 브라우저 내부 테스트

### 수동 실행

1. 빌드 및 개발 서버 실행:
```bash
npm run build:cdn
npm run dev
```

2. 브라우저에서 테스트 페이지 열기:
```
http://localhost:8000/dist/pages/interaction-test/index.html
```

3. "Run All Tests" 버튼 클릭

### 자동 실행

URL 파라미터를 사용하여 페이지 로드 시 자동으로 테스트 실행:

```
http://localhost:8000/dist/pages/interaction-test/index.html?autoRun=true
```

### 프로그래매틱 실행

브라우저 콘솔이나 외부 스크립트에서:

```javascript
// 테스트 API 사용
const result = await window.__GSAP_KIT_TEST__.run();

console.log('Total:', result.total);
console.log('Passed:', result.passed);
console.log('Failed:', result.failed);
console.log('Pass Rate:', result.passRate + '%');

// 각 스위트별 결과
result.suites.forEach(suite => {
  console.log(`${suite.name}: ${suite.passed}/${suite.total}`);
});
```

## 🤖 E2E 테스트 (Playwright)

### 모든 브라우저에서 테스트 실행

```bash
npm test
# 또는
npm run test:e2e
```

### 특정 브라우저에서만 실행

```bash
# Chromium
npm run test:e2e:chromium

# Firefox
npm run test:e2e:firefox

# WebKit (Safari)
npm run test:e2e:webkit
```

### 디버그 모드

브라우저를 직접 보면서 테스트:

```bash
npm run test:e2e:headed
```

단계별 디버깅:

```bash
npm run test:e2e:debug
```

### UI 모드

대화형 UI에서 테스트 실행:

```bash
npm run test:e2e:ui
```

### 테스트 리포트 보기

```bash
npm run test:report
```

## 📝 테스트 작성

### 브라우저 내부 테스트 작성

`src/pages/your-page/test.ts`:

```typescript
import { describe, testDrag, testClick, testRunner, setupGlobalAutomation } from '../../lib/testing';

// 테스트 정의
describe('Your Feature Tests', [
  testDrag(
    'Test drag interaction',
    '#source',
    '#target',
    async () => {
      // 검증 로직
      const element = document.querySelector('#target');
      return element !== null;
    },
    {
      description: 'Should drag from source to target',
      simulation: {
        from: '#source',
        to: '#target',
        duration: 1000,
        curvature: 0.3,
      },
      visualization: {
        pathColor: '#667eea',
        showCursor: true,
        autoRemove: true,
      },
    }
  ),

  testClick(
    'Test click interaction',
    '#button',
    async () => {
      // 검증 로직
      return true;
    }
  ),
]);

// 자동화 API 설정
setupGlobalAutomation(testRunner, {
  autoStart: false,
  onComplete: (result) => {
    console.log('Tests completed:', result);
  },
});
```

### E2E 테스트 작성

`tests/e2e/your-feature.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Your Feature', () => {
  test('should run automated tests', async ({ page }) => {
    // 페이지 로드
    await page.goto('http://localhost:8000/dist/pages/your-page/index.html');

    // 테스트 실행
    const result = await page.evaluate(async () => {
      return await window.__GSAP_KIT_TEST__.run();
    });

    // 결과 검증
    expect(result.completed).toBe(true);
    expect(result.failed).toBe(0);
  });
});
```

## 🔧 테스트 API

### window.__GSAP_KIT_TEST__

모든 테스트 페이지에서 사용 가능한 전역 API:

```typescript
interface TestAPI {
  // 테스트 실행
  run(): Promise<AutomationResult>;

  // 현재 결과 가져오기
  getResult(): AutomationResult | null;

  // 실행 중 여부
  isRunning(): boolean;

  // 테스트 러너 인스턴스
  runner: TestRunner;

  // 자동화 인스턴스
  automation: TestAutomation;
}
```

### AutomationResult

```typescript
interface AutomationResult {
  completed: boolean;
  total: number;
  passed: number;
  failed: number;
  duration: number;
  passRate: number;
  suites: Array<{
    name: string;
    total: number;
    passed: number;
    failed: number;
    duration: number;
    tests: TestResult[];
  }>;
}
```

## 📊 테스트 결과

### 콘솔 출력

```
🧪 Starting E2E tests...

📦 Building project...
✅ Build completed

🎭 Running Playwright tests...

Running 8 tests using 1 worker

  ✓  [chromium] › interaction-test.spec.ts:10:3 › should have test API available (123ms)
  ✓  [chromium] › interaction-test.spec.ts:20:3 › should run all tests programmatically (8.5s)
  ...

📊 Test Results Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:    8
Passed:   8
Failed:   0
Skipped:  0
Duration: 15.23s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### HTML 리포트

`npm run test:report` 명령으로 상세한 HTML 리포트를 볼 수 있습니다.

### JSON 결과

결과는 `test-results/results.json`에 저장됩니다.

## 🎨 시각화 옵션

테스트 실행 시 경로 시각화:

```typescript
{
  visualization: {
    pathColor: '#667eea',     // 경로 색상
    showCursor: true,          // 커서 표시
    autoRemove: true,          // 자동 제거
    removeDelay: 1000,         // 제거 지연 (ms)
  }
}
```

## ⚙️ 설정

### Playwright 설정

`playwright.config.ts`에서 설정 가능:

- 브라우저 종류
- 타임아웃
- 리포터
- 스크린샷/비디오 설정

### 테스트 타임아웃

```typescript
test.setTimeout(60000); // 60초
```

## 🐛 디버깅

### 브라우저 콘솔 로그 보기

```typescript
test('debug logs', async ({ page }) => {
  page.on('console', msg => console.log('Browser:', msg.text()));

  await page.goto('...');
});
```

### 스크린샷 캡처

```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### 느린 모션으로 실행

```bash
npm run test:e2e:headed -- --slow-mo=1000
```

## 📚 추가 리소스

- [Playwright 문서](https://playwright.dev/)
- [GSAP 문서](https://greensock.com/docs/)
- [프로젝트 README](../README.md)

## 🤝 기여

테스트 추가나 개선 사항은 PR을 통해 기여해주세요!
