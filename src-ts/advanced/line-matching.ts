/**
 * GSAP Kit - Line Matching (선 연결 매칭 게임)
 * 포인트 기반 드래그 앤 드롭 선 연결 시스템
 */

/// <reference types="gsap" />

import { debug } from '../types';

// ==================== 타입 정의 ====================

/**
 * 위치 값 타입 (px, %, 키워드)
 */
type PositionValue = number | string;

/**
 * 포인트 위치 설정
 */
interface PointPosition {
  x?: PositionValue;  // 'left', 'center', 'right', '50%', 100 등
  y?: PositionValue;  // 'top', 'center', 'bottom', '50%', 100 등
}

/**
 * 매칭 아이템 정의
 */
interface MatchItem {
  selector: string;           // CSS 선택자
  point?: PointPosition;      // 포인트 위치 (기본값: center)
  data?: any;                 // 추가 데이터
}

/**
 * 선 연결 매칭 옵션
 */
interface LineMatchingOptions {
  items: { [id: string]: MatchItem };  // 아이템 목록 (예: { 'a0': {...}, 'b0': {...} })
  pairs: { [id: string]: string | string[] };     // 정답 매핑 (단일: 'b1', 다중: ['b1', 'b2'])

  // 컨테이너 설정
  container?: string | HTMLElement;   // SVG를 배치할 컨테이너 (기본값: document.body)

  // 포인트 스타일
  pointSize?: number;               // 포인트 크기
  pointColor?: string;              // 포인트 색상
  pointHoverColor?: string;         // 포인트 호버 색상

  // 선 스타일 옵션
  lineColor?: string;               // 기본 선 색상
  lineWidth?: number;               // 선 두께
  correctColor?: string;            // 정답 선 색상
  incorrectColor?: string;          // 오답 선 색상

  // 고급 선 스타일 옵션
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'animated-dash' | 'arrow';  // 선 스타일
  dashArray?: string;               // 점선 패턴 (예: "5,5")
  arrowSize?: number;               // 화살표 크기
  hideCursor?: boolean;             // 드래그 중 시스템 커서 숨김 여부 (기본값: true)

  // 콜백 함수
  onCorrect?: (fromId: string, toId: string) => void;
  onIncorrect?: (fromId: string, toId: string) => void;
  onComplete?: (score: number, total: number) => void;

  // 추가 옵션
  allowMultipleAttempts?: boolean;  // 여러 번 시도 허용
  showFeedback?: boolean;           // 시각적 피드백 표시
  bidirectional?: boolean;          // 양방향 연결 허용 (기본: false, A->B만 가능)
}

/**
 * 포인트 정보
 */
interface Point {
  id: string;
  element: HTMLElement;       // 원본 요소
  pointDiv: HTMLElement;      // 포인트 div
  position: Required<PointPosition>;
}

/**
 * 연결 정보
 */
interface Connection {
  fromId: string;
  toId: string;
  line: SVGLineElement;
  svg: SVGSVGElement;  // 각 선마다 독립적인 SVG
  arrow?: SVGPolygonElement;  // 화살표 polygon (arrow 스타일일 때만)
  isCorrect: boolean;
}

/**
 * 매칭 인스턴스 클래스
 */
class LineMatchingInstance {
  private options: Required<LineMatchingOptions>;
  private connections: Connection[] = [];
  private points: Map<string, Point> = new Map();
  private pairs: Map<string, string | string[]> = new Map(); // 정답 매핑 (단일 또는 다중)
  private tempLine: SVGLineElement | null = null;
  private tempSvg: SVGSVGElement | null = null;
  private tempArrow: SVGPolygonElement | null = null; // 임시 화살표
  private cursorTracker: HTMLDivElement | null = null; // 커서 트래커 (화살표용)
  private cursorStyleElement: HTMLStyleElement | null = null; // 커서 숨김용 스타일
  private container: HTMLElement; // SVG를 배치할 컨테이너

  // 클릭 모드 상태 (클래스 레벨로 이동)
  private firstSelectedPoint: Point | null = null;
  private isDragging: boolean = false;
  private dragStartPoint: Point | null = null;

  constructor(options: LineMatchingOptions) {
    // 컨테이너 설정
    if (typeof options.container === 'string') {
      const containerEl = document.querySelector(options.container);
      if (!containerEl) {
        throw new Error(`Container "${options.container}" not found`);
      }
      this.container = containerEl as HTMLElement;
    } else if (options.container instanceof HTMLElement) {
      this.container = options.container;
    } else {
      this.container = document.body;
    }

    // 컨테이너를 relative positioning으로 설정 (absolute SVG를 위해)
    const containerStyle = getComputedStyle(this.container);
    if (containerStyle.position === 'static') {
      this.container.style.position = 'relative';
    }

    // 기본값 설정
    const defaultLineWidth = options.lineWidth || 2;

    this.options = {
      items: options.items,
      pairs: options.pairs,
      container: options.container || this.container,
      pointSize: options.pointSize || 12,
      pointColor: options.pointColor || '#667eea',
      pointHoverColor: options.pointHoverColor || '#764ba2',
      lineColor: options.lineColor || '#999',
      lineWidth: defaultLineWidth,
      correctColor: options.correctColor || '#4CAF50',
      incorrectColor: options.incorrectColor || '#F44336',
      lineStyle: options.lineStyle || 'solid',
      // dashArray를 lineWidth에 비례하도록 (더 세련된 점선)
      dashArray: options.dashArray || `${defaultLineWidth * 3},${defaultLineWidth * 2}`,
      // arrowSize를 lineWidth에 비례하도록 (선 두께에 맞는 화살표)
      arrowSize: options.arrowSize || defaultLineWidth * 5,
      // 시스템 커서 숨김 (기본값: true)
      hideCursor: options.hideCursor ?? true,
      onCorrect: options.onCorrect || (() => {}),
      onIncorrect: options.onIncorrect || (() => {}),
      onComplete: options.onComplete || (() => {}),
      allowMultipleAttempts: options.allowMultipleAttempts ?? true,
      showFeedback: options.showFeedback ?? true,
      bidirectional: options.bidirectional ?? false
    };

    this.init();
  }

