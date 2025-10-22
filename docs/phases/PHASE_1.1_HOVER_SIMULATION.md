# Phase 1.1: Hover Simulation Implementation

## 목표
MouseSimulator에 hover 시뮬레이션 기능을 추가하여 마우스 호버 인터랙션을 테스트할 수 있도록 한다.

## 구현 범위

### 1. 새로운 TestCaseType 추가
```typescript
type TestCaseType = 'drag' | 'click' | 'hover';
```

### 2. Hover 시뮬레이션 옵션
```typescript
interface HoverSimulationOptions {
  target: string;                    // 호버할 요소 셀렉터
  targetPosition?: PositionType;     // 요소 내 호버 위치
  enterDuration?: number;            // 진입 애니메이션 시간
  hoverDuration?: number;            // 호버 지속 시간
  exitDuration?: number;             // 탈출 애니메이션 시간
  from?: string | { x: number; y: number };  // 시작 위치 (선택)
}
```

### 3. 이벤트 시퀀스
1. **진입 단계** (enterDuration)
   - from → target으로 `mousemove` 이벤트 시퀀스
   - target에 도달하면 `mouseenter` 이벤트 발생

2. **호버 단계** (hoverDuration)
   - target 위에서 대기
   - `mouseover` 이벤트 발생 (버블링)

3. **탈출 단계** (exitDuration)
   - `mouseleave` 이벤트 발생
   - target → 밖으로 `mousemove` 이벤트 시퀀스
   - `mouseout` 이벤트 발생 (버블링)

### 4. JSON 스펙 예시
```json
{
  "name": "Hover on button shows tooltip",
  "type": "hover",
  "simulation": {
    "target": ".hover-button",
    "targetPosition": "center",
    "hoverDuration": 500
  },
  "assert": {
    "type": "selector-exists",
    "selector": ".tooltip.visible"
  }
}
```

## 테스트 환경

### 테스트 페이지: hover-test
새로운 페이지 `pages/hover-test/` 생성:
- 호버 시 툴팁 표시
- 호버 시 배경색 변경
- 호버 시 스케일 애니메이션
- 중첩된 호버 (부모-자식)

### 테스트 스펙: hover.spec.json
```json
{
  "suites": [
    {
      "name": "Hover: Tooltip Display",
      "tests": [
        {
          "name": "Show tooltip on hover",
          "type": "hover",
          "simulation": {
            "target": "#tooltip-trigger",
            "hoverDuration": 500
          },
          "assert": {
            "type": "has-class",
            "selector": ".tooltip",
            "expected": "visible"
          }
        }
      ]
    },
    {
      "name": "Hover: Style Changes",
      "tests": [
        {
          "name": "Background color changes on hover",
          "type": "hover",
          "simulation": {
            "target": ".hover-box",
            "hoverDuration": 300
          },
          "assert": {
            "type": "has-class",
            "selector": ".hover-box",
            "expected": "hovered"
          }
        }
      ]
    }
  ]
}
```

## 구현 단계

1. ✅ **문서 작성** (현재)
   - Phase 1.1 계획서 작성

2. **TypeScript 타입 확장**
   - TestCaseType에 'hover' 추가
   - HoverSimulationOptions 인터페이스 정의

3. **MouseSimulator 확장**
   - `simulateHover()` 메서드 구현
   - 이벤트 시퀀스 로직 구현

4. **SpecLoader 업데이트**
   - hover 타입 스펙 파싱 지원
   - 옵션 검증 추가

5. **테스트 페이지 생성**
   - pages/hover-test/ 생성
   - 다양한 호버 인터랙션 구현

6. **테스트 스펙 작성**
   - test-specs/hover.spec.json 작성

7. **통합 테스트**
   - 모든 테스트 통과 확인
   - 수동 검증

8. **커밋**
   - feat: Phase 1.1 - Hover simulation support

## 예상 파일 변경

### 새 파일
- `docs/phases/PHASE_1.1_HOVER_SIMULATION.md`
- `src/pages/hover-test/index.html`
- `src/pages/hover-test/main.ts`
- `src/pages/hover-test/style.css`
- `test-specs/hover.spec.json`
- `tests/test-hover-spec.js`

### 수정 파일
- `src/lib/testing/test-runner.ts` (TestCaseType)
- `src/lib/testing/mouse-simulator.ts` (simulateHover)
- `src/lib/testing/spec-loader.ts` (hover spec 파싱)

## 성공 기준
- [ ] hover 타입 테스트가 JSON 스펙에서 실행됨
- [ ] mouseenter/mouseleave/mouseover/mouseout 이벤트가 올바르게 발생
- [ ] hover.spec.json의 모든 테스트 통과 (100%)
- [ ] 시각화가 올바르게 동작 (진입/호버/탈출 경로 표시)

## 다음 단계
Phase 1.1 완료 후 → Phase 2.1 (GSAP Animation Assertions)
