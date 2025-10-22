# GSAP Kit 테스트 시스템 고도화 로드맵

## 현재 상태 (v1.0)

### ✅ 구현 완료
- JSON 기반 테스트 스펙 정의
- 드래그 시뮬레이션 (Bezier 곡선 경로)
- 클릭 시뮬레이션
- 경로 시각화 (PathVisualizer)
- 9가지 assertion 타입
- beforeAll/afterAll/beforeEach/afterEach 훅
- line-matching 테스트 (100% 통과)

### ⚠️ 현재 한계점

1. **시뮬레이션 타입 제한**
   - 지원: `drag`, `click`만 가능
   - 미지원: `hover`, `scroll`, `keyboard`, `multi-touch`

2. **Assertion 제한**
   - DOM 속성 체크만 가능
   - GSAP 애니메이션 상태 체크 불가
   - 성능 메트릭 측정 불가

3. **좌표 시스템 제한**
   - 상대 좌표(`{ x: +100, y: +50 }`) 미지원
   - 뷰포트 퍼센트(`{ x: "50%", y: "50%" }`) 미지원

4. **타이밍 제어 제한**
   - 애니메이션 완료 대기 불가
   - 프레임 단위 제어 불가

---

## Phase 1: 시뮬레이션 타입 확장

### 1.1 Hover 시뮬레이션
```json
{
  "type": "hover",
  "simulation": {
    "target": ".hover-element",
    "duration": 500
  },
  "assert": {
    "type": "has-class",
    "selector": ".hover-element",
    "expected": "hovered"
  }
}
```

**구현 요소:**
- MouseSimulator에 `hover()` 메서드 추가
- `mouseenter` → 대기 → `mouseleave` 이벤트 시퀀스

### 1.2 Scroll 시뮬레이션
```json
{
  "type": "scroll",
  "simulation": {
    "target": "window",
    "to": { "y": 500 },
    "duration": 1000,
    "smooth": true
  },
  "assert": {
    "type": "custom",
    "customFunction": "() => window.scrollY >= 500"
  }
}
```

**구현 요소:**
- ScrollSimulator 클래스 생성
- GSAP ScrollTrigger 이벤트 트리거
- 스크롤 애니메이션 곡선 지원

### 1.3 Keyboard 시뮬레이션
```json
{
  "type": "keyboard",
  "simulation": {
    "target": "input#search",
    "keys": ["H", "e", "l", "l", "o"],
    "interval": 100
  },
  "assert": {
    "type": "text-equals",
    "selector": "input#search",
    "expected": "Hello"
  }
}
```

---

## Phase 2: Assertion 시스템 고도화

### 2.1 GSAP 애니메이션 Assertion
```json
{
  "assert": {
    "type": "gsap-animation",
    "selector": ".animated-box",
    "checks": {
      "isAnimating": true,
      "progress": { "min": 0.5, "max": 1.0 },
      "x": { "expected": 100, "tolerance": 5 }
    }
  }
}
```

**구현 요소:**
- GSAP 트윈 상태 체크
- gsap.getTweensOf() 활용
- 애니메이션 프로퍼티 검증

### 2.2 성능 Assertion
```json
{
  "assert": {
    "type": "performance",
    "checks": {
      "fps": { "min": 50 },
      "duration": { "max": 2000 },
      "memoryDelta": { "max": 10000000 }
    }
  }
}
```

### 2.3 비주얼 Regression
```json
{
  "assert": {
    "type": "visual-snapshot",
    "selector": ".rendered-output",
    "baseline": "snapshots/baseline.png",
    "threshold": 0.1
  }
}
```

---

## Phase 3: 좌표 시스템 확장

### 3.1 상대 좌표
```json
{
  "simulation": {
    "from": "#start",
    "to": { "x": "+100", "y": "-50" }  // 시작점으로부터 상대적
  }
}
```

### 3.2 뷰포트 기준
```json
{
  "simulation": {
    "from": { "x": "50vw", "y": "50vh" },
    "to": { "x": "80vw", "y": "80vh" }
  }
}
```

### 3.3 엘리먼트 간 상대 위치
```json
{
  "simulation": {
    "from": { "element": "#box1", "offset": { "x": 10, "y": 10 } },
    "to": { "element": "#box2", "position": "center" }
  }
}
```

---

## Phase 4: 타이밍 & 동기화

### 4.1 애니메이션 대기
```json
{
  "wait": {
    "type": "animation",
    "selector": ".animated-box",
    "timeout": 3000
  }
}
```

### 4.2 조건부 대기
```json
{
  "wait": {
    "type": "condition",
    "condition": "() => document.querySelector('.loaded').classList.contains('ready')",
    "timeout": 5000,
    "interval": 100
  }
}
```

### 4.3 병렬 실행
```json
{
  "tests": [
    {
      "name": "Parallel Test Group",
      "type": "parallel",
      "subtests": [
        { "type": "drag", "from": "#item1", "to": "#target1" },
        { "type": "drag", "from": "#item2", "to": "#target2" }
      ],
      "assert": {
        "type": "custom",
        "customFunction": "() => allItemsInTargets()"
      }
    }
  ]
}
```

---

## Phase 5: 고급 기능

### 5.1 테스트 데이터 생성
```json
{
  "dataGenerator": {
    "type": "faker",
    "schema": {
      "name": "{{name.firstName}}",
      "email": "{{internet.email}}",
      "age": "{{number.int({ min: 18, max: 99 })}}"
    },
    "count": 10
  }
}
```

### 5.2 스냅샷 테스팅
```json
{
  "assert": {
    "type": "snapshot",
    "selector": ".component",
    "snapshot": "component-state-v1.json",
    "properties": ["innerHTML", "className", "dataset"]
  }
}
```

### 5.3 네트워크 모킹
```json
{
  "mock": {
    "type": "network",
    "url": "/api/users",
    "response": { "users": [...] },
    "delay": 100
  }
}
```

---

## 우선순위 제안

### 🔥 High Priority (즉시 적용 가능)
1. ✅ **Phase 1.1**: Hover 시뮬레이션
2. ✅ **Phase 2.1**: GSAP 애니메이션 Assertion
3. ✅ **Phase 3.1**: 상대 좌표 지원

### 🟡 Medium Priority (1-2주 내)
4. **Phase 1.2**: Scroll 시뮬레이션
5. **Phase 4.1**: 애니메이션 대기
6. **Phase 2.2**: 성능 Assertion

### 🔵 Low Priority (향후 고려)
7. **Phase 1.3**: Keyboard 시뮬레이션
8. **Phase 5**: 고급 기능들

---

## 다음 단계

어떤 Phase를 먼저 구현할까요?

1. **Hover 시뮬레이션** (가장 빠르게 적용 가능)
2. **GSAP 애니메이션 Assertion** (GSAP Kit에 특화)
3. **Scroll 시뮬레이션** (많은 페이지에 활용 가능)

선택해주시면 바로 구현을 시작하겠습니다!
