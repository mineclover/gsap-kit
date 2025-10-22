# JSON Spec Testing Guide

GSAP Kit의 JSON 기반 테스트 스펙 시스템을 사용하면 코드 없이 JSON 파일만으로 자동화 테스트를 정의하고 실행할 수 있습니다.

## 🎯 개요

JSON Spec Testing은 셀렉터 기반의 선언적 테스트 시스템입니다:

- ✅ **코드 없이 테스트 작성** - JSON 파일만으로 테스트 정의
- ✅ **셀렉터 기반** - CSS 셀렉터로 요소 선택
- ✅ **시각화 지원** - 경로 시각화 및 커서 표시
- ✅ **검증 옵션** - 다양한 assertion 타입
- ✅ **재사용 가능** - 테스트 스펙을 파일로 저장 및 공유

## 📋 JSON 스펙 구조

### 기본 구조

```json
{
  "version": "1.0.0",
  "metadata": {
    "title": "테스트 제목",
    "description": "테스트 설명",
    "author": "작성자",
    "tags": ["tag1", "tag2"]
  },
  "config": {
    "defaultDuration": 1000,
    "defaultCurvature": 0.3,
    "visualizationEnabled": true,
    "slowMotion": false
  },
  "suites": [
    {
      "name": "테스트 스위트 이름",
      "description": "스위트 설명",
      "tests": [...]
    }
  ]
}
```

### 테스트 케이스 구조

```json
{
  "name": "테스트 이름",
  "description": "테스트 설명",
  "type": "drag",
  "simulation": {
    "from": "#start-element",
    "to": "#end-element",
    "duration": 1000,
    "curvature": 0.3,
    "dispatchEvents": true
  },
  "visualization": {
    "pathColor": "#667eea",
    "showCursor": true,
    "autoRemove": true,
    "removeDelay": 1000
  },
  "assert": {
    "type": "selector-exists",
    "selector": "#result-element"
  }
}
```

## 🔧 Simulation 옵션

### from/to 값

셀렉터 또는 좌표를 사용할 수 있습니다:

```json
// 셀렉터 사용
{
  "from": "#element",
  "to": ".target"
}

// 좌표 사용
{
  "from": { "x": 100, "y": 200 },
  "to": { "x": 300, "y": 400 }
}

// 혼합
{
  "from": "#element",
  "to": { "x": 300, "y": 400 }
}
```

### Position 옵션

요소 내 특정 위치 지정:

```json
{
  "from": "#element",
  "fromPosition": "center",
  "to": "#target",
  "toPosition": "top-left"
}
```

사용 가능한 위치:
- `center` (기본값)
- `top`, `bottom`, `left`, `right`
- `top-left`, `top-right`, `bottom-left`, `bottom-right`

### 기타 Simulation 옵션

```json
{
  "duration": 1000,          // 이동 시간 (ms)
  "curvature": 0.3,          // 경로 곡률 (0~1)
  "dispatchEvents": true     // 마우스 이벤트 디스패치
}
```

## 🎨 Visualization 옵션

```json
{
  "visualization": {
    "pathColor": "#667eea",   // 경로 색상
    "showCursor": true,        // 커서 표시
    "autoRemove": true,        // 자동 제거
    "removeDelay": 1000        // 제거 지연 (ms)
  }
}
```

## ✅ Assertion 타입

### 1. selector-exists

요소가 존재하는지 확인:

```json
{
  "assert": {
    "type": "selector-exists",
    "selector": "#result-element"
  }
}
```

### 2. selector-not-exists

요소가 존재하지 않는지 확인:

```json
{
  "assert": {
    "type": "selector-not-exists",
    "selector": "#deleted-element"
  }
}
```

### 3. has-class

요소가 특정 클래스를 가지고 있는지 확인:

```json
{
  "assert": {
    "type": "has-class",
    "selector": "#element",
    "expected": "active"
  }
}
```

### 4. not-has-class

요소가 특정 클래스를 가지고 있지 않은지 확인:

```json
{
  "assert": {
    "type": "not-has-class",
    "selector": "#element",
    "expected": "disabled"
  }
}
```

### 5. text-equals

요소의 텍스트가 정확히 일치하는지 확인:

```json
{
  "assert": {
    "type": "text-equals",
    "selector": "#message",
    "expected": "Success!"
  }
}
```

### 6. text-contains

요소의 텍스트에 특정 문자열이 포함되어 있는지 확인:

```json
{
  "assert": {
    "type": "text-contains",
    "selector": "#message",
    "expected": "Success"
  }
}
```

### 7. count-equals

특정 셀렉터와 일치하는 요소의 개수 확인:

```json
{
  "assert": {
    "type": "count-equals",
    "selector": ".item",
    "expected": 5
  }
}
```

### 8. count-greater-than

특정 셀렉터와 일치하는 요소가 기대값보다 많은지 확인:

```json
{
  "assert": {
    "type": "count-greater-than",
    "selector": ".item",
    "expected": 3
  }
}
```

### 9. custom

커스텀 JavaScript 함수로 검증:

```json
{
  "assert": {
    "type": "custom",
    "customFunction": "() => { return document.querySelector('#element').offsetWidth > 100; }"
  }
}
```

## ⚙️ Setup/Teardown

### Setup

테스트 실행 전 초기화:

```json
{
  "setup": {
    "resetFunction": "resetGame",     // 호출할 window 함수
    "waitTime": 200,                  // 대기 시간 (ms)
    "executeFunction": "initElements" // 추가 실행 함수
  }
}
```

### Teardown

테스트 실행 후 정리:

```json
{
  "teardown": {
    "executeFunction": "cleanup"
  }
}
```

### Suite Hooks

스위트 레벨에서 실행:

