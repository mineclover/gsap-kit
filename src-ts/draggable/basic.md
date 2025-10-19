# basic.ts 스펙 정의

## 개요

기본적인 드래그 기능을 제공하는 함수 모음입니다. GSAP Draggable 플러그인을 활용하여 HTML 요소를 드래그 가능하게 만듭니다.

**핵심 원칙**: CSS 선택자만으로 쉽게 드래그 기능을 추가할 수 있어야 합니다.

## 함수 목록

### makeDraggable()

**목적**: 요소를 자유롭게 드래그 가능하게 만듭니다.

**사용 예시**:
```javascript
// 기본 사용
makeDraggable('.box');

// 옵션과 함께
makeDraggable('.box', {
  type: 'x,y',
  bounds: window,
  inertia: true,
  onDragStart: function() {
    console.log('드래그 시작!');
  }
});
```

**파라미터**:
- `target` (string | HTMLElement | NodeListOf<HTMLElement>): 대상 요소
- `options` (DraggableOptions, optional): 드래그 옵션
  - `type` ('x' | 'y' | 'x,y' | 'rotation'): 드래그 방향 (기본값: 'x,y')
  - `inertia` (boolean): 관성 효과 여부 (기본값: false)
  - `bounds` (Window | string | HTMLElement | DOMRect | object): 드래그 경계
  - `cursor` (string): 커서 스타일 (기본값: 'grab')
  - `onDragStart` (function): 드래그 시작 콜백
  - `onDrag` (function): 드래그 중 콜백
  - `onDragEnd` (function): 드래그 종료 콜백

**반환값**: `Draggable[]` - GSAP Draggable 인스턴스 배열

**동작 방식**:
1. target이 문자열이면 querySelectorAll로 요소 선택
2. 기본 옵션과 사용자 옵션 병합
3. Draggable.create() 호출하여 드래그 활성화
4. Draggable 인스턴스 배열 반환

---

### makeDraggableX()

**목적**: X축(가로)으로만 드래그 가능하게 만듭니다.

**사용 예시**:
```javascript
// 슬라이더 핸들
makeDraggableX('.slider-handle', {
  bounds: '.slider-track'
});
```

**파라미터**:
- `target` (string | HTMLElement | NodeListOf<HTMLElement>): 대상 요소
- `options` (DraggableOptions, optional): 드래그 옵션

**반환값**: `Draggable[]`

**동작 방식**:
- `makeDraggable()`을 호출하되 `type: 'x'` 옵션 강제 적용

---

### makeDraggableY()

**목적**: Y축(세로)으로만 드래그 가능하게 만듭니다.

**사용 예시**:
```javascript
// 수직 스크롤바
makeDraggableY('.scrollbar-thumb', {
  bounds: '.scrollbar-track'
});
```

**파라미터**:
- `target` (string | HTMLElement | NodeListOf<HTMLElement>): 대상 요소
- `options` (DraggableOptions, optional): 드래그 옵션

**반환값**: `Draggable[]`

**동작 방식**:
- `makeDraggable()`을 호출하되 `type: 'y'` 옵션 강제 적용

---

### makeDraggableWithBounds()

**목적**: 지정된 경계 내에서만 드래그 가능하게 만듭니다.

**사용 예시**:
```javascript
// 윈도우 경계 제한
makeDraggableWithBounds('.box');

// 특정 컨테이너 내 제한
makeDraggableWithBounds('.box', {
  bounds: '.container'
});
```

**파라미터**:
- `target` (string | HTMLElement | NodeListOf<HTMLElement>): 대상 요소
- `options` (DraggableOptions, optional): 드래그 옵션
  - `bounds` 기본값: `window`

**반환값**: `Draggable[]`

**동작 방식**:
- 기본 경계를 window로 설정
- 사용자가 지정한 경계가 있으면 우선 적용

---

### makeDraggableInParent()

**목적**: 부모 요소 내에서만 드래그 가능하게 만듭니다.

**사용 예시**:
```javascript
// 부모 요소 찾아서 자동 경계 설정
makeDraggableInParent('.child-box');
```

**파라미터**:
- `target` (string | HTMLElement): 대상 요소 (단일 요소만 지원)
- `options` (DraggableOptions, optional): 드래그 옵션

**반환값**: `Draggable[] | null`

**동작 방식**:
1. target 요소의 parentElement 찾기
2. 부모 요소가 없으면 에러 로그 후 null 반환
3. 부모 요소를 bounds로 설정하여 Draggable 생성

**주의사항**:
- 부모 요소가 position: relative 등으로 설정되어 있어야 정확한 경계 계산됨

---

### makeDraggableWithInertia()

**목적**: 관성(던지기) 효과와 함께 드래그 가능하게 만듭니다.

**사용 예시**:
```javascript
// 관성 효과
makeDraggableWithInertia('.box', {
  bounds: window
});
```

**파라미터**:
- `target` (string | HTMLElement | NodeListOf<HTMLElement>): 대상 요소
- `options` (DraggableOptions, optional): 드래그 옵션

**반환값**: `Draggable[]`

