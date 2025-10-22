# JSON Spec Execution Architecture

## Overview
JSON 기반 테스트 스펙을 파싱하고 실행하는 시스템의 아키텍처 문서

## Current Implementation

### 1. File Structure
```
src/lib/testing/
├── spec-loader.ts       # JSON 스펙을 TestCase로 변환
├── spec-runner.ts       # 스펙 파일 로드 및 실행 조율
├── test-runner.ts       # 개별 TestCase 실행
├── mouse-simulator.ts   # Click/Drag 시뮬레이션
├── hover-simulation.ts  # Hover 시뮬레이션
└── gsap-assertions.ts   # GSAP 상태 검증
```

### 2. Execution Flow

#### Step 1: JSON File Loading
**Location**: `spec-runner.ts:loadFromFile()`
```typescript
async loadFromFile(filePath: string) {
  const response = await fetch(filePath);
  const spec: TestFileSpec = await response.json();
  this.spec = spec;
  this.testRunner.reset();

  // 각 스위트 등록
  for (const suiteSpec of spec.suites) {
    const testSuite = TestSpecLoader.convertToTestSuite(suiteSpec, spec.config);
    this.testRunner.registerSuite(testSuite);
  }
}
```

**Input**: `/test-specs/gsap.spec.json`
```json
{
  "metadata": { "title": "GSAP Animation Assertions" },
  "config": { "visualizationEnabled": false },
  "suites": [
    {
      "name": "Fade Animation Tests",
      "beforeEach": {
        "executeFunction": "gsapTest.resetAllAnimations",
        "waitTime": 500
      },
      "tests": [...]
    }
  ]
}
```

#### Step 2: Suite Conversion
**Location**: `spec-loader.ts:convertToTestSuite()`
```typescript
static convertToTestSuite(suiteSpec: TestSuiteSpec, config?: TestFileSpec['config']) {
  return {
    name: suiteSpec.name,
    description: suiteSpec.description,
    tests: suiteSpec.tests.map(testSpec =>
      TestSpecLoader.convertToTestCase(testSpec, config)
    ),
    beforeAll: TestSpecLoader.convertHook(suiteSpec.beforeAll),
    afterAll: TestSpecLoader.convertHook(suiteSpec.afterAll),
    beforeEach: TestSpecLoader.convertHook(suiteSpec.beforeEach),
    afterEach: TestSpecLoader.convertHook(suiteSpec.afterEach),
  };
}
```

**Key Process**:
- Converts each `TestSpec` (JSON) → `TestCase` (runtime object)
- Converts hooks (beforeEach, afterEach, etc.)

#### Step 3: Test Case Conversion
**Location**: `spec-loader.ts:convertToTestCase()`
```typescript
static convertToTestCase(spec: TestSpec, config?: TestFileSpec['config']): TestCase {
  const testCase: TestCase = {
    name: spec.name,
    type: spec.type,
    simulation: {
      from: spec.simulation.from,        // ← THIS IS THE PROBLEM
      to: spec.simulation.to,
      duration: spec.simulation.duration ?? 1000,
      // ... other fields
    },
    timeout: spec.timeout,
  };

  // Setup 설정
  if (spec.setup) {
    testCase.setup = async () => {
      if (spec.setup!.executeFunction) {
        const executeFn = TestSpecLoader.resolveFunction(spec.setup!.executeFunction);
        if (typeof executeFn === 'function') {
          await executeFn();
        }
      }
    };
  }

  // Assertion 설정
  if (spec.assert) {
    testCase.assert = async () => {
      return AssertionValidator.validate(spec.assert, spec.delay);
    };
  }

  return testCase;
}
```

**Problem**: `spec.simulation.from`이 TestCase 생성 시에는 존재하지만, 실행 시 undefined

