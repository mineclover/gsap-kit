/**
 * GSAP Kit - 고급 Draggable 함수 (TypeScript)
 */

/// <reference types="gsap" />

import { DOMTarget, BaseDraggableOptions, validateTarget, debug } from '../types';

/**
 * Draggable 플러그인 등록
 */
if (typeof gsap !== 'undefined' && typeof Draggable !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

/**
 * 스냅 설정 인터페이스
 */
interface SnapConfig {
  x?: (endValue: number) => number;
  y?: (endValue: number) => number;
}

/**
 * 그리드 스냅 드래그 옵션
 */
interface SnapDraggableOptions extends BaseDraggableOptions {
  gridSize?: number;
  snapConfig?: SnapConfig;
  inertia?: boolean;
}

/**
 * 슬라이더 옵션
 */
interface SliderOptions extends BaseDraggableOptions {
  axis?: 'x' | 'y';
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  track?: HTMLElement | string;
}

/**
 * 정렬 옵션
 */
interface SortableOptions {
  gap?: number; // 아이템 간 간격 (픽셀)
  onSort?: (newOrder: Element[]) => void;
}

/**
 * 스와이프 옵션
 */
interface SwipeableOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

/**
 * 범위 매핑 드래그 옵션
 */
interface RangeDraggableOptions {
  axis?: 'x' | 'y';
  min?: number;
  max?: number;
  bounds?: Window | string | HTMLElement | DOMRect | { top?: number; left?: number; width?: number; height?: number };
  onUpdate?: (value: number) => void;
}

/**
 * 그리드에 스냅되는 드래그 만들기
 */
export function makeDraggableSnap(
  target: DOMTarget,
  options: SnapDraggableOptions = {}
): Draggable[] {
  debug('makeDraggableSnap 호출됨:', { target, options });

  const defaults: SnapDraggableOptions = {
    gridSize: 50
  };

  const config = { ...defaults, ...options };
  debug('Grid Size:', config.gridSize);

  // 스냅 함수: 가장 가까운 그리드 포인트로 스냅
  const snapFunc = config.snapConfig || {
    x: function(endValue: number) {
      const snapped = Math.round(endValue / config.gridSize!) * config.gridSize!;
      debug('Snap X:', endValue, '→', snapped);
      return snapped;
    },
    y: function(endValue: number) {
      const snapped = Math.round(endValue / config.gridSize!) * config.gridSize!;
      debug('Snap Y:', endValue, '→', snapped);
      return snapped;
    }
  };

  debug('Draggable.create 호출 중...');
  const instances = Draggable.create(target, {
    type: 'x,y',
    bounds: config.bounds,
    inertia: config.inertia || false,
    snap: {
      x: snapFunc.x,
      y: snapFunc.y
    },
    liveSnap: true, // 드래그 중에도 스냅 적용
    onDragStart: config.onDragStart,
    onDrag: config.onDrag,
    onDragEnd: function(this: Draggable) {
      debug('Drag End - Final Position:', this.x, this.y);
      if (config.onDragEnd) {
        config.onDragEnd.call(this);
      }
    },
    cursor: 'grab',
    activeCursor: 'grabbing'
  });

  debug('Draggable 인스턴스 생성됨:', instances);
  return instances;
}

/**
 * 슬라이더 만들기 (가로 또는 세로)
 */
export function makeSlider(
  target: DOMTarget,
  options: SliderOptions = {}
): Draggable[] {
  const defaults: SliderOptions = {
    axis: 'x',
    min: 0,
    max: 100,
    step: 1
  };

  const config = { ...defaults, ...options };
  const isHorizontal = config.axis === 'x';

  // 트랙 요소 가져오기
  const trackElement = config.track
    ? (typeof config.track === 'string' ? document.querySelector(config.track) as HTMLElement : config.track)
    : null;

  return Draggable.create(target, {
    type: config.axis,
    bounds: config.bounds || (trackElement ? trackElement : undefined),
    onDrag: function(this: Draggable) {
      if (config.onChange) {
        // 현재 위치를 값으로 변환
        const bounds = this.maxX || this.maxY || (isHorizontal ? 100 : 100);
        const current = isHorizontal ? this.x : this.y;
        const percentage = current / bounds;
        const value = config.min! + (percentage * (config.max! - config.min!));
        const steppedValue = Math.round(value / config.step!) * config.step!;

        config.onChange(steppedValue);
      }

      if (config.onDrag) {
        config.onDrag.call(this);
      }
    },
    onDragEnd: config.onDragEnd,
    cursor: 'grab',
    activeCursor: 'grabbing'
  });
}

/**
 * 정렬 가능한 리스트 만들기 (드래그로 순서 변경)
 */
export function makeSortable(
  target: DOMTarget,
  options: SortableOptions = {}
): Draggable[] | null {
  // 요소 리스트 가져오기
  let items: NodeListOf<Element> | HTMLElement[];

  if (typeof target === 'string') {
    items = document.querySelectorAll(target);
  } else if (target instanceof NodeList) {
    items = target;
  } else if (Array.isArray(target)) {
    items = target;
  } else {
    // 단일 HTMLElement인 경우 배열로 변환
    items = [target];
  }

  const container = (items[0] as HTMLElement)?.parentElement;

  if (!container) {
    console.error('[GSAP Kit] 정렬 가능한 아이템을 찾을 수 없습니다');
    return null;
  }

  const gap = options.gap || 10; // 기본 간격 10px

  // 컨테이너를 relative로 설정 (절대 위치 기준)
  const containerStyle = getComputedStyle(container);
  if (containerStyle.position === 'static') {
    container.style.position = 'relative';
  }

  // 각 아이템의 초기 위치 계산 및 절대 위치 설정
  const updatePositions = () => {
    const allItems = Array.from(container.children) as HTMLElement[];
    let currentTop = 0;

    allItems.forEach((item, index) => {
      const height = item.offsetHeight;

      gsap.set(item, {
        position: 'absolute',
        top: currentTop,
        left: 0,
        width: '100%'
      });

      currentTop += height + gap;
    });

    // 컨테이너 높이 설정 (마지막 gap 제외)
    container.style.height = (currentTop - gap) + 'px';
  };

  // 초기 위치 설정
  updatePositions();

  const draggables: Draggable[] = [];
  let newIndex = -1; // 드래그 중 새로운 인덱스 추적
  let originalIndex = -1; // 드래그 시작 시 현재 인덱스

  // 배열로 변환 후 forEach
  Array.from(items).forEach((item: Element) => {
    const draggable = Draggable.create(item, {
      type: 'x,y',
      onPress: function(this: Draggable) {
        // 드래그 시작 시 z-index 높이기
        (this.target as HTMLElement).style.zIndex = '1000';

        // 현재 DOM에서의 실제 인덱스 찾기
        const allItems = Array.from(container.children);
        originalIndex = allItems.indexOf(this.target as Element);
        newIndex = originalIndex;
      },
      onDrag: function(this: Draggable) {
        // 드래그 중인 요소의 중심 위치
        const thisRect = (this.target as HTMLElement).getBoundingClientRect();
        const thisCenterY = thisRect.top + thisRect.height / 2;

        // 현재 DOM 순서 가져오기
        const currentItems = Array.from(container.children) as HTMLElement[];

        // 현재 드래그 위치에서 삽입될 인덱스 계산
        let insertIndex = 0;

        currentItems.forEach((otherItem, j) => {
          if (otherItem === this.target) return;

          const otherRect = otherItem.getBoundingClientRect();
          const otherCenterY = otherRect.top + otherRect.height / 2;

          if (thisCenterY > otherCenterY) {
            insertIndex = j + 1;
          }
        });

        // 인덱스가 변경되었을 때만 다른 아이템들 이동
        if (insertIndex !== newIndex) {
          newIndex = insertIndex;

          // 새로운 순서에 따른 위치 재계산
          const draggedHeight = (this.target as HTMLElement).offsetHeight;
          let calculatedTop = 0;

          currentItems.forEach((otherItem, j) => {
            if (otherItem === this.target) return;

            // newIndex 위치에 드래그 중인 아이템 공간 확보
            if (j === newIndex && j > originalIndex) {
              calculatedTop += draggedHeight + gap;
            }

            gsap.to(otherItem, {
              top: calculatedTop,
              duration: 0.2,
              ease: 'power2.out'
            });

            calculatedTop += otherItem.offsetHeight + gap;

            if (j === newIndex - 1 && j < originalIndex) {
              calculatedTop += draggedHeight + gap;
            }
          });
        }
      },
      onDragEnd: function(this: Draggable) {
        // 드래그 종료 시 z-index 제거
        (this.target as HTMLElement).style.zIndex = '';

        // 실제 DOM 순서 변경
        if (newIndex !== originalIndex && newIndex >= 0) {
          const allItemsArray = Array.from(container.children);

          // 드래그한 요소를 새 위치에 삽입
          if (newIndex >= allItemsArray.length) {
            container.appendChild(this.target as Node);
          } else {
            container.insertBefore(this.target as Node, allItemsArray[newIndex] as Node);
          }

          // 재배치 후 모든 아이템 위치 재설정
          const allItems = Array.from(container.children) as HTMLElement[];
          let newTop = 0;

          allItems.forEach((item) => {
            const height = item.offsetHeight;

            gsap.to(item, {
              top: newTop,
              x: 0,
              y: 0,
              duration: 0.3,
              ease: 'power2.out'
            });

            newTop += height + gap;
          });

          // 컨테이너 높이 업데이트 (마지막 gap 제외)
          container.style.height = (newTop - gap) + 'px';
        } else {
          // 순서가 변경되지 않은 경우 (제자리에 놓음)
          // 원래 위치로 복귀
          const allItems = Array.from(container.children) as HTMLElement[];
          let newTop = 0;

          allItems.forEach((item) => {
            gsap.to(item as HTMLElement, {
              top: newTop,
              x: 0,
              y: 0,
              duration: 0.3,
              ease: 'power2.out'
            });

            newTop += (item as HTMLElement).offsetHeight + gap;
          });
        }

        // 정렬 콜백 호출
        if (options.onSort) {
          const newOrder = Array.from(container.children);
          options.onSort(newOrder);
        }

        newIndex = -1;
        originalIndex = -1;
      }
    })[0];

    draggables.push(draggable);
  });

  return draggables;
}

/**
 * 스와이프 감지 (모바일 친화적)
 */
export function makeSwipeable(
  target: DOMTarget,
  options: SwipeableOptions = {}
): Draggable[] {
  const defaults: SwipeableOptions = {
    threshold: 50
  };

  const config = { ...defaults, ...options };
  let startX = 0;
  let startY = 0;

  return Draggable.create(target, {
    type: 'x,y',
    onDragStart: function(this: Draggable) {
      startX = this.x;
      startY = this.y;
    },
    onDragEnd: function(this: Draggable) {
      const deltaX = this.x - startX;
      const deltaY = this.y - startY;

      // 수평 스와이프
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > config.threshold! && config.onSwipeRight) {
          config.onSwipeRight();
        } else if (deltaX < -config.threshold! && config.onSwipeLeft) {
          config.onSwipeLeft();
        }
      }
      // 수직 스와이프
      else {
        if (deltaY > config.threshold! && config.onSwipeDown) {
          config.onSwipeDown();
        } else if (deltaY < -config.threshold! && config.onSwipeUp) {
          config.onSwipeUp();
        }
      }

      // 원래 위치로 되돌리기
      gsap.to(this.target, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  });
}

/**
 * 범위를 지정하여 값을 매핑하는 드래그
 */
export function makeDraggableWithRange(
  target: DOMTarget,
  options: RangeDraggableOptions = {}
): Draggable[] {
  const defaults: RangeDraggableOptions = {
    axis: 'x',
    min: 0,
    max: 1
  };

  const config = { ...defaults, ...options };

  return Draggable.create(target, {
    type: config.axis,
    bounds: config.bounds,
    onDrag: function(this: Draggable) {
      const bounds = config.axis === 'x' ? this.maxX : this.maxY;
      const current = config.axis === 'x' ? this.x : this.y;
      const value = config.min! + ((current / bounds) * (config.max! - config.min!));

      if (config.onUpdate) {
        config.onUpdate(value);
      }
    }
  });
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).makeDraggableSnap = makeDraggableSnap;
  (window as any).makeSlider = makeSlider;
  (window as any).makeSortable = makeSortable;
  (window as any).makeSwipeable = makeSwipeable;
  (window as any).makeDraggableWithRange = makeDraggableWithRange;
}
