# advanced.ts 스펙 정의

## 개요

고급 드래그 & 인터랙션 기능을 제공하는 함수 모음입니다. 그리드 스냅, 슬라이더, 정렬, 스와이프 등 복잡한 인터랙션 패턴을 간단하게 구현할 수 있습니다.

**핵심 원칙**: 복잡한 인터랙션도 선택자와 간단한 옵션만으로 구현 가능해야 합니다.

## 함수 목록

### makeDraggableSnap()

**목적**: 요소를 그리드에 스냅되도록 드래그 가능하게 만듭니다.

**사용 예시**:
```javascript
// 50px 그리드에 스냅
makeDraggableSnap('.box', {
  gridSize: 50
});

// 커스텀 스냅 함수
makeDraggableSnap('.box', {
  snapConfig: {
    x: (endValue) => Math.round(endValue / 100) * 100,
    y: (endValue) => Math.round(endValue / 50) * 50
  }
});
```

**파라미터**:
- `target` (string | HTMLElement | NodeListOf<HTMLElement>): 대상 요소
- `options` (SnapDraggableOptions, optional):
  - `gridSize` (number): 그리드 크기 픽셀 (기본값: 50)
  - `snapConfig` (SnapConfig): 커스텀 스냅 함수
    - `x` (function): X축 스냅 함수
    - `y` (function): Y축 스냅 함수
  - `bounds` (Window | string | HTMLElement | DOMRect | object): 드래그 경계
  - `inertia` (boolean): 관성 효과

**반환값**: `Draggable[]`

**동작 방식**:
1. gridSize 또는 snapConfig를 기반으로 스냅 함수 생성
2. **liveSnap 적용**: 드래그 중에도 그리드에 맞춰 이동 (실시간 스냅)
3. 드래그 종료 시 가장 가까운 그리드 포인트로 자동 정렬
4. 부드러운 애니메이션으로 스냅 위치 이동

**참고**:
- `liveSnap: true` 옵션이 적용되어 드래그 중에도 그리드 스냅이 작동합니다
- gridSize가 50이면 0, 50, 100, 150... 픽셀 위치에만 배치됩니다
- 디버깅 로그가 콘솔에 출력되므로 스냅 동작을 확인할 수 있습니다

---

### makeSlider()

**목적**: 슬라이더/레인지 컨트롤을 만듭니다.

**사용 예시**:
```javascript
// 가로 슬라이더
makeSlider('.slider-handle', {
  axis: 'x',
  min: 0,
  max: 100,
  step: 1,
  track: '.slider-track',
  onChange: (value) => {
    console.log('현재 값:', value);
    document.getElementById('output').textContent = value;
  }
});

// 세로 슬라이더 (볼륨 조절 등)
makeSlider('.volume-handle', {
  axis: 'y',
  min: 0,
  max: 100,
  onChange: (value) => {
    setVolume(value);
  }
});
```

**파라미터**:
- `target` (string | HTMLElement | NodeListOf<HTMLElement>): 슬라이더 핸들 요소
- `options` (SliderOptions, optional):
  - `axis` ('x' | 'y'): 슬라이더 방향 (기본값: 'x')
  - `min` (number): 최소값 (기본값: 0)
  - `max` (number): 최대값 (기본값: 100)
  - `step` (number): 스텝 값 (기본값: 1)
  - `track` (HTMLElement | string): 슬라이더 트랙 요소
  - `bounds` (Window | string | HTMLElement | DOMRect | object): 드래그 경계
  - `onChange` (function): 값 변경 시 콜백

**반환값**: `Draggable[]`

**동작 방식**:
1. 핸들의 위치를 min~max 범위의 값으로 매핑
2. step 값에 따라 반올림
3. 드래그 중 onChange 콜백 호출
4. track 요소가 있으면 자동으로 bounds 설정

**주의사항**:
- track 요소는 position: relative여야 정확한 경계 계산

---

### makeSortable()

**목적**: 드래그로 순서를 변경할 수 있는 정렬 가능한 리스트를 만듭니다.

**사용 예시**:
```javascript
// 기본 사용
makeSortable('.list-item', {
  onSort: (newOrder) => {
    console.log('새로운 순서:', newOrder);
    // 서버에 저장하거나 상태 업데이트
    saveOrder(newOrder);
  }
});
```

