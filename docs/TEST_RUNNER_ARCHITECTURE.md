# Test Runner Component Architecture

## 개요

TestRunnerComponent는 의존성 주입(Dependency Injection) 패턴을 사용하여 범용적으로 설계된 Web Component입니다. 이를 통해 다양한 테스트 프레임워크와 리포터를 쉽게 교체하고 확장할 수 있습니다.

## 아키텍처 구조

```
┌─────────────────────────────────────┐
│   TestRunnerComponent               │
│   (Web Component)                   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ITestRunner (Interface)      │ │
│  │  - runFromFile()              │ │
│  │  - runFromObject()            │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ITestReporter (Interface)    │ │
│  │  - render()                   │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
           ▲                ▲
           │                │
           │                │
┌──────────┴────────┐  ┌───┴──────────────────┐
│ GsapTestRunner    │  │ GsapTestReporter     │
│ Adapter           │  │ Adapter              │
│                   │  │                      │
│ (GSAP Kit 구현)   │  │ (GSAP Kit 구현)      │
└───────────────────┘  └──────────────────────┘
```

## 핵심 인터페이스

### ITestRunner

테스트 실행을 담당하는 인터페이스입니다.

```typescript
interface ITestRunner {
  runFromFile(filePath: string): Promise<TestRunResult>;
  runFromObject(spec: any): Promise<TestRunResult>;
}
```

### ITestReporter

테스트 결과를 렌더링하는 인터페이스입니다.

```typescript
interface ITestReporter {
  render(results: Map<string, any>, container: HTMLElement): void;
}
```

### TestRunResult

테스트 실행 결과의 표준 포맷입니다.

```typescript
interface TestRunResult {
  total: number;        // 전체 테스트 수
  passed: number;       // 통과한 테스트 수
  failed: number;       // 실패한 테스트 수
  duration?: number;    // 실행 시간 (ms)
  passRate: number;     // 통과율 (0-100)
  raw: Map<string, any>; // 원본 결과 데이터
}
```

## 사용법

### 1. 기본 사용 (GSAP Kit 테스트 러너)

```html
<!-- 가장 간단한 사용법 -->
<test-runner spec-file="/test-specs/gsap.spec.json"></test-runner>

<script type="module" src="./main.js"></script>
```

### 1-1. 파일 업로드 기능

TestRunnerComponent는 JSON 스펙 파일 업로드 기능을 내장하고 있습니다:

1. **📂 Upload Spec File** 버튼 클릭
2. JSON 파일 선택
3. 자동으로 Custom Spec 에디터에 로드됨
4. **Execute Custom Spec** 버튼으로 실행

```html
<!-- 파일 업로드 기능이 자동으로 포함됨 -->
<test-runner></test-runner>
```

### 2. 커스텀 테스트 러너 주입

```typescript
import { TestRunnerComponent, ITestRunner, ITestReporter } from '@gsap-kit/testing';

// 커스텀 러너 구현
class MyCustomRunner implements ITestRunner {
  async runFromFile(filePath: string): Promise<TestRunResult> {
    // 커스텀 구현
    return {
      total: 10,
      passed: 9,
      failed: 1,
      passRate: 90,
      raw: new Map()
    };
  }

  async runFromObject(spec: any): Promise<TestRunResult> {
    // 커스텀 구현
    return { /* ... */ };
  }
}

// 커스텀 리포터 구현
class MyCustomReporter implements ITestReporter {
  render(results: Map<string, any>, container: HTMLElement): void {
    container.innerHTML = '<h1>Custom Report</h1>';
    // 커스텀 렌더링 로직
  }
}

// Web Component에 주입
const runner = document.querySelector('test-runner');
runner.setTestRunner(new MyCustomRunner());
runner.setTestReporter(new MyCustomReporter());
```

### 3. 프로그래매틱 사용

```typescript
import {
  TestRunnerComponent,
  GsapTestRunnerAdapter,
  GsapTestReporterAdapter
} from '@gsap-kit/testing';

// 커스텀 인스턴스 생성
const myRunner = new GsapTestRunnerAdapter();
const myReporter = new GsapTestReporterAdapter();

// Web Component 생성자에 주입
const component = new TestRunnerComponent(myRunner, myReporter);
component.setAttribute('spec-file', '/test-specs/custom.spec.json');

document.body.appendChild(component);
```

## GSAP Kit 어댑터

### GsapTestRunnerAdapter

