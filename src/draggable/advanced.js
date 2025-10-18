/**
 * GSAP Kit - 고급 Draggable 함수
 */

/**
 * 그리드에 스냅되는 드래그 만들기
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 드래그 옵션
 * @param {number} [options.gridSize=50] - 그리드 크기 (픽셀)
 * @param {Object} [options.snapConfig] - 커스텀 스냅 설정
 * @returns {Array<Draggable>}
 */
function makeDraggableSnap(target, options = {}) {
  const defaults = {
    gridSize: 50
  };

  const config = { ...defaults, ...options };

  // 스냅 함수: 가장 가까운 그리드 포인트로 스냅
  const snapFunc = config.snapConfig || {
    x: function(endValue) {
      return Math.round(endValue / config.gridSize) * config.gridSize;
    },
    y: function(endValue) {
      return Math.round(endValue / config.gridSize) * config.gridSize;
    }
  };

  return Draggable.create(target, {
    type: "x,y",
    bounds: config.bounds,
    inertia: config.inertia || false,
    snap: snapFunc,
    onDragStart: config.onDragStart,
    onDrag: config.onDrag,
    onDragEnd: config.onDragEnd,
    cursor: "grab",
    activeCursor: "grabbing"
  });
}

/**
 * 슬라이더 만들기 (가로 또는 세로)
 * @param {string|HTMLElement} target - 드래그할 핸들 요소
 * @param {Object} options - 슬라이더 옵션
 * @param {string} [options.axis="x"] - 축 ("x" 또는 "y")
 * @param {number} [options.min=0] - 최소값
 * @param {number} [options.max=100] - 최대값
 * @param {number} [options.step=1] - 스텝 값
 * @param {Function} [options.onChange] - 값 변경 시 콜백 (value) => {}
 * @param {HTMLElement|string} [options.track] - 슬라이더 트랙 요소
 * @returns {Array<Draggable>}
 */
function makeSlider(target, options = {}) {
  const defaults = {
    axis: "x",
    min: 0,
    max: 100,
    step: 1
  };

  const config = { ...defaults, ...options };
  const isHorizontal = config.axis === "x";

  // 트랙 요소 가져오기
  const trackElement = config.track
    ? (typeof config.track === 'string' ? document.querySelector(config.track) : config.track)
    : null;

  return Draggable.create(target, {
    type: config.axis,
    bounds: config.bounds || (trackElement ? trackElement : undefined),
    onDrag: function() {
      if (config.onChange) {
        // 현재 위치를 값으로 변환
        const bounds = this.maxX || this.maxY || (isHorizontal ? 100 : 100);
        const current = isHorizontal ? this.x : this.y;
        const percentage = current / bounds;
        const value = config.min + (percentage * (config.max - config.min));
        const steppedValue = Math.round(value / config.step) * config.step;

        config.onChange(steppedValue);
      }

      if (config.onDrag) {
        config.onDrag.call(this);
      }
    },
    onDragEnd: config.onDragEnd,
    cursor: "grab",
    activeCursor: "grabbing"
  });
}

/**
 * 정렬 가능한 리스트 만들기 (드래그로 순서 변경)
 * @param {string|HTMLElement} target - 정렬할 아이템들
 * @param {Object} options - 정렬 옵션
 * @param {Function} [options.onSort] - 정렬 변경 시 콜백
 * @returns {Array<Draggable>}
 */
function makeSortable(target, options = {}) {
  const items = typeof target === 'string' ? document.querySelectorAll(target) : target;
  const container = items[0]?.parentElement;

  if (!container) {
    console.error('[GSAP Kit] 정렬 가능한 아이템을 찾을 수 없습니다');
    return null;
  }

  let draggables = [];

  items.forEach((item, i) => {
    const draggable = Draggable.create(item, {
      type: "y",
      bounds: container,
      onPress: function() {
        // 드래그 시작 시 z-index 높이기
        this.target.style.zIndex = 1000;
      },
      onDrag: function() {
        // 다른 아이템과의 위치 확인 및 재정렬
        const thisRect = this.target.getBoundingClientRect();

        items.forEach((otherItem, j) => {
          if (otherItem === this.target) return;

          const otherRect = otherItem.getBoundingClientRect();

          // 겹치는지 확인
          if (thisRect.top < otherRect.top + otherRect.height / 2 &&
              thisRect.bottom > otherRect.top + otherRect.height / 2) {

            // 순서 변경
            if (i < j) {
              container.insertBefore(this.target, otherItem.nextSibling);
            } else {
              container.insertBefore(this.target, otherItem);
            }
          }
        });
      },
      onDragEnd: function() {
        // 드래그 종료 시 원래 z-index로
        this.target.style.zIndex = '';

        // 위치 리셋
        gsap.to(this.target, {
          x: 0,
          y: 0,
          duration: 0.3
        });

        if (options.onSort) {
          const newOrder = Array.from(container.children);
          options.onSort(newOrder);
        }
      }
    })[0];

    draggables.push(draggable);
  });

  return draggables;
}

/**
 * 스와이프 감지 (모바일 친화적)
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 스와이프 옵션
 * @param {number} [options.threshold=50] - 스와이프로 인식할 최소 거리 (픽셀)
 * @param {Function} [options.onSwipeLeft] - 왼쪽 스와이프 콜백
 * @param {Function} [options.onSwipeRight] - 오른쪽 스와이프 콜백
 * @param {Function} [options.onSwipeUp] - 위 스와이프 콜백
 * @param {Function} [options.onSwipeDown] - 아래 스와이프 콜백
 * @returns {Array<Draggable>}
 */
function makeSwipeable(target, options = {}) {
  const defaults = {
    threshold: 50
  };

  const config = { ...defaults, ...options };
  let startX = 0;
  let startY = 0;

  return Draggable.create(target, {
    type: "x,y",
    onDragStart: function() {
      startX = this.x;
      startY = this.y;
    },
    onDragEnd: function() {
      const deltaX = this.x - startX;
      const deltaY = this.y - startY;

      // 수평 스와이프
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > config.threshold && config.onSwipeRight) {
          config.onSwipeRight();
        } else if (deltaX < -config.threshold && config.onSwipeLeft) {
          config.onSwipeLeft();
        }
      }
      // 수직 스와이프
      else {
        if (deltaY > config.threshold && config.onSwipeDown) {
          config.onSwipeDown();
        } else if (deltaY < -config.threshold && config.onSwipeUp) {
          config.onSwipeUp();
        }
      }

      // 원래 위치로 되돌리기
      gsap.to(this.target, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  });
}

/**
 * 범위를 지정하여 값을 매핑하는 드래그
 * @param {string|HTMLElement} target - CSS 선택자 또는 DOM 요소
 * @param {Object} options - 옵션
 * @param {string} [options.axis="x"] - 드래그 축
 * @param {number} [options.min=0] - 최소 출력값
 * @param {number} [options.max=1] - 최대 출력값
 * @param {Function} [options.onUpdate] - 값 업데이트 콜백 (value) => {}
 * @returns {Array<Draggable>}
 */
function makeDraggableWithRange(target, options = {}) {
  const defaults = {
    axis: "x",
    min: 0,
    max: 1
  };

  const config = { ...defaults, ...options };

  return Draggable.create(target, {
    type: config.axis,
    bounds: config.bounds,
    onDrag: function() {
      const bounds = config.axis === "x" ? this.maxX : this.maxY;
      const current = config.axis === "x" ? this.x : this.y;
      const value = config.min + ((current / bounds) * (config.max - config.min));

      if (config.onUpdate) {
        config.onUpdate(value);
      }
    }
  });
}
