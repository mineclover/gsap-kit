/**
 * GSAP Kit - Path Visualizer
 * 마우스 경로 시각화 (SVG 기반)
 */

import { debug } from '../types';
import type { Point } from './mouse-simulator';

/**
 * 시각화 옵션
 */
export interface VisualizerOptions {
  /** SVG 컨테이너 (기본값: document.body) */
  container?: HTMLElement;

  /** 경로 색상 */
  pathColor?: string;

  /** 경로 두께 */
  pathWidth?: number;

  /** 시작점 색상 */
  startColor?: string;

  /** 끝점 색상 */
  endColor?: string;

  /** 포인트 크기 */
  pointSize?: number;

  /** 마우스 커서 표시 여부 */
  showCursor?: boolean;

  /** 커서 색상 */
  cursorColor?: string;

  /** 애니메이션 속도 (ms per frame) */
  animationSpeed?: number;

  /** 자동 제거 (애니메이션 후) */
  autoRemove?: boolean;

  /** 제거 지연 시간 (ms) */
  removeDelay?: number;
}

/**
 * 경로 시각화 클래스
 */
export class PathVisualizer {
  private options: Required<VisualizerOptions>;
  private svg: SVGSVGElement | null = null;
  private pathElement: SVGPathElement | null = null;
  private cursorElement: SVGCircleElement | null = null;
  private startPoint: SVGCircleElement | null = null;
  private endPoint: SVGCircleElement | null = null;
  private container: HTMLElement;

  constructor(options: VisualizerOptions = {}) {
    this.container = options.container || document.body;

    this.options = {
      container: this.container,
      pathColor: '#667eea',
      pathWidth: 3,
      startColor: '#4CAF50',
      endColor: '#F44336',
      pointSize: 12,
      showCursor: true,
      cursorColor: '#FFD700',
      animationSpeed: 16,
      autoRemove: false,
      removeDelay: 1000,
      ...options,
    };
  }

  /**
   * SVG 컨테이너 생성
   */
  private createSVG(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100vw';
    svg.style.height = '100vh';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '9999';

    this.container.appendChild(svg);
    return svg;
  }

  /**
   * 경로 SVG 요소 생성
   */
  private createPath(points: Point[]): SVGPathElement {
    if (!this.svg) {
      this.svg = this.createSVG();
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // 경로 데이터 생성 (M = moveTo, L = lineTo)
    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathData += ` L ${points[i].x} ${points[i].y}`;
    }

    path.setAttribute('d', pathData);
    path.setAttribute('stroke', this.options.pathColor);
    path.setAttribute('stroke-width', this.options.pathWidth.toString());
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');

    // 초기에는 보이지 않음
    path.setAttribute('stroke-dasharray', '5,5');
    path.setAttribute('opacity', '0.6');

    this.svg.appendChild(path);
    return path;
  }

  /**
   * 포인트 마커 생성 (시작점/끝점)
   */
  private createMarker(point: Point, color: string, label?: string): SVGCircleElement {
    if (!this.svg) {
      this.svg = this.createSVG();
    }

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', point.x.toString());
    circle.setAttribute('cy', point.y.toString());
    circle.setAttribute('r', this.options.pointSize.toString());
    circle.setAttribute('fill', color);
    circle.setAttribute('stroke', 'white');
    circle.setAttribute('stroke-width', '2');
    circle.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

    this.svg.appendChild(circle);

    // 라벨 추가 (선택)
    if (label) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (point.x + this.options.pointSize + 5).toString());
      text.setAttribute('y', (point.y + 5).toString());
      text.setAttribute('fill', color);
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', 'bold');
      text.textContent = label;
      this.svg.appendChild(text);
    }

    return circle;
  }

  /**
   * 커서 생성
   */
  private createCursor(point: Point): SVGCircleElement {
    if (!this.svg) {
      this.svg = this.createSVG();
    }

    const cursor = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cursor.setAttribute('cx', point.x.toString());
    cursor.setAttribute('cy', point.y.toString());
    cursor.setAttribute('r', (this.options.pointSize / 2).toString());
    cursor.setAttribute('fill', this.options.cursorColor);
    cursor.setAttribute('stroke', 'white');
    cursor.setAttribute('stroke-width', '2');
    cursor.style.filter = 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.6))';

    this.svg.appendChild(cursor);
    return cursor;
  }

  /**
   * 경로 시각화
   */
  visualize(points: Point[]): void {
    if (points.length === 0) return;

    debug('[PathVisualizer] Visualizing path with', points.length, 'points');

    // 기존 SVG 제거
    this.clear();

    // 경로 생성
    this.pathElement = this.createPath(points);

    // 시작점/끝점 마커
    this.startPoint = this.createMarker(points[0], this.options.startColor, 'START');
    this.endPoint = this.createMarker(points[points.length - 1], this.options.endColor, 'END');

    // 커서 생성 (애니메이션용)
    if (this.options.showCursor) {
      this.cursorElement = this.createCursor(points[0]);
    }
  }

  /**
   * 경로를 따라 커서 애니메이션
   */
  async animatePath(points: Point[]): Promise<void> {
    if (!this.cursorElement || points.length === 0) return;

    debug('[PathVisualizer] Animating cursor along path');

    return new Promise<void>(resolve => {
      let frameIndex = 0;

      const animate = () => {
        if (frameIndex >= points.length) {
          // 애니메이션 완료
          if (this.options.autoRemove) {
            setTimeout(() => {
              this.clear();
            }, this.options.removeDelay);
          }
          resolve();
          return;
        }

        const point = points[frameIndex];

        // 커서 위치 업데이트
        if (this.cursorElement) {
          this.cursorElement.setAttribute('cx', point.x.toString());
          this.cursorElement.setAttribute('cy', point.y.toString());
        }

        frameIndex++;
        setTimeout(animate, this.options.animationSpeed);
      };

      animate();
    });
  }

  /**
   * 시각화 제거
   */
  clear(): void {
    if (this.svg) {
      this.svg.remove();
      this.svg = null;
      this.pathElement = null;
      this.cursorElement = null;
      this.startPoint = null;
      this.endPoint = null;

      debug('[PathVisualizer] Cleared');
    }
  }

  /**
   * 경로 하이라이트
   */
  highlight(color = '#FFD700'): void {
    if (this.pathElement) {
      this.pathElement.setAttribute('stroke', color);
      this.pathElement.setAttribute('stroke-width', (this.options.pathWidth + 2).toString());
      this.pathElement.setAttribute('opacity', '1');
    }
  }

  /**
   * 경로 흐리게
   */
  dim(): void {
    if (this.pathElement) {
      this.pathElement.setAttribute('opacity', '0.3');
    }
  }
}

/**
 * 경로 시각화 헬퍼 함수
 */
export function visualizePath(points: Point[], options: VisualizerOptions = {}): PathVisualizer {
  const visualizer = new PathVisualizer(options);
  visualizer.visualize(points);
  return visualizer;
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).PathVisualizer = PathVisualizer;
  (window as any).visualizePath = visualizePath;
}