#### Step 4: Test Execution
**Location**: `test-runner.ts:runTest()`
```typescript
private async runTest(test: TestCase, suiteContext?: TestSuite): Promise<TestResult> {
  // Setup
  if (test.setup) {
    await test.setup();
  }
  if (suiteContext?.beforeEach) {
    await suiteContext.beforeEach();
  }

  // 마우스 시뮬레이션
  if (test.type === 'hover') {
    await simulateHover(test.simulation as HoverSimulatorOptions);
  } else {
    // Click/Drag
    const simulator = new MouseSimulator({
      ...test.simulation,          // ← Spread operator
      onMove: (point, progress) => {
        if (test.simulation.onMove) {
          test.simulation.onMove(point, progress);
        }
      },
    });

    await simulator.simulate();    // ← Error occurs here
  }

  // 검증
  if (test.assert) {
    passed = await test.assert();
  }
}
```

**Problem Location**: `simulator.simulate()` → `MouseSimulator.getElementPosition()` → Error: "Element not found: undefined"

#### Step 5: Mouse Simulation
**Location**: `mouse-simulator.ts:getElementPosition()`
```typescript
private getElementPosition(target: string | { x: number; y: number } | HTMLElement) {
  if (typeof target === 'string') {
    // 셀렉터인 경우
    const element = document.querySelector(target as string) as HTMLElement;
    if (!element) {
      throw new Error(`Element not found: ${target}`);  // ← ERROR HERE
    }
    // ...
  }
}
```

**Called from**: `MouseSimulator.simulate()` with `this.options.from`
**Problem**: `this.options.from` is `undefined`

## Problem Analysis

### Issue 1: Missing simulation.from
**Symptom**: All 18 tests fail with "Element not found: undefined"

**Data Flow**:
```
JSON spec → TestSpec → TestCase → MouseSimulator
{           simulation: {  simulation: {   options: {
  simulation: {  from: "#fade-trigger"  from: "#fade-trigger"  from: undefined  ← PROBLEM
    from: "#fade-trigger"  }              }                     }
  }         }                          }
}
```

**Hypothesis**:
1. ✅ JSON spec has correct `simulation.from` value
2. ✅ `TestSpec` interface expects `simulation.from`
3. ✅ `convertToTestCase` copies `spec.simulation.from` to `testCase.simulation.from`
4. ❌ **Somewhere between TestCase creation and MouseSimulator, `from` becomes undefined**

**Possible Causes**:
1. Spread operator `...test.simulation` loses `from` field
2. TypeScript interface mismatch (SimulatorOptions vs TestCase.simulation)
3. Async/context issue - simulation object mutated before execution
4. beforeEach hook modifies simulation object

### Issue 2: Type Mismatch
**TestCase.simulation**:
```typescript
simulation: {
  from?: string | { x: number; y: number };
  to?: string | { x: number; y: number };
  target?: string;  // For hover
  duration?: number;
  // ... many other fields
}
```

**MouseSimulatorOptions**:
```typescript
interface SimulatorOptions {
  from: string | { x: number; y: number } | HTMLElement;
  to?: string | { x: number; y: number } | HTMLElement;
  duration?: number;
  // ... fewer fields
}
```

**Problem**: `TestCase.simulation` has many fields that `MouseSimulatorOptions` doesn't need
- When spreading `...test.simulation`, extra fields might interfere
- Type system allows `from` to be undefined, but runtime requires it

## Current Status

### Working ✅
1. **Individual Assertions**: All 6 GSAP assertion types work perfectly
   ```javascript
   // Direct function calls work
   const result = await validateGSAPAssertion({
     type: 'gsap-property-value',
     selector: '.fade-box',
     property: 'opacity',
     expected: 1,
   });
   // ✅ Returns true
   ```

2. **Function Resolution**: Nested paths like `gsapTest.resetAllAnimations` resolve correctly
3. **JSON Parsing**: JSON spec files load and parse successfully
4. **Suite/Test Structure**: Suites and tests are registered correctly
5. **Click Type Auto-Fix**: Click tests now automatically set `to` equal to `from` when not specified