  /**
   * 초기화
   */
  private init(): void {
    debug('LineMatching 초기화 시작');

    // 정답 매핑 저장
    Object.entries(this.options.pairs).forEach(([from, to]) => {
      this.pairs.set(from, to);
      if (this.options.bidirectional) {
        // 양방향 매핑: to가 배열인 경우 각 항목에 대해 역방향 매핑 추가
        if (Array.isArray(to)) {
          to.forEach(targetId => {
            const existing = this.pairs.get(targetId);
            if (Array.isArray(existing)) {
              existing.push(from);
            } else if (existing) {
              this.pairs.set(targetId, [existing, from]);
            } else {
              this.pairs.set(targetId, from);
            }
          });
        } else {
          const existing = this.pairs.get(to);
          if (Array.isArray(existing)) {
            existing.push(from);
          } else if (existing) {
            this.pairs.set(to, [existing, from]);
          } else {
            this.pairs.set(to, from);
          }
        }
      }
    });

    // 요소 검증 및 포인트 생성
    this.createPoints();

    // 드래그 이벤트 바인딩
    this.bindDragEvents();

    // 스크롤 이벤트 리스너 추가 (선 위치 업데이트)
    this.bindScrollListener();

    debug('LineMatching 초기화 완료');
  }

  /**
   * 포인트 생성
   */
  private createPoints(): void {
    debug('포인트 생성 시작');

    Object.entries(this.options.items).forEach(([id, item]) => {
      const elements = document.querySelectorAll(item.selector);

      if (elements.length === 0) {
        console.error(`[GSAP Kit] 아이템 "${id}": 선택자 "${item.selector}"에 해당하는 요소를 찾을 수 없습니다.`);
        return;
      }

      if (elements.length > 1) {
        console.warn(`[GSAP Kit] 아이템 "${id}": 선택자 "${item.selector}"에 ${elements.length}개의 요소가 있습니다. 첫 번째 요소만 사용됩니다.`);
      }

      const element = elements[0] as HTMLElement;

      // 포인트 위치 설정 (기본값: center)
      const position: Required<PointPosition> = {
        x: item.point?.x ?? 'center',
        y: item.point?.y ?? 'center'
      };

      // 포인트 div 생성
      const pointDiv = this.createPointDiv(element, position);

      const point: Point = {
        id,
        element,
        pointDiv,
        position
      };

      this.points.set(id, point);
      debug(`포인트 생성: ${id} at (${position.x}, ${position.y})`);
    });

    debug(`총 ${this.points.size}개 포인트 생성 완료`);
  }

  /**
   * 포인트 div 생성 및 배치
   */
  private createPointDiv(element: HTMLElement, position: Required<PointPosition>): HTMLElement {
    const pointDiv = document.createElement('div');
    pointDiv.className = 'line-matching-point';

    // 기본 스타일
    pointDiv.style.position = 'absolute';
    pointDiv.style.width = `${this.options.pointSize}px`;
    pointDiv.style.height = `${this.options.pointSize}px`;
    pointDiv.style.backgroundColor = this.options.pointColor;
    pointDiv.style.borderRadius = '50%';
    pointDiv.style.cursor = 'pointer';
    pointDiv.style.zIndex = '10000';
    pointDiv.style.transition = 'all 0.3s ease';
    pointDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    pointDiv.style.pointerEvents = 'auto'; // 명시적으로 포인터 이벤트 활성화

    // 요소가 relative positioning을 가지도록 설정
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }

    // 부모 요소의 overflow 확인 및 경고
    const computedStyle = getComputedStyle(element);
    if (computedStyle.overflow === 'hidden') {
      console.warn('[GSAP Kit] 부모 요소에 overflow: hidden이 설정되어 있어 포인트가 잘릴 수 있습니다:', element);
    }

    // 포인트 위치 계산 및 설정
    this.updatePointPosition(pointDiv, element, position);

    element.appendChild(pointDiv);

    debug(`포인트 div 생성 완료: size=${this.options.pointSize}px, cursor=${pointDiv.style.cursor}`);