**동작 방식**:
1. **속도 추적**: 드래그 중 요소의 X/Y 속도를 실시간으로 계산
2. **던지기 효과**: 드래그 종료 시 속도가 0.5 이상이면 관성 효과 적용
3. **목표 위치 계산**: 속도 × 200 (multiplier) 로 던지기 목표 위치 계산
4. **경계 제한**: bounds가 설정되어 있으면 목표 위치를 경계 내로 클램핑(clamping)
   - Draggable의 `minX`, `minY`, `maxX`, `maxY` 속성 사용
   - 경계를 벗어나는 목표 위치는 자동으로 경계값으로 조정
5. **자동 감속**: `gsap.to()`로 `power2.out` easing을 사용하여 자연스러운 감속

**참고**:
- GSAP InertiaPlugin(유료)을 사용하지 않고 직접 구현한 관성 효과입니다
- 던지기 거리는 속도 × 200 (multiplier) 로 계산됩니다
- 속도 기준값(threshold)은 0.5입니다
- **바운더리 설정 시**: 던졌을 때 경계를 벗어나지 않고 경계에서 멈춥니다

---

### makeRotatable()

**목적**: 요소를 회전 가능하게 만듭니다.

**사용 예시**:
```javascript
// 로고 회전
makeRotatable('.logo');
```

**파라미터**:
- `target` (string | HTMLElement | NodeListOf<HTMLElement>): 대상 요소
- `options` (DraggableOptions, optional): 드래그 옵션

**반환값**: `Draggable[]`

**동작 방식**:
- `type: 'rotation'` 옵션 강제 적용
- 마우스/터치 움직임에 따라 요소가 회전

---

### disableDraggable()

**목적**: Draggable 인스턴스를 비활성화합니다.

**사용 예시**:
```javascript
const drag = makeDraggable('.box');
// 나중에 비활성화
disableDraggable(drag);
```

**파라미터**:
- `instances` (Draggable[] | null): Draggable 인스턴스 배열

**반환값**: void

**동작 방식**:
- 각 인스턴스의 `disable()` 메서드 호출
- 드래그 불가능 상태로 전환 (DOM은 유지)

---

### enableDraggable()

**목적**: 비활성화된 Draggable 인스턴스를 다시 활성화합니다.

**사용 예시**:
```javascript
const drag = makeDraggable('.box');
disableDraggable(drag);
// 나중에 다시 활성화
enableDraggable(drag);
```

**파라미터**:
- `instances` (Draggable[] | null): Draggable 인스턴스 배열

**반환값**: void

**동작 방식**:
- 각 인스턴스의 `enable()` 메서드 호출
- 드래그 가능 상태로 복원

---

### killDraggable()

**목적**: Draggable 인스턴스를 완전히 제거합니다.

**사용 예시**:
```javascript
const drag = makeDraggable('.box');
// 나중에 완전히 제거
killDraggable(drag);
```

**파라미터**:
- `instances` (Draggable[] | null): Draggable 인스턴스 배열

**반환값**: void

**동작 방식**:
- 각 인스턴스의 `kill()` 메서드 호출
- 이벤트 리스너 제거 및 메모리 해제

---

## 타입 정의

```typescript
interface DraggableOptions {
  type?: 'x' | 'y' | 'x,y' | 'rotation';
  inertia?: boolean;
  bounds?: Window | string | HTMLElement | DOMRect | {
    top?: number;
    left?: number;
    width?: number;
    height?: number
  };
  onDragStart?: (this: Draggable) => void;
  onDrag?: (this: Draggable) => void;
  onDragEnd?: (this: Draggable) => void;
  cursor?: string;
  activeCursor?: string;
  [key: string]: any; // GSAP Draggable의 다른 옵션들 허용
}
```

## 공통 패턴

### 기본값 관리
```typescript
const defaults: DraggableOptions = {
  type: 'x,y',
  inertia: false,
  cursor: 'grab'
};

const config = { ...defaults, ...options };
```

### 커서 스타일
- 기본: `cursor: 'grab'`
- 드래그 중: `activeCursor: 'grabbing'`

### 에러 처리
```typescript
if (!target) {
  console.error('[GSAP Kit] target이 필요합니다');
  return null;
}
```

## 사용 예시 모음

### 1. 기본 드래그
```javascript
makeDraggable('.box');
```

### 2. 가로 슬라이더
```javascript
makeDraggableX('.slider-handle', {
  bounds: '.slider-track'
});
```

### 3. 관성 효과
```javascript
makeDraggableWithInertia('.card', {
  bounds: window
});
```

### 4. 콜백 활용
```javascript
makeDraggable('.box', {
  onDragStart: function() {
    this.target.classList.add('dragging');
  },
  onDragEnd: function() {
    this.target.classList.remove('dragging');
  }
});
```

### 5. 인스턴스 제어
```javascript
const drag = makeDraggable('.box');

// 비활성화
disableDraggable(drag);

// 활성화
enableDraggable(drag);

// 제거
killDraggable(drag);
```

## 변경 이력

- 2025-10-19: TypeScript로 마이그레이션, 타입 안전성 추가
- 2025-10-19: 초기 스펙 정의