**파라미터**:
- `target` (string | NodeListOf<HTMLElement>): 정렬할 아이템들
- `options` (SortableOptions, optional):
  - `gap` (number): 아이템 간 간격 픽셀 (기본값: 10)
  - `onSort` (function): 정렬 완료 시 콜백 (newOrder: Element[])

**반환값**: `Draggable[] | null`

**동작 방식**:

**초기화**:
- 컨테이너를 `position: relative`로 설정
- 각 아이템을 `position: absolute`로 설정하고 DOM 순서에 따라 top 위치 계산
- 아이템 간 간격(gap)을 적용하여 위치 계산 ⭐
- 컨테이너 높이를 모든 아이템 높이의 합 + 간격으로 설정 ⭐

1. **드래그 시작 (onPress)**:
   - z-index를 높여 드래그 중인 요소를 최상단에 표시
   - **현재 DOM에서의 실제 인덱스를 동적으로 찾음** ⭐
   - 이전 드래그로 순서가 변경되었어도 정확한 위치 파악

2. **드래그 중 (onDrag)**:
   - type: 'x,y'로 자유롭게 드래그 가능 (flex 레이아웃 제약 없음) ⭐
   - **매번 현재 DOM 순서를 새로 가져옴** (Array.from(container.children)) ⭐
   - 드래그 위치에서 새로운 삽입 인덱스 계산
   - 다른 아이템들을 새로운 절대 위치(top)로 부드럽게 이동 (시각적 피드백) ⭐
   - **중요**: DOM 순서는 변경하지 않음 (드래그 중인 요소가 갑자기 이동하는 것 방지)

3. **드래그 종료 (onDragEnd)**:
   - 실제 DOM 순서를 새로운 인덱스에 맞게 변경
   - **순서가 변경된 경우**:
     - 모든 아이템의 절대 위치(top)를 DOM 순서와 간격(gap)에 맞게 재계산 ⭐
     - top, x, y를 새로운 위치로 부드럽게 애니메이션 (0.3초)
     - 컨테이너 높이 업데이트
   - **순서가 변경되지 않은 경우** (제자리에 놓음):
     - 원래 절대 위치로 복귀 (top, x, y)
   - onSort 콜백 호출

**개선 사항**:
- ✅ **절대 위치 기반 레이아웃** - flex/block 레이아웃에 의존하지 않음 ⭐
- ✅ **DOM 순서에 따른 고정된 위치** - 예측 가능하고 정확한 배치 ⭐
- ✅ **아이템 간 간격(gap) 지원** - 기본 10px, 커스터마이징 가능 ⭐
- ✅ 드래그 중 DOM 변경하지 않아 UX 개선
- ✅ 다른 아이템들을 절대 위치(top)로 애니메이션 이동
- ✅ 드래그 종료 시에만 실제 DOM 재정렬
- ✅ 여러 번 드래그해도 정확한 인덱스 추적 (동적 인덱스 계산)
- ✅ 깜빡임 없는 부드러운 재배치 애니메이션 ⭐
- ✅ 컨테이너 높이 자동 관리

**주의사항**:
- 컨테이너는 자동으로 `position: relative`로 설정됨
- 각 아이템은 자동으로 `position: absolute`로 설정됨
- 기존 CSS에서 아이템에 position 속성이 있으면 덮어씌워질 수 있음
- 컨테이너의 높이는 자동으로 계산되어 설정됨
- **⚠️ 중요**: 컨테이너에 `display: flex`, `display: grid` 등의 레이아웃 속성을 사용하지 마세요
  - 아이템이 `position: absolute`로 설정되므로 flex/grid 레이아웃이 적용되지 않습니다
  - 각 아이템의 위치는 절대 위치(top)로만 관리됩니다
  - 애니메이션 중 flex/grid가 자동 재배치를 시도하면 의도하지 않은 동작이 발생할 수 있습니다

**예시 HTML & CSS**:
```html
<ul class="sortable-list">
  <li class="list-item">항목 1</li>
  <li class="list-item">항목 2</li>
  <li class="list-item">항목 3</li>
</ul>
```