### Fixed Issues ✅
1. **Missing `simulation.to` for Click Tests** (2025-01-23)
   - **Problem**: Click type tests in JSON spec didn't specify `to` field, causing MouseSimulator to receive `undefined`
   - **Root Cause**: Click should simulate clicking the same element (from === to), but JSON spec omitted `to` field
   - **Solution**: Added auto-fix in `spec-loader.ts:convertToTestCase()`:
     ```typescript
     const simulationTo = spec.simulation.to ?? (spec.type === 'click' ? spec.simulation.from : undefined);
     ```
   - **Result**: MouseSimulator now receives proper `to` value for click tests

### Test Results (After Fix)
- Individual GSAP assertions: 6/6 passing (100%)
- JSON spec execution: Tests now running (previously 0/18)
- Many tests passing, some assertion failures remain (timing/value related, not simulation issues)

## Investigation Steps

### Completed
1. ✅ Verified JSON spec syntax is correct
2. ✅ Verified TestSpec interface matches JSON structure
3. ✅ Added safety check for simulation object existence
4. ✅ Fixed function path resolution (gsapTest.method)
5. ✅ Added debug logging to test-runner

### Needed
1. ⏳ Log simulation object at each stage of conversion
2. ⏳ Verify spread operator preserves all fields
3. ⏳ Check if beforeEach hooks modify simulation
4. ⏳ Investigate TypeScript type narrowing issues
5. ⏳ Compare working vs failing test execution paths

## Proposed Solutions

### Solution 1: Deep Clone Simulation Object
Prevent mutation by cloning before passing to MouseSimulator:
```typescript
const simulator = new MouseSimulator({
  ...JSON.parse(JSON.stringify(test.simulation)),  // Deep clone
  onMove: (point, progress) => { ... },
});
```

### Solution 2: Explicit Field Mapping
Only pass required fields to MouseSimulator:
```typescript
const simulator = new MouseSimulator({
  from: test.simulation.from,
  to: test.simulation.to,
  duration: test.simulation.duration,
  curvature: test.simulation.curvature,
  dispatchEvents: test.simulation.dispatchEvents,
  onMove: (point, progress) => { ... },
});
```

### Solution 3: Validate Before Execution
Add runtime validation before creating MouseSimulator:
```typescript
if (!test.simulation.from) {
  throw new Error(`Test "${test.name}" missing required simulation.from field`);
}
```

### Solution 4: Add Console Logging
Temporarily add extensive logging:
```typescript
console.log('[convertToTestCase] Created:', {
  name: testCase.name,
  simulationFrom: testCase.simulation.from,
});

console.log('[runTest] Before simulate:', {
  name: test.name,
  simulationFrom: test.simulation.from,
});
```

## Files Involved

### Core Implementation
- `src/lib/testing/spec-loader.ts` (420 lines)
  - Converts JSON → TestCase
  - Handles assertions, setup, teardown

- `src/lib/testing/spec-runner.ts` (160 lines)
  - Loads JSON files
  - Orchestrates test execution

- `src/lib/testing/test-runner.ts` (250 lines)
  - Executes individual TestCase
  - Manages test lifecycle

- `src/lib/testing/mouse-simulator.ts` (300+ lines)
  - Simulates mouse interactions
  - Throws "Element not found" error

### Test Specs
- `test-specs/gsap.spec.json` - 18 tests, all failing
- `test-specs/hover.spec.json` - 8 tests, 3 passing

### E2E Tests
- `tests/e2e/gsap-spec.spec.ts` - Playwright test wrapper
- `tests/e2e/hover-spec.spec.ts` - Playwright test wrapper

## Next Actions

1. **Add Comprehensive Logging**
   - Log simulation object at each transformation step
   - Track when `from` becomes undefined

2. **Create Minimal Reproduction**
   - Single test case that should work
   - Step through execution manually

3. **Fix Root Cause**
   - Once identified, apply targeted fix
   - Avoid breaking working functionality

4. **Verify Fix**
   - All 18 GSAP spec tests should pass
   - All 8 hover spec tests should pass
   - Individual assertions should still work

---

Last Updated: 2025-01-23
Status: Issue identified but root cause not yet fixed
