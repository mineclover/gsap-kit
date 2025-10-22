# Phase 2.1: GSAP Animation Assertions

## 목표
JSON 스펙에서 GSAP 애니메이션의 상태와 속성을 검증할 수 있는 assertion 시스템 구축

## 구현 범위

### 1. GSAP Assertion Types

```typescript
type GSAPAssertionType =
  | 'gsap-is-animating'      // 애니메이션 진행 중인지
  | 'gsap-is-paused'         // 애니메이션 일시정지 상태인지
  | 'gsap-progress'          // 진행도 (0~1)
  | 'gsap-duration'          // 지속 시간
  | 'gsap-property-value'    // 특정 CSS 속성 값
  | 'gsap-transform'         // transform 속성 (x, y, rotation, scale 등)
  | 'gsap-timeline-state';   // 타임라인 상태
```

### 2. Assertion 옵션

```typescript
interface GSAPAssertionOptions {
  // 기본
  type: GSAPAssertionType;
  selector: string;           // 대상 요소

  // gsap-property-value용
  property?: string;          // 검증할 CSS 속성
  expected?: any;             // 기대값
  tolerance?: number;         // 허용 오차 (숫자 값)

  // gsap-progress용
  minProgress?: number;       // 최소 진행도
  maxProgress?: number;       // 최대 진행도

  // gsap-transform용
  transformProperty?: 'x' | 'y' | 'rotation' | 'scale' | 'scaleX' | 'scaleY';

  // 타이밍
  waitForAnimation?: boolean; // 애니메이션 완료 대기
  timeout?: number;           // 대기 타임아웃
}
```

### 3. JSON 스펙 예시

```json
{
  "name": "Fade animation completes",
  "type": "hover",
  "simulation": {
    "target": ".fade-box",
    "hoverDuration": 500
  },
  "assert": {
    "type": "gsap-property-value",
    "selector": ".fade-box",
    "property": "opacity",
    "expected": 1,
    "tolerance": 0.1,
    "waitForAnimation": true
  }
}
```

```json
{
  "name": "Element is animating on hover",
  "type": "hover",
  "simulation": {
    "target": ".animated-box",
    "hoverDuration": 100
  },
  "assert": {
    "type": "gsap-is-animating",
    "selector": ".animated-box"
  }
}
```

```json
{
  "name": "Transform X reaches target",
  "type": "drag",
  "simulation": {
    "from": ".draggable",
    "to": { "x": 200, "y": 0 }
  },
  "assert": {
    "type": "gsap-transform",
    "selector": ".draggable",
    "transformProperty": "x",
    "expected": 200,
    "tolerance": 5
  }
}
```

### 4. 테스트 페이지: gsap-test

새로운 페이지 `pages/gsap-test/` 생성:

**시나리오:**
1. **Fade Animation** - opacity 변화 검증
2. **Slide Animation** - transform X/Y 검증
3. **Scale Animation** - scale 검증
4. **Rotation Animation** - rotation 검증
5. **Timeline Control** - 타임라인 상태 검증
6. **Progress Tracking** - 진행도 검증

### 5. 구현 파일

#### 새 파일
- `src/lib/testing/gsap-assertions.ts` - GSAP assertion 유틸리티
- `src/pages/gsap-test/index.html` - 테스트 페이지
- `src/pages/gsap-test/main.ts` - GSAP 애니메이션 로직
- `src/pages/gsap-test/style.css` - 스타일
- `test-specs/gsap.spec.json` - GSAP 테스트 스펙
- `tests/e2e/gsap-spec.spec.ts` - Playwright 테스트

#### 수정 파일
- `src/lib/testing/spec-loader.ts` - GSAP assertion 지원
- `src/lib/testing/index.ts` - export 추가

## 구현 단계

1. ✅ **문서 작성** (현재)
   - Phase 2.1 계획서 작성

2. **GSAP Assertion 유틸리티**
   - gsap-assertions.ts 작성
   - GSAP 상태 읽기 함수들
   - 속성 비교 헬퍼

3. **SpecLoader 확장**
   - GSAP assertion 타입 파싱
   - 검증 로직 통합

4. **테스트 페이지 생성**
   - pages/gsap-test/ 구조 생성
   - 6가지 애니메이션 시나리오 구현

5. **JSON 스펙 작성**
   - gsap.spec.json 작성
   - 다양한 GSAP assertion 케이스

6. **Playwright 테스트**
   - gsap-spec.spec.ts 작성
   - E2E 검증

7. **통합 테스트**
   - 모든 assertion 타입 검증
   - 허용 오차 테스트
   - 타임아웃 처리

8. **커밋**
   - feat: Phase 2.1 - GSAP animation assertions

## GSAP API 활용

```typescript
// GSAP Tween 가져오기
const tweens = gsap.getTweensOf(element);

// 애니메이션 상태
tween.isActive();      // 진행 중
tween.paused();        // 일시정지
tween.progress();      // 진행도 (0~1)
tween.duration();      // 지속 시간

// 속성 값 가져오기
gsap.getProperty(element, 'opacity');
gsap.getProperty(element, 'x');
gsap.getProperty(element, 'rotation');

// Timeline
timeline.isActive();
timeline.progress();
timeline.paused();
```

## 성공 기준

- [ ] 6가지 GSAP assertion 타입 구현
- [ ] gsap.spec.json 테스트 100% 통과
- [ ] 허용 오차(tolerance) 정상 작동
- [ ] waitForAnimation 옵션 정상 작동
- [ ] Transform 속성 정확한 검증
- [ ] Playwright E2E 테스트 통과

## 다음 단계

Phase 2.1 완료 후 → Phase 2.2 (Performance Assertions) 또는 Phase 3.1 (Relative Coordinates)