```css
/* ✅ 올바른 예시 - 컨테이너에 flex/grid 사용하지 않음 */
.sortable-list {
  /* position: relative는 자동으로 설정됨 */
  width: 100%;
  padding: 20px;
}

.list-item {
  /* position: absolute는 자동으로 설정됨 */
  padding: 15px;
  background: #f0f0f0;
  border-radius: 8px;
  cursor: grab;
}

/* ❌ 잘못된 예시 - 사용하지 마세요! */
.sortable-list {
  display: flex;           /* ❌ flex 사용 금지 */
  flex-direction: column;  /* ❌ */
  gap: 10px;              /* ❌ gap 대신 options.gap 사용 */
}

.sortable-list {
  display: grid;          /* ❌ grid 사용 금지 */
  grid-template-columns: 1fr; /* ❌ */
}
```

---

### makeSwipeable()

**목적**: 모바일 친화적인 스와이프 감지를 제공합니다.

**사용 예시**:
```javascript
// 카드 스와이프 (Tinder 스타일)
makeSwipeable('.card', {
  threshold: 80,
  onSwipeLeft: () => {
    console.log('왼쪽 스와이프 - 거절');
    rejectCard();
  },
  onSwipeRight: () => {
    console.log('오른쪽 스와이프 - 좋아요');
    likeCard();
  }
});

// 4방향 스와이프
makeSwipeable('.panel', {
  threshold: 60,
  onSwipeUp: () => showDetails(),
  onSwipeDown: () => hideDetails(),
  onSwipeLeft: () => nextItem(),
  onSwipeRight: () => prevItem()
});
```

**파라미터**:
- `target` (string | HTMLElement | NodeListOf<HTMLElement>): 대상 요소
- `options` (SwipeableOptions, optional):
  - `threshold` (number): 스와이프로 인식할 최소 거리 픽셀 (기본값: 50)
  - `onSwipeLeft` (function): 왼쪽 스와이프 콜백
  - `onSwipeRight` (function): 오른쪽 스와이프 콜백
  - `onSwipeUp` (function): 위 스와이프 콜백
  - `onSwipeDown` (function): 아래 스와이프 콜백

**반환값**: `Draggable[]`

**동작 방식**:
1. 드래그 시작 위치 저장
2. 드래그 종료 시 이동 거리 계산
3. threshold 이상 이동했으면 해당 방향 콜백 호출
4. 수평/수직 중 더 큰 이동 방향 선택
5. 원래 위치로 부드럽게 복귀 애니메이션

**주의사항**:
- 모바일에서는 터치 이벤트로 자동 처리
- 데스크톱에서도 마우스 드래그로 동작

---

### makeDraggableWithRange()

**목적**: 드래그 위치를 특정 범위의 값으로 매핑합니다.

**사용 예시**:
```javascript
// 투명도 조절
makeDraggableWithRange('.opacity-control', {
  axis: 'x',
  min: 0,
  max: 1,
  bounds: '.opacity-track',
  onUpdate: (value) => {
    document.querySelector('.target').style.opacity = value;
  }
});

// 색상 조절 (0-255)
makeDraggableWithRange('.color-slider', {
  axis: 'y',
  min: 0,
  max: 255,
  onUpdate: (value) => {
    updateColor(Math.round(value));
  }
});
```

**파라미터**:
- `target` (string | HTMLElement | NodeListOf<HTMLElement>): 대상 요소
- `options` (RangeDraggableOptions, optional):
  - `axis` ('x' | 'y'): 드래그 방향 (기본값: 'x')
  - `min` (number): 최소 출력값 (기본값: 0)
  - `max` (number): 최대 출력값 (기본값: 1)
  - `bounds` (Window | string | HTMLElement | DOMRect | object): 드래그 경계
  - `onUpdate` (function): 값 업데이트 콜백

**반환값**: `Draggable[]`

**동작 방식**:
1. 드래그 위치 (0 ~ bounds)를 min ~ max 범위로 선형 매핑
2. 드래그 중 실시간으로 onUpdate 콜백 호출
3. 매핑된 값 전달

**차이점 (vs makeSlider)**:
- `makeSlider`: step 값, onChange 콜백 (값 변경 시만)
- `makeDraggableWithRange`: onUpdate 콜백 (드래그 중 실시간)

---

## 타입 정의