    return pointDiv;
  }

  /**
   * 포인트 위치 업데이트
   */
  private updatePointPosition(pointDiv: HTMLElement, element: HTMLElement, position: Required<PointPosition>): void {
    const rect = element.getBoundingClientRect();
    const halfSize = this.options.pointSize / 2;

    // X 좌표 계산
    let left: string;
    if (position.x === 'left') {
      left = `${-halfSize}px`;
    } else if (position.x === 'center') {
      left = `calc(50% - ${halfSize}px)`;
    } else if (position.x === 'right') {
      left = `calc(100% - ${halfSize}px)`;
    } else if (typeof position.x === 'string' && position.x.includes('%')) {
      left = `calc(${position.x} - ${halfSize}px)`;
    } else {
      const px = typeof position.x === 'number' ? position.x : parseFloat(position.x);
      left = `${px - halfSize}px`;
    }

    // Y 좌표 계산
    let top: string;
    if (position.y === 'top') {
      top = `${-halfSize}px`;
    } else if (position.y === 'center') {
      top = `calc(50% - ${halfSize}px)`;
    } else if (position.y === 'bottom') {
      top = `calc(100% - ${halfSize}px)`;
    } else if (typeof position.y === 'string' && position.y.includes('%')) {
      top = `calc(${position.y} - ${halfSize}px)`;
    } else {
      const px = typeof position.y === 'number' ? position.y : parseFloat(position.y);
      top = `${px - halfSize}px`;
    }

    pointDiv.style.left = left;
    pointDiv.style.top = top;
  }

  /**
   * 개별 SVG 생성 (각 선마다 독립적인 SVG)
   * Container 기준 상대 좌표 사용
   */
  private createLineSvg(fromPos: { x: number; y: number }, toPos: { x: number; y: number }): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('line-matching-svg');

    // Container의 위치를 기준으로 상대 좌표 계산
    const containerRect = this.container.getBoundingClientRect();

    // 전역 좌표를 container 기준 상대 좌표로 변환
    const relFromX = fromPos.x - containerRect.left;
    const relFromY = fromPos.y - containerRect.top;
    const relToX = toPos.x - containerRect.left;
    const relToY = toPos.y - containerRect.top;

    // 두 포인트를 감싸는 최소 영역 계산 (container 기준)
    const minX = Math.min(relFromX, relToX);
    const minY = Math.min(relFromY, relToY);
    const maxX = Math.max(relFromX, relToX);
    const maxY = Math.max(relFromY, relToY);

    const padding = 10; // 선이 잘리지 않도록 여백
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    // SVG 위치 및 크기 설정 (container 기준 absolute)
    svg.style.position = 'absolute';
    svg.style.left = `${minX - padding}px`;
    svg.style.top = `${minY - padding}px`;
    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '9999';
    svg.style.overflow = 'visible';

    this.container.appendChild(svg);

    return svg;
  }

  /**
   * 커서 트래커 생성 (화살표가 커서를 따라다님)
   */
  private createCursorTracker(): void {
    if (this.cursorTracker) return;

    const tracker = document.createElement('div');
    tracker.style.position = 'fixed';
    tracker.style.pointerEvents = 'none';
    tracker.style.zIndex = '10000';
    tracker.style.display = 'none';
    tracker.style.transformOrigin = 'center center';

    // SVG로 화살표 그리기
    const size = this.options.arrowSize;
    const halfWidth = size / 2;

    tracker.innerHTML = `
      <svg width="${size}" height="${size}" style="display: block;">
        <polygon
          points="
            ${size / 2},${size * 0.6}
            ${size / 2 - halfWidth},${size * 0.4}
            ${size / 2 + halfWidth},${size * 0.4}
          "
          fill="${this.options.lineColor}"
          style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"
        />
      </svg>
    `;

    document.body.appendChild(tracker);
    this.cursorTracker = tracker;
  }

  /**
   * 커서 트래커 표시
   */
  private showCursorTracker(): void {
    if (this.options.lineStyle !== 'arrow') return;

    // marker-end가 더 자연스러우므로 cursorTracker는 사용하지 않음
    // 시스템 커서만 숨김
    if (!this.cursorStyleElement) {
      this.cursorStyleElement = document.createElement('style');
      this.cursorStyleElement.textContent = 'body { cursor: none !important; }';
      document.head.appendChild(this.cursorStyleElement);
    }
  }

  /**
   * 커서 트래커 숨기기
   */
  private hideCursorTracker(): void {
    // 시스템 커서 복원 (Arrow 스타일일 때)
    if (this.cursorStyleElement) {
      this.cursorStyleElement.remove();
      this.cursorStyleElement = null;
    }
  }

  /**
   * 커서 트래커 위치 및 회전 업데이트
   */
  private updateCursorTracker(startPos: { x: number; y: number }, mousePos: { x: number; y: number }): void {
    if (!this.cursorTracker || this.options.lineStyle !== 'arrow') return;

    // 마우스 위치에 트래커 배치 (중심 기준)
    const size = this.options.arrowSize;
    this.cursorTracker.style.left = `${mousePos.x - size / 2}px`;
    this.cursorTracker.style.top = `${mousePos.y - size / 2}px`;

    // 시작점에서 마우스까지의 각도 계산
    const angle = Math.atan2(mousePos.y - startPos.y, mousePos.x - startPos.x);
    const angleDeg = angle * (180 / Math.PI);

    // 회전 적용 (기본 아래 방향이므로 +90도 조정)
    this.cursorTracker.style.transform = `rotate(${angleDeg + 90}deg)`;
  }

  /**
   * 화살표 폴리곤 생성 (꼭짓점이 아래를 향하는 기본 형태)
   * @param svg SVG 엘리먼트
   * @param fromPos 시작 위치
   * @param toPos 종료 위치 (화살표가 위치할 곳)
   * @param color 화살표 색상
   * @returns 생성된 화살표 polygon 엘리먼트
   */
  private createArrowPolygon(
    svg: SVGSVGElement,
    fromPos: { x: number; y: number },
    toPos: { x: number; y: number },
    color: string
  ): SVGPolygonElement {
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

    const size = this.options.arrowSize;
    const halfWidth = size / 2;

    // 기본 형태: 꼭짓점이 아래로 향하는 삼각형
    // 중심점을 (0, 0)으로 하는 좌표계
    const points = `
      0,${size * 0.6}
      ${-halfWidth},${-size * 0.4}
      ${halfWidth},${-size * 0.4}
    `.trim().replace(/\s+/g, ' ');

    arrow.setAttribute('points', points);
    arrow.setAttribute('fill', color);

    // 선의 각도 계산 (라디안)
    const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
    // 라디안을 도(degree)로 변환
    const angleDeg = angle * (180 / Math.PI);

    // SVG 좌표계 내에서의 상대 위치 계산
    const containerRect = this.container.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    const relX = toPos.x - svgRect.left;
    const relY = toPos.y - svgRect.top;

    // 화살표를 종료 지점에 배치하고 회전
    // 기본 화살표는 아래를 향하므로, 오른쪽(0도)을 향하게 하려면 -90도 회전 필요
    // 그 후 선의 각도만큼 추가 회전
    arrow.setAttribute('transform', `translate(${relX}, ${relY}) rotate(${angleDeg - 90})`);

    svg.appendChild(arrow);

    return arrow;
  }

  /**
   * 클릭 기반 연결 이벤트 바인딩 (간소화)
   */
  private bindDragEvents(): void {
    debug(`이벤트 바인딩 시작: ${this.points.size}개 포인트`);

    // 모든 포인트에 이벤트 바인딩
    this.points.forEach((point, id) => {
      const pointDiv = point.pointDiv;

      debug(`포인트 ${id} 이벤트 바인딩`);

      // 호버 효과
      pointDiv.addEventListener('mouseenter', () => {
        if (!this.firstSelectedPoint || this.firstSelectedPoint.id !== id) {
          pointDiv.style.backgroundColor = this.options.pointHoverColor;
          pointDiv.style.transform = 'scale(1.2)';
        }
      });

      pointDiv.addEventListener('mouseleave', () => {
        if (!this.firstSelectedPoint || this.firstSelectedPoint.id !== id) {
          pointDiv.style.backgroundColor = this.options.pointColor;
          pointDiv.style.transform = 'scale(1)';
        }
      });

      // 마우스 다운 - 드래그 시작 또는 클릭 시작
      pointDiv.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        debug(`포인트 ${id} 마우스 다운`);

        // 이 포인트로 연결된 선이 있는지 확인 (연결된 포인트는 드래그 시작하지 않음)
        const incomingConnection = this.connections.find(conn => conn.toId === id);
        if (incomingConnection) {
          debug(`포인트 ${id}는 연결된 포인트 - 드래그 시작 방지`);
          return; // 연결된 포인트는 mousedown에서 아무것도 하지 않음 (click 이벤트에서 처리)
        }

        if (!this.firstSelectedPoint) {
          // 드래그 시작
          this.isDragging = true;
          this.dragStartPoint = point;
          this.firstSelectedPoint = point;

          pointDiv.style.backgroundColor = '#FFD700';
          pointDiv.style.transform = 'scale(1.3)';
          pointDiv.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.8)';

          // 가능한 연결 대상 포인트들에 힌트 표시
          this.showHints(id);

          // 임시 선 생성
          const startPos = this.getPointCenter(pointDiv);
          this.tempSvg = this.createLineSvg(startPos, startPos);
          const { line, arrow } = this.createLineInSvg(
            this.tempSvg,
            startPos,
            startPos,
            this.options.lineColor,
            this.options.lineWidth
          );
          this.tempLine = line;
          this.tempArrow = arrow || null;

          // 커서 트래커 표시 (화살표 스타일일 때)
          this.showCursorTracker();

          debug(`드래그 시작: ${id}`);
        }
      });

      // 마우스 업 - 드래그 종료 또는 클릭
      pointDiv.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        debug(`포인트 ${id} 마우스 업, isDragging: ${this.isDragging}`);

        if (this.isDragging && this.dragStartPoint) {
          // 드래그로 연결
          if (this.dragStartPoint.id !== id) {
            debug(`드래그로 연결: ${this.dragStartPoint.id} → ${id}`);

            // 임시 선 제거
            if (this.tempLine && this.tempSvg) {
              this.tempSvg.remove();
              this.tempLine = null;
              this.tempSvg = null;
              this.tempArrow = null;
            }

            // 커서 트래커 숨기기
            this.hideCursorTracker();

            // 연결 생성
            this.createConnection(this.dragStartPoint.id, id);

            // 스타일 복원
            this.dragStartPoint.pointDiv.style.backgroundColor = this.options.pointColor;
            this.dragStartPoint.pointDiv.style.transform = 'scale(1)';
            this.dragStartPoint.pointDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
          } else {
            // 같은 포인트에서 드래그 종료 - 취소
            debug(`같은 포인트에서 드래그 종료 - 취소`);
            if (this.tempLine && this.tempSvg) {
              this.tempSvg.remove();
              this.tempLine = null;
              this.tempSvg = null;
              this.tempArrow = null;
            }
            // 커서 트래커 숨기기
            this.hideCursorTracker();
            pointDiv.style.backgroundColor = this.options.pointColor;
            pointDiv.style.transform = 'scale(1)';
            pointDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
          }

          // 힌트 숨기기
          this.hideHints();

          this.isDragging = false;
          this.dragStartPoint = null;
          this.firstSelectedPoint = null;
        }
      });

      // 클릭 이벤트 (드래그하지 않은 경우)
      pointDiv.addEventListener('click', (e) => {
        e.stopPropagation();

        // 드래그 중이면 클릭 무시
        if (this.isDragging) {
          return;
        }

        debug(`포인트 ${id} 클릭됨 (드래그 아님)`);

        // 이 포인트로 연결된 선이 있는지 확인 (toId가 현재 id인 경우)
        const incomingConnection = this.connections.find(conn => conn.toId === id);

        if (incomingConnection && !this.firstSelectedPoint) {
          // 연결된 선이 있고 첫 번째 선택이 아닌 경우 -> 선 클릭과 동일한 동작
          debug(`포인트 ${id}로 들어오는 연결 발견: ${incomingConnection.fromId} -> ${id}, 연결 해제 및 재시작`);
          this.reconnectFromPoint(incomingConnection, e);
          return;
        }

        if (!this.firstSelectedPoint) {
          // 첫 번째 포인트 선택
          this.firstSelectedPoint = point;
          pointDiv.style.backgroundColor = '#FFD700';
          pointDiv.style.transform = 'scale(1.3)';
          pointDiv.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
          debug(`첫 번째 포인트 선택: ${id}`);

          // 가능한 연결 대상 포인트들에 힌트 표시
          this.showHints(id);

          // 임시 선 시작
          const startPos = this.getPointCenter(pointDiv);
          this.tempSvg = this.createLineSvg(startPos, startPos);
          const { line: tempLine, arrow: tempArrow } = this.createLineInSvg(
            this.tempSvg,
            startPos,
            startPos,
            this.options.lineColor,
            this.options.lineWidth
          );
          this.tempLine = tempLine;
          this.tempArrow = tempArrow || null;

          // 커서 트래커 표시 (화살표 스타일일 때)
          this.showCursorTracker();
        } else if (this.firstSelectedPoint.id === id) {
          // 같은 포인트 클릭 -> 선택 취소
          debug(`선택 취소: ${id}`);
          pointDiv.style.backgroundColor = this.options.pointColor;
          pointDiv.style.transform = 'scale(1)';
          pointDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';

          if (this.tempLine && this.tempSvg) {
            this.tempSvg.remove();
            this.tempLine = null;
            this.tempSvg = null;
            this.tempArrow = null;
          }

          // 커서 트래커 숨기기
          this.hideCursorTracker();

          // 힌트 숨기기
          this.hideHints();

          this.firstSelectedPoint = null;
        } else {
          // 두 번째 포인트 선택 -> 연결 시도
          debug(`두 번째 포인트 선택: ${id}, 연결 시도`);

          // 임시 선 제거
          if (this.tempLine && this.tempSvg) {
            this.tempSvg.remove();
            this.tempLine = null;
            this.tempSvg = null;
            this.tempArrow = null;
          }

          // 커서 트래커 숨기기
          this.hideCursorTracker();

          // 연결 생성
          this.createConnection(this.firstSelectedPoint.id, id);

          // 첫 번째 포인트 스타일 복원
          this.firstSelectedPoint.pointDiv.style.backgroundColor = this.options.pointColor;
          this.firstSelectedPoint.pointDiv.style.transform = 'scale(1)';
          this.firstSelectedPoint.pointDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';

          // 힌트 숨기기
          this.hideHints();

          this.firstSelectedPoint = null;
        }
      });
    });

    // 마우스 이동 시 임시 선 업데이트
    document.addEventListener('mousemove', (e) => {
      if (this.firstSelectedPoint && this.tempLine && this.tempSvg) {
        const startPos = this.getPointCenter(this.firstSelectedPoint.pointDiv);
        const mousePos = { x: e.clientX, y: e.clientY };
        this.updateLineSvg(this.tempSvg, this.tempLine, startPos, mousePos, this.tempArrow || undefined);
        this.updateCursorTracker(startPos, mousePos);
      }
    });

    // 마우스 업 (문서 레벨) - 드래그 중 다른 곳에서 놓았을 때
    document.addEventListener('mouseup', () => {
      if (this.isDragging && this.dragStartPoint) {
        debug('드래그 중 다른 곳에서 마우스 업 - 취소');

        if (this.tempLine && this.tempSvg) {
          this.tempSvg.remove();
          this.tempLine = null;
          this.tempSvg = null;
          this.tempArrow = null;
        }

        // 커서 트래커 숨기기
        this.hideCursorTracker();

        this.dragStartPoint.pointDiv.style.backgroundColor = this.options.pointColor;
        this.dragStartPoint.pointDiv.style.transform = 'scale(1)';
        this.dragStartPoint.pointDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';

        // 힌트 숨기기
        this.hideHints();

        this.isDragging = false;
        this.dragStartPoint = null;
        this.firstSelectedPoint = null;
      }
    });

    // 배경 클릭 시 선택 취소
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('line-matching-point') && this.firstSelectedPoint && !this.isDragging) {
        debug('배경 클릭 - 선택 취소');
        this.firstSelectedPoint.pointDiv.style.backgroundColor = this.options.pointColor;
        this.firstSelectedPoint.pointDiv.style.transform = 'scale(1)';
        this.firstSelectedPoint.pointDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';

        if (this.tempLine && this.tempSvg) {
          this.tempSvg.remove();
          this.tempLine = null;
          this.tempSvg = null;
          this.tempArrow = null;
        }

        // 커서 트래커 숨기기
        this.hideCursorTracker();

        // 힌트 숨기기
        this.hideHints();

        this.firstSelectedPoint = null;
      }
    });

    debug('이벤트 바인딩 완료');
  }

  /**
   * 가능한 연결 대상 포인트들에 힌트 표시
   */
  private showHints(fromId: string): void {
    const possibleTargets = this.pairs.get(fromId);

    if (!possibleTargets) return;

    const targetIds = Array.isArray(possibleTargets) ? possibleTargets : [possibleTargets];

    targetIds.forEach(targetId => {
      const targetPoint = this.points.get(targetId);
      if (targetPoint) {
        // 힌트 스타일 적용 (애니메이션 제거, 그림자만 적용)
        targetPoint.pointDiv.classList.add('line-matching-hint');
        targetPoint.pointDiv.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.8)';
      }
    });

    debug(`힌트 표시: ${fromId} → ${targetIds.join(', ')}`);
  }

  /**
   * 힌트 숨기기
   */
  private hideHints(): void {
    this.points.forEach(point => {
      point.pointDiv.classList.remove('line-matching-hint');
      point.pointDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    });

    debug('힌트 숨김');
  }

  /**
   * 연결 생성
   */
  private createConnection(fromId: string, toId: string): void {
    // 정답 확인 (단일 또는 다중 답안 지원)
    const correctAnswer = this.pairs.get(fromId);
    let isCorrect = false;

    if (Array.isArray(correctAnswer)) {
      // 다중 정답: 배열에 포함되어 있으면 정답
      isCorrect = correctAnswer.includes(toId);
    } else {
      // 단일 정답: 일치하면 정답
      isCorrect = correctAnswer === toId;
    }

    debug(`연결 시도: ${fromId} → ${toId} (${isCorrect ? '정답' : '오답'})`);

    // 이미 연결되어 있는지 확인
    const existingConnection = this.connections.find(
      conn => conn.fromId === fromId && conn.toId === toId
    );

    if (existingConnection) {
      debug('이미 연결되어 있음');
      return;
    }

    const fromPoint = this.points.get(fromId)!;
    const toPoint = this.points.get(toId)!;

    // 선 색상 결정
    const lineColor = isCorrect ? this.options.correctColor : this.options.incorrectColor;

    // 영구 선 생성 (독립적인 SVG)
    const fromPos = this.getPointCenter(fromPoint.pointDiv);
    const toPos = this.getPointCenter(toPoint.pointDiv);
    const svg = this.createLineSvg(fromPos, toPos);
    const { line, arrow } = this.createLineInSvg(svg, fromPos, toPos, lineColor, this.options.lineWidth);

    // 연결 정보 저장
    const connection: Connection = {
      fromId,
      toId,
      line,
      svg,
      arrow,
      isCorrect
    };

    this.connections.push(connection);

    // 선에 클릭 이벤트 추가 (연결 해제 및 재연결)
    this.addLineClickHandler(line, connection);

    // 시각적 피드백
    if (this.options.showFeedback) {
      this.showFeedback(fromPoint, toPoint, isCorrect);
    }

    // 콜백 호출
    if (isCorrect) {
      this.options.onCorrect(fromId, toId);
    } else {
      this.options.onIncorrect(fromId, toId);

      // 오답인 경우 선 제거 (allowMultipleAttempts가 true일 때)
      if (this.options.allowMultipleAttempts) {
        setTimeout(() => {
          svg.remove();
          const index = this.connections.indexOf(connection);
          if (index > -1) {
            this.connections.splice(index, 1);
          }
        }, 1000);
      }
    }

    // 완료 확인
    this.checkCompletion();
  }

  /**
   * 선 클릭 핸들러 추가 (연결 해제 및 재연결)
   */
  private addLineClickHandler(line: SVGLineElement, connection: Connection): void {
    // 선을 클릭 가능하게 설정
    // stroke-width는 createLineInSvg에서 설정한 값 유지
    line.style.pointerEvents = 'visibleStroke'; // 선 영역에서 클릭 가능
    line.style.cursor = 'pointer';

    // 호버 효과
    line.addEventListener('mouseenter', () => {
      line.style.opacity = '0.7';
      // 호버 시에만 클릭 영역 확대
      line.setAttribute('stroke-width', (this.options.lineWidth + 2).toString());
    });

    line.addEventListener('mouseleave', () => {
      line.style.opacity = '1';
      // 원래 두께로 복원
      line.setAttribute('stroke-width', this.options.lineWidth.toString());
    });

    // 클릭 시 연결 해제 및 재연결 시작
    line.addEventListener('click', (e) => {
      e.stopPropagation();
      debug(`선 클릭: ${connection.fromId} → ${connection.toId}`);
      this.reconnectFromPoint(connection, e);
    });
  }

  /**
   * 연결 해제
   */
  private disconnectLine(connection: Connection): void {
    debug(`연결 해제: ${connection.fromId} → ${connection.toId}`);

    // SVG 제거 (선도 함께 제거됨)
    connection.svg.remove();

    // connections 배열에서 제거
    const index = this.connections.indexOf(connection);
    if (index > -1) {
      this.connections.splice(index, 1);
    }
  }

  /**
   * 연결 해제 후 시작 포인트에서 재시작 (선 클릭 또는 연결된 포인트 클릭 시)
   */
  private reconnectFromPoint(connection: Connection, mouseEvent: MouseEvent): void {
    debug(`재연결 시작: ${connection.fromId} → ${connection.toId}`);

    // 기존 상태 클린업
    if (this.tempLine && this.tempSvg) {
      this.tempSvg.remove();
      this.tempLine = null;
      this.tempSvg = null;
      this.tempArrow = null;
    }
    if (this.firstSelectedPoint) {
      this.firstSelectedPoint.pointDiv.style.backgroundColor = this.options.pointColor;
      this.firstSelectedPoint.pointDiv.style.transform = 'scale(1)';
      this.firstSelectedPoint.pointDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    }
    this.hideHints();
    this.hideCursorTracker();

    // 연결 해제
    this.disconnectLine(connection);

    // 시작 포인트에서 새 연결 시작
    const fromPoint = this.points.get(connection.fromId)!;

    // 포인트 활성화
    fromPoint.pointDiv.style.backgroundColor = '#FFD700';
    fromPoint.pointDiv.style.transform = 'scale(1.3)';
    fromPoint.pointDiv.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.8)';

    // 가능한 연결 대상 포인트들에 힌트 표시
    this.showHints(connection.fromId);

    // 임시 선 생성
    const startPos = this.getPointCenter(fromPoint.pointDiv);
    const mousePos = { x: mouseEvent.clientX, y: mouseEvent.clientY };
    this.tempSvg = this.createLineSvg(startPos, mousePos);
    const { line: tempLine, arrow: tempArrow } = this.createLineInSvg(
      this.tempSvg,
      startPos,
      mousePos,
      this.options.lineColor,
      this.options.lineWidth
    );
    this.tempLine = tempLine;
    this.tempArrow = tempArrow || null;

    // 커서 트래커 표시 (화살표 스타일일 때)
    this.showCursorTracker();

    // 첫 번째 포인트를 선택 상태로 설정
    this.firstSelectedPoint = fromPoint;
    this.isDragging = false;
    this.dragStartPoint = null;
  }

  /**
   * 완료 확인 (다중 정답 지원)
   */
  private checkCompletion(): void {
    const correctConnections = this.connections.filter(conn => conn.isCorrect).length;

    // 각 fromId에 대해 필요한 정답 개수 계산
    let totalRequired = 0;
    Object.entries(this.options.pairs).forEach(([_, value]) => {
      if (Array.isArray(value)) {
        totalRequired += value.length; // 다중 정답인 경우 배열 길이만큼
      } else {
        totalRequired += 1; // 단일 정답인 경우 1개
      }
    });

    if (correctConnections === totalRequired) {
      debug('모든 연결 완료!');
      this.options.onComplete(correctConnections, totalRequired);
    }
  }

  /**
   * 시각적 피드백
   */
  private showFeedback(fromPoint: Point, toPoint: Point, isCorrect: boolean): void {
    const color = isCorrect ? this.options.correctColor : this.options.incorrectColor;

    [fromPoint.pointDiv, toPoint.pointDiv].forEach(pointDiv => {
      const originalBg = pointDiv.style.backgroundColor;
      pointDiv.style.backgroundColor = color;

      setTimeout(() => {
        pointDiv.style.backgroundColor = originalBg;
      }, 500);
    });
  }

  /**
   * SVG 내에 선 생성
   * @returns 생성된 선과 화살표 (있을 경우)
   */
  private createLineInSvg(
    svg: SVGSVGElement,
    start: { x: number; y: number },
    end: { x: number; y: number },
    color: string,
    width: number
  ): { line: SVGLineElement; arrow?: SVGPolygonElement } {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    // SVG의 로컬 좌표계로 변환
    const svgRect = svg.getBoundingClientRect();
    const x1 = start.x - svgRect.left;
    const y1 = start.y - svgRect.top;
    const x2 = end.x - svgRect.left;
    const y2 = end.y - svgRect.top;

    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', width.toString());
    line.setAttribute('stroke-linecap', 'round');

    // 선 스타일 적용
    const arrow = this.applyLineStyle(line, svg, color, start, end);

    svg.appendChild(line);
    return { line, arrow };
  }

  /**
   * 선 스타일 적용 (점선, 애니메이션, 화살표)
   * @returns 화살표 polygon (arrow 스타일일 때만)
   */
  private applyLineStyle(
    line: SVGLineElement,
    svg: SVGSVGElement,
    color: string,
    start: { x: number; y: number },
    end: { x: number; y: number }
  ): SVGPolygonElement | undefined {
    const style = this.options.lineStyle;

    switch (style) {
      case 'dashed':
        // 점선 스타일
        line.setAttribute('stroke-dasharray', this.options.dashArray);
        return undefined;

      case 'dotted':
        // 점 스타일
        line.setAttribute('stroke-dasharray', '2,5');
        line.setAttribute('stroke-linecap', 'round');
        return undefined;

      case 'animated-dash':
        // 애니메이션 점선
        line.setAttribute('stroke-dasharray', this.options.dashArray);
        line.setAttribute('stroke-dashoffset', '0');

        // CSS 애니메이션 클래스 추가
        line.classList.add('animated-dash');

        // 인라인 스타일로 애니메이션 정의
        const dashLength = this.options.dashArray.split(',').reduce((sum, val) => sum + parseFloat(val), 0);
        line.style.animation = `dash-animation 1s linear infinite`;

        // 스타일시트에 애니메이션 추가 (한 번만)
        if (!document.querySelector('#dash-animation-style')) {
          const styleSheet = document.createElement('style');
          styleSheet.id = 'dash-animation-style';
          styleSheet.textContent = `
            @keyframes dash-animation {
              to {
                stroke-dashoffset: ${dashLength};
              }
            }
          `;
          document.head.appendChild(styleSheet);
        }
        return undefined;

      case 'arrow':
        // 화살표 폴리곤 생성 (꼭짓점 아래 방향 기본, 선 방향으로 회전)
        return this.createArrowPolygon(svg, start, end, color);

      case 'solid':
      default:
        // 기본 실선 (추가 속성 없음)
        return undefined;
    }
  }

  /**
   * SVG와 선 위치 업데이트 (container 기준)
   * @param arrow 화살표 polygon (있을 경우)
   */
  private updateLineSvg(
    svg: SVGSVGElement,
    line: SVGLineElement,
    start: { x: number; y: number },
    end: { x: number; y: number },
    arrow?: SVGPolygonElement
  ): void {
    // Container의 위치를 기준으로 상대 좌표 계산
    const containerRect = this.container.getBoundingClientRect();

    // 전역 좌표를 container 기준 상대 좌표로 변환
    const relStartX = start.x - containerRect.left;
    const relStartY = start.y - containerRect.top;
    const relEndX = end.x - containerRect.left;
    const relEndY = end.y - containerRect.top;

    // SVG 위치 및 크기 재계산 (container 기준)
    const minX = Math.min(relStartX, relEndX);
    const minY = Math.min(relStartY, relEndY);
    const maxX = Math.max(relStartX, relEndX);
    const maxY = Math.max(relStartY, relEndY);

    const padding = 10;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    svg.style.left = `${minX - padding}px`;
    svg.style.top = `${minY - padding}px`;
    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;

    // 선 좌표를 SVG 로컬 좌표계로 변환
    const svgRect = svg.getBoundingClientRect();
    const x1 = start.x - svgRect.left;
    const y1 = start.y - svgRect.top;
    const x2 = end.x - svgRect.left;
    const y2 = end.y - svgRect.top;

    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());

    // 화살표가 있으면 위치와 회전 업데이트
    if (arrow) {
      const relX = end.x - svgRect.left;
      const relY = end.y - svgRect.top;

      // 선의 각도 계산
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const angleDeg = angle * (180 / Math.PI);

      // 화살표 transform 업데이트
      arrow.setAttribute('transform', `translate(${relX}, ${relY}) rotate(${angleDeg - 90})`);
    }
  }

  /**
   * 포인트 중심 좌표 가져오기
   */
  private getPointCenter(pointDiv: HTMLElement): { x: number; y: number } {
    const rect = pointDiv.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  /**
   * 스크롤 이벤트 리스너 바인딩 (선 위치 업데이트)
   */
  private bindScrollListener(): void {
    let scrollTimeout: number;

    const updateLinesOnScroll = () => {
      // 성능 최적화: 디바운스를 사용하여 스크롤 중에는 업데이트 빈도 제한
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        this.updateAllLines();
      }, 16); // ~60fps
    };

    // 스크롤 및 리사이즈 이벤트 리스너
    window.addEventListener('scroll', updateLinesOnScroll, { passive: true });
    window.addEventListener('resize', updateLinesOnScroll);

    debug('스크롤 리스너 바인딩 완료');
  }

  /**
   * 모든 연결 선 위치 업데이트
   */
  private updateAllLines(): void {
    this.connections.forEach(connection => {
      const fromPoint = this.points.get(connection.fromId);
      const toPoint = this.points.get(connection.toId);

      if (fromPoint && toPoint) {
        const fromPos = this.getPointCenter(fromPoint.pointDiv);
        const toPos = this.getPointCenter(toPoint.pointDiv);
        this.updateLineSvg(connection.svg, connection.line, fromPos, toPos, connection.arrow);
      }
    });
  }

  /**
   * 리셋
   */
  public reset(): void {
    // 모든 SVG 및 선 제거
    this.connections.forEach(conn => conn.svg.remove());
    this.connections = [];

    // 임시 선 제거
    if (this.tempSvg) {
      this.tempSvg.remove();
      this.tempSvg = null;
      this.tempLine = null;
      this.tempArrow = null;
    }

    // 포인트 스타일 초기화
    this.points.forEach(point => {
      point.pointDiv.style.backgroundColor = this.options.pointColor;
      point.pointDiv.style.transform = 'scale(1)';
    });

    // 힌트 숨기기
    this.hideHints();

    debug('리셋 완료');
  }

  /**
   * 파괴
   */
  public destroy(): void {
    this.reset();

    // 포인트 div 제거
    this.points.forEach(point => point.pointDiv.remove());
    this.points.clear();

    debug('인스턴스 파괴 완료');
  }
}

/**
 * 선 연결 매칭 게임 생성
 */
function createLineMatching(options: LineMatchingOptions): LineMatchingInstance {
  return new LineMatchingInstance(options);
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).createLineMatching = createLineMatching;
}