```json
{
  "beforeAll": {
    "executeFunction": "initGame",
    "waitTime": 500
  },
  "afterAll": {
    "executeFunction": "cleanup"
  },
  "beforeEach": {
    "executeFunction": "resetState",
    "waitTime": 100
  },
  "afterEach": {
    "executeFunction": "clearState"
  }
}
```

## 📝 완전한 예제

### Line Matching Test

```json
{
  "version": "1.0.0",
  "metadata": {
    "title": "Line Matching Tests",
    "description": "라인 매칭 게임 테스트",
    "author": "GSAP Kit",
    "tags": ["line-matching", "drag"]
  },
  "config": {
    "defaultDuration": 1000,
    "defaultCurvature": 0.3,
    "visualizationEnabled": true
  },
  "suites": [
    {
      "name": "Line Matching: Basic Tests",
      "description": "기본 드래그 연결 테스트",
      "beforeAll": {
        "executeFunction": "initGame",
        "waitTime": 500
      },
      "beforeEach": {
        "executeFunction": "resetGame",
        "waitTime": 200
      },
      "tests": [
        {
          "name": "Connect Apple to Apple",
          "type": "drag",
          "simulation": {
            "from": "#fruit-apple",
            "to": "#word-apple",
            "duration": 1000
          },
          "visualization": {
            "pathColor": "#4CAF50",
            "showCursor": true,
            "autoRemove": true
          },
          "assert": {
            "type": "custom",
            "customFunction": "() => { return window.correctCount > 0; }"
          }
        }
      ]
    }
  ]
}
```

### Draggable Test

```json
{
  "version": "1.0.0",
  "metadata": {
    "title": "Draggable Tests",
    "description": "드래그 기능 테스트"
  },
  "config": {
    "defaultDuration": 800,
    "defaultCurvature": 0.2,
    "visualizationEnabled": true
  },
  "suites": [
    {
      "name": "Draggable: Movement Tests",
      "tests": [
        {
          "name": "Drag box to right",
          "type": "drag",
          "simulation": {
            "from": ".draggable-box",
            "to": { "x": 200, "y": 0 }
          },
          "visualization": {
            "pathColor": "#667eea",
            "showCursor": true
          },
          "assert": {
            "type": "selector-exists",
            "selector": ".draggable-box"
          }
        }
      ]
    }
  ]
}
```

## 🚀 사용 방법

### 1. 브라우저에서 직접 실행

```javascript
// JSON 파일에서 로드
await loadAndRunSpec('/test-specs/my-test.spec.json');

// JSON 객체로 실행
const spec = {
  version: "1.0.0",
  suites: [...]
};
await loadAndRunInlineSpec(spec);
```

### 2. URL 파라미터로 자동 실행

```
http://localhost:8000/pages/spec-test/index.html?spec=/test-specs/line-matching.spec.json
```

### 3. Playwright E2E 테스트

```typescript
test('run JSON spec test', async ({ page }) => {
  await page.goto('http://localhost:8000/pages/spec-test/index.html');

  const result = await page.evaluate(async () => {
    return await window.loadAndRunSpec('/test-specs/my-test.spec.json');
  });

  expect(result.failed).toBe(0);
});
```

## 📊 결과 확인

테스트 실행 후 결과는 `window.__SPEC_TEST_RESULT__`에 저장됩니다:

```javascript
const result = window.__SPEC_TEST_RESULT__;

console.log('Total:', result.total);
console.log('Passed:', result.passed);
console.log('Failed:', result.failed);
console.log('Pass Rate:', result.passRate + '%');

// 각 스위트 결과
result.suites.forEach(suite => {
  console.log(suite.name, suite.passed + '/' + suite.total);
});
```

## 🎯 Best Practices

### 1. 명확한 이름 사용

```json
{
  "name": "Drag apple to correct position",
  "description": "사과를 정답 위치로 드래그하여 연결"
}
```

### 2. 적절한 대기 시간

```json
{
  "setup": {
    "resetFunction": "resetGame",
    "waitTime": 200  // DOM 업데이트 대기
  }
}
```

### 3. 시각화 활용

```json
{
  "visualization": {
    "pathColor": "#4CAF50",  // 의미있는 색상
    "showCursor": true,
    "autoRemove": true
  }
}
```

### 4. 점진적 테스트

간단한 테스트부터 시작하여 점진적으로 복잡한 시나리오로 확장

### 5. 재사용 가능한 스펙

공통 설정을 config에, 반복되는 패턴은 템플릿화

## 🔍 디버깅

### 콘솔 로그 확인

```javascript
// 브라우저 콘솔에서
window.__SPEC_TEST_RESULT__  // 최근 결과
window.specRunner            // SpecRunner 인스턴스
```

### 시각화 활성화

```json
{
  "config": {
    "visualizationEnabled": true,
    "slowMotion": true  // 느린 동작으로 확인
  }
}
```

### Custom Assert 디버깅

```json
{
  "assert": {
    "type": "custom",
    "customFunction": "() => { console.log('Checking...'); const result = ...; console.log('Result:', result); return result; }"
  }
}
```

## 📚 추가 리소스

- [테스트 스펙 예제 보기](../../test-specs/)
- [Spec Test Runner 페이지](http://localhost:8000/pages/spec-test/)
- [API 문서](../README.md)

## 💡 팁

1. **파일 구조**: 테스트 스펙은 `test-specs/` 디렉토리에 저장
2. **네이밍**: `{feature-name}.spec.json` 형식 사용
3. **버전 관리**: Git으로 테스트 스펙 버전 관리
4. **CI/CD**: Playwright와 통합하여 자동화
5. **문서화**: 각 스펙에 명확한 메타데이터 작성