```typescript
interface SnapConfig {
  x?: (endValue: number) => number;
  y?: (endValue: number) => number;
}

interface SnapDraggableOptions {
  gridSize?: number;
  snapConfig?: SnapConfig;
  bounds?: Window | string | HTMLElement | DOMRect | object;
  inertia?: boolean;
  onDragStart?: (this: Draggable) => void;
  onDrag?: (this: Draggable) => void;
  onDragEnd?: (this: Draggable) => void;
}

interface SliderOptions {
  axis?: 'x' | 'y';
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onDrag?: (this: Draggable) => void;
  onDragEnd?: (this: Draggable) => void;
  track?: HTMLElement | string;
  bounds?: Window | string | HTMLElement | DOMRect | object;
}

interface SortableOptions {
  gap?: number; // 아이템 간 간격 (픽셀)
  onSort?: (newOrder: Element[]) => void;
}

interface SwipeableOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface RangeDraggableOptions {
  axis?: 'x' | 'y';
  min?: number;
  max?: number;
  bounds?: Window | string | HTMLElement | DOMRect | object;
  onUpdate?: (value: number) => void;
}
```

## 사용 예시 모음

### 1. 그리드 레이아웃 (스냅)
```javascript
makeDraggableSnap('.grid-item', {
  gridSize: 100,
  bounds: '.grid-container'
});
```

### 2. 커스텀 슬라이더
```javascript
makeSlider('.volume-slider', {
  axis: 'y',
  min: 0,
  max: 100,
  track: '.volume-track',
  onChange: (value) => {
    audio.volume = value / 100;
    updateUI(value);
  }
});
```

### 3. 할 일 목록 정렬
```javascript
// 기본 간격 (10px)
makeSortable('.todo-item', {
  onSort: (newOrder) => {
    const ids = newOrder.map(el => el.dataset.id);
    saveTodoOrder(ids);
  }
});

// 커스텀 간격 (20px)
makeSortable('.todo-item', {
  gap: 20,
  onSort: (newOrder) => {
    const ids = newOrder.map(el => el.dataset.id);
    saveTodoOrder(ids);
  }
});
```

### 4. 이미지 갤러리 스와이프
```javascript
makeSwipeable('.gallery-image', {
  threshold: 100,
  onSwipeLeft: () => nextImage(),
  onSwipeRight: () => prevImage()
});
```

### 5. 밝기 조절
```javascript
makeDraggableWithRange('.brightness-control', {
  axis: 'x',
  min: 0,
  max: 200,
  onUpdate: (value) => {
    image.style.filter = `brightness(${value}%)`;
  }
});
```

## 변경 이력

- 2025-10-19: makeSortable() **문서화 개선** ⭐
  - flex/grid 레이아웃 사용 금지 주의사항 추가
  - 올바른 CSS 예시와 잘못된 CSS 예시 비교 추가
  - 절대 위치 기반 레이아웃 원리 명확화
- 2025-10-19: makeSortable() **깜빡임 제거 및 아이템 간격 추가** ⭐
  - opacity 페이드 인 효과 제거 (깜빡임 방지)
  - gap 옵션 추가 (기본값: 10px)
  - 모든 위치 계산에 gap 적용
- 2025-10-19: makeSortable() **절대 위치 기반으로 완전 재설계** ⭐
  - position: absolute로 각 아이템 배치
  - DOM 순서에 따라 top 위치 고정
  - flex 레이아웃 의존성 제거
  - type: 'x,y'로 자유로운 드래그
  - 컨테이너 높이 자동 관리
- 2025-10-19: makeSortable() 재배치 시 페이드 인 효과 개선 (opacity 0 → 1로 변경)
- 2025-10-19: makeSortable() 끊김 현상 해결 - 드래그된 아이템만 즉시 리셋, 나머지는 애니메이션
- 2025-10-19: makeSortable() 튕김 현상 해결 - transform 즉시 제거
- 2025-10-19: makeSortable() 동적 인덱스 추적 - 여러 번 드래그 시 정확도 개선
- 2025-10-19: makeSortable() UX 개선 - 드래그 중 DOM 변경 방지
- 2025-10-19: TypeScript로 마이그레이션, 타입 안전성 추가
- 2025-10-19: 초기 스펙 정의