GSAP Kit의 `runTestsFromFile`과 `runTestsFromObject` 함수를 `ITestRunner` 인터페이스에 맞게 래핑합니다.

```typescript
export class GsapTestRunnerAdapter implements ITestRunner {
  async runFromFile(filePath: string): Promise<TestRunResult> {
    const results = await runTestsFromFile(filePath);
    return {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      duration: results.duration,
      passRate: results.passRate,
      raw: results.raw,
    };
  }

  async runFromObject(spec: any): Promise<TestRunResult> {
    const results = await runTestsFromObject(spec);
    // 동일한 변환 로직
  }
}
```

### GsapTestReporterAdapter

GSAP Kit의 `createReport` 함수를 `ITestReporter` 인터페이스에 맞게 래핑합니다.

```typescript
export class GsapTestReporterAdapter implements ITestReporter {
  render(results: Map<string, any>, container: HTMLElement): void {
    createReport(results, { container });
  }
}
```

## 제거된 기능

### visualize 및 slow-motion 옵션

이전 버전에서 UI에 포함되었지만 실제로 사용되지 않던 옵션들이 제거되었습니다:

- ❌ `visualize` 속성 (제거됨)
- ❌ `slow-motion` 속성 (제거됨)
- ❌ Visualize Paths 체크박스 (제거됨)
- ❌ Slow Motion 체크박스 (제거됨)

이러한 옵션들은 테스트 실행 시 실제로 전달되지 않았고, UI만 차지하고 있었기 때문에 범용성 향상을 위해 제거되었습니다.

## 장점

### 1. 의존성 역전 (Dependency Inversion)
- `TestRunnerComponent`는 구체적인 구현이 아닌 인터페이스에 의존
- 테스트 프레임워크 변경 시 어댑터만 교체하면 됨

### 2. 단일 책임 원칙 (Single Responsibility)
- `ITestRunner`: 테스트 실행만 담당
- `ITestReporter`: 결과 렌더링만 담당
- `TestRunnerComponent`: UI 컨트롤과 조율만 담당

### 3. 개방-폐쇄 원칙 (Open-Closed)
- 새로운 테스트 러너 추가 시 기존 코드 수정 불필요
- 인터페이스 구현만으로 확장 가능

### 4. 재사용성
- 다른 프로젝트에서 `ITestRunner`와 `ITestReporter`만 구현하면 동일한 UI 사용 가능
- Web Component이므로 프레임워크 독립적

## 파일 구조

```
src/lib/testing/
├── test-runner-interface.ts      # 핵심 인터페이스 정의
├── gsap-test-runner-adapter.ts   # GSAP Kit 어댑터 구현
├── test-runner-component.ts      # Web Component 구현
├── spec-runner.ts                # GSAP Kit 테스트 러너
├── reporter.ts                   # GSAP Kit 리포터
└── index.ts                      # 전체 export
```

## 마이그레이션 가이드

### 기존 코드 (변경 불필요)

```html
<test-runner spec-file="/test-specs/gsap.spec.json"></test-runner>
```

기본 사용 방식은 **그대로 유지**됩니다. 내부적으로 `defaultTestRunner`와 `defaultTestReporter`가 자동으로 주입됩니다.

### 커스텀 구현으로 변경

```typescript
// 1. 인터페이스 구현
class JestAdapter implements ITestRunner {
  async runFromFile(filePath: string): Promise<TestRunResult> {
    // Jest 기반 구현
  }
  async runFromObject(spec: any): Promise<TestRunResult> {
    // Jest 기반 구현
  }
}

// 2. 주입
const runner = document.querySelector('test-runner');
runner.setTestRunner(new JestAdapter());
```

## 향후 확장 가능성

1. **다양한 테스트 프레임워크 지원**
   - Jest Adapter
   - Vitest Adapter
   - Playwright Adapter

2. **다양한 리포터**
   - HTML Reporter
   - JSON Reporter
   - Markdown Reporter
   - Console Reporter

3. **플러그인 시스템**
   - 테스트 전/후 훅
   - 커스텀 어서션
   - 테스트 필터링

## 버전

- **v1.0**: 초기 구현 (GSAP Kit 전용)
- **v2.0**: 의존성 주입 패턴 적용 (현재 버전)

## 참고 문서

- [CONVENTIONS.md](../CONVENTIONS.md) - 프로젝트 컨벤션
- [Testing Library Documentation](../docs/testing.md) - 테스트 라이브러리 상세 문서
