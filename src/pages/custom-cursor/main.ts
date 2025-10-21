import { createLineMatching } from '../../lib/advanced/line-matching';

let currentInstance: any = null;
let hideCursorEnabled = true;
let debugSvg: SVGElement | null = null;

// 초기 인스턴스 생성
function createInstance(hideCursor: boolean): void {
  // 기존 인스턴스 정리
  if (currentInstance) {
    currentInstance.destroy();
  }

  // 새 인스턴스 생성
  currentInstance = createLineMatching({
    container: '#demo-custom-cursor',
    items: {
      a: { selector: '[data-id="a"]', point: { x: 'right', y: 'center' } },
      b1: { selector: '[data-id="b1"]', point: { x: 'left', y: 'center' } },
      b2: { selector: '[data-id="b2"]', point: { x: 'left', y: 'center' } },
    },
    pairs: {
      a: ['b1', 'b2'], // A는 B1 또는 B2와 연결 가능
    },
    lineStyle: 'arrow',
    lineWidth: 3,
    arrowSize: 15,
    hideCursor: hideCursor, // 커서 숨김 옵션
    lineColor: '#667eea',
    correctColor: '#4CAF50',
    allowMultipleAttempts: true,
    showFeedback: true,
    onCorrect: (fromId: string, toId: string) => {
      console.log(`✅ 정답! ${fromId} → ${toId}`);
    },
    onIncorrect: (fromId: string, toId: string) => {
      console.log(`❌ 오답: ${fromId} → ${toId}`);
    },
  });

  updateModeStatus();
}

// 모드 전환
function toggleCursorMode(): void {
  hideCursorEnabled = !hideCursorEnabled;
  createInstance(hideCursorEnabled);
}

// 상태 표시 업데이트
function updateModeStatus(): void {
  const statusEl = document.getElementById('mode-status');
  if (!statusEl) return;

  if (hideCursorEnabled) {
    statusEl.textContent = '🟢 현재 모드: 시스템 커서 숨김 (hideCursor: true)';
    statusEl.style.color = '#4CAF50';
  } else {
    statusEl.textContent = '🔴 현재 모드: 시스템 커서 표시 (hideCursor: false)';
    statusEl.style.color = '#F44336';
  }
}

// 드래그 상태 고정 (디버그용)
function freezeDragState(): void {
  const container = document.getElementById('demo-custom-cursor');
  const pointA = document.querySelector('[data-id="a"]') as HTMLElement;
  const pointB1 = document.querySelector('[data-id="b1"]') as HTMLElement;

  if (!container || !pointA || !pointB1) {
    console.error('포인트를 찾을 수 없습니다');
    return;
  }

  // 기존 디버그 SVG 제거
  if (debugSvg) {
    debugSvg.remove();
  }

  // 컨테이너와 포인트의 위치 계산
  const containerRect = container.getBoundingClientRect();
  const rectA = pointA.getBoundingClientRect();
  const rectB1 = pointB1.getBoundingClientRect();

  // A의 오른쪽 중앙 (right, center)
  const x1 = rectA.right - containerRect.left;
  const y1 = rectA.top + rectA.height / 2 - containerRect.top;

  // B1의 왼쪽 중앙 (left, center)
  const x2 = rectB1.left - containerRect.left;
  const y2 = rectB1.top + rectB1.height / 2 - containerRect.top;

  // SVG 생성
  debugSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  debugSvg.setAttribute('width', containerRect.width.toString());
  debugSvg.setAttribute('height', containerRect.height.toString());
  debugSvg.style.position = 'absolute';
  debugSvg.style.top = '0';
  debugSvg.style.left = '0';
  debugSvg.style.pointerEvents = 'none';
  debugSvg.style.zIndex = '1000';

  // Defs와 Marker 생성
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'debug-arrow');
  marker.setAttribute('markerWidth', '15');
  marker.setAttribute('markerHeight', '15');
  marker.setAttribute('refX', '12');
  marker.setAttribute('refY', '7.5');
  marker.setAttribute('orient', 'auto');

  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', '0,0 0,15 15,7.5');
  polygon.setAttribute('fill', '#FF5722');

  marker.appendChild(polygon);
  defs.appendChild(marker);
  debugSvg.appendChild(defs);

  // Line 생성
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1.toString());
  line.setAttribute('y1', y1.toString());
  line.setAttribute('x2', x2.toString());
  line.setAttribute('y2', y2.toString());
  line.setAttribute('stroke', '#FF5722');
  line.setAttribute('stroke-width', '4');
  line.setAttribute('marker-end', 'url(#debug-arrow)');

  debugSvg.appendChild(line);
  container.appendChild(debugSvg);

  // 상태 표시
  const debugStatus = document.getElementById('debug-status');
  if (debugStatus) {
    debugStatus.textContent = `🔍 디버그 모드: A(${Math.round(x1)}, ${Math.round(y1)}) → B1(${Math.round(x2)}, ${Math.round(y2)})`;
    debugStatus.style.color = '#FF5722';
  }

  console.log('🐛 드래그 상태 고정:', { x1, y1, x2, y2 });
}

// 드래그 상태 고정 해제
function unfreezeDragState(): void {
  if (debugSvg) {
    debugSvg.remove();
    debugSvg = null;
  }

  const debugStatus = document.getElementById('debug-status');
  if (debugStatus) {
    debugStatus.textContent = '✅ 디버그 모드 해제';
    debugStatus.style.color = '#4CAF50';
  }
}

// Polygon points를 스케일링하는 함수
function scalePolygonPoints(points: string, scale: number): string {
  return points
    .split(' ')
    .map(pair => {
      const [x, y] = pair.split(',').map(Number);
      return `${x * scale},${y * scale}`;
    })
    .join(' ');
}

// Shape 값을 파싱하는 함수
function parseShapeValue(shapeValue: string): { type: string; data: string } {
  const [type, data] = shapeValue.split(':');
  return { type, data };
}

// Marker 엘리먼트 생성 (polygon, circle, chevron 등)
function createMarkerElement(
  type: string,
  data: string,
  color: string,
  scale: number
): { element: SVGElement; code: string } {
  const ns = 'http://www.w3.org/2000/svg';

  if (type === 'polygon') {
    const polygon = document.createElementNS(ns, 'polygon');
    const scaledPoints = scalePolygonPoints(data, scale);
    polygon.setAttribute('points', scaledPoints);
    polygon.setAttribute('fill', color);
    return { element: polygon, code: `<polygon points="${scaledPoints}" fill="${color}" />` };
  } else if (type === 'circle') {
    const circle = document.createElementNS(ns, 'circle');
    const radius = Number.parseFloat(data) * scale;
    circle.setAttribute('cx', radius.toString());
    circle.setAttribute('cy', radius.toString());
    circle.setAttribute('r', radius.toString());
    circle.setAttribute('fill', color);
    return { element: circle, code: `<circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}" />` };
  } else if (type === 'circle-stroke') {
    // 빈 원형: 배경 원 + 테두리 원 (선을 가리기 위해)
    const g = document.createElementNS(ns, 'g');
    const radius = Number.parseFloat(data) * scale;
    const strokeWidth = Math.max(1, radius * 0.2);

    // 배경 원 (흰색, 선을 가림)
    const bgCircle = document.createElementNS(ns, 'circle');
    bgCircle.setAttribute('cx', radius.toString());
    bgCircle.setAttribute('cy', radius.toString());
    bgCircle.setAttribute('r', (radius - strokeWidth / 2).toString());
    bgCircle.setAttribute('fill', 'white');

    // 테두리 원
    const strokeCircle = document.createElementNS(ns, 'circle');
    strokeCircle.setAttribute('cx', radius.toString());
    strokeCircle.setAttribute('cy', radius.toString());
    strokeCircle.setAttribute('r', (radius - strokeWidth / 2).toString());
    strokeCircle.setAttribute('fill', 'none');
    strokeCircle.setAttribute('stroke', color);
    strokeCircle.setAttribute('stroke-width', strokeWidth.toString());

    g.appendChild(bgCircle);
    g.appendChild(strokeCircle);

    const code = `<circle cx="${radius}" cy="${radius}" r="${radius - strokeWidth / 2}" fill="white" />
    <circle cx="${radius}" cy="${radius}" r="${radius - strokeWidth / 2}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />`;

    return { element: g, code };
  } else if (type === 'chevron') {
    // 열린 삼각형: 꺾인 막대기 형태 (polyline with stroke)
    // 꼭지점이 오른쪽(선 끝)에 오도록 배치
    const size = Number.parseFloat(data) * scale;
    const strokeWidth = Math.max(1.5, size * 0.15);

    // V 형태의 polyline - 꼭지점이 오른쪽에 위치
    const polyline = document.createElementNS(ns, 'polyline');
    const height = size * 0.7; // 열림 높이
    const points = `0,${size - height} ${size},${size} 0,${size + height}`;
    polyline.setAttribute('points', points);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', color);
    polyline.setAttribute('stroke-width', strokeWidth.toString());
    polyline.setAttribute('stroke-linecap', 'round');
    polyline.setAttribute('stroke-linejoin', 'round');

    return {
      element: polyline,
      code: `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`,
    };
  }

  // Fallback
  return { element: document.createElementNS(ns, 'g'), code: '' };
}

// 마커 크기 자동 계산
function calculateMarkerDimensions(type: string, data: string, scale: number): { width: number; height: number } {
  if (type === 'polygon') {
    const points = data.split(' ').map(pair => {
      const [x, y] = pair.split(',').map(Number);
      return { x, y };
    });
    const maxX = Math.max(...points.map(p => p.x));
    const maxY = Math.max(...points.map(p => p.y));
    return {
      width: maxX * scale,
      height: maxY * scale,
    };
  } else if (type === 'circle' || type === 'circle-stroke') {
    const radius = Number.parseFloat(data);
    const diameter = radius * 2 * scale;
    return {
      width: diameter,
      height: diameter,
    };
  } else if (type === 'chevron') {
    const size = Number.parseFloat(data) * scale;
    const height = size * 0.7;
    return {
      width: size,
      height: size + height, // 1.7 * size
    };
  }
  return { width: 15, height: 15 }; // fallback
}

// Marker 파라미터 업데이트
function updateMarkerParams(): void {
  // 파라미터 값 읽기
  const refX = Number.parseFloat((document.getElementById('refX') as HTMLInputElement).value);
  const refY = Number.parseFloat((document.getElementById('refY') as HTMLInputElement).value);
  const shapeValue = (document.getElementById('polygonShape') as HTMLSelectElement).value;
  const lineWidth = Number.parseFloat((document.getElementById('lineWidth') as HTMLInputElement).value);
  const markerScale = Number.parseFloat((document.getElementById('markerScale') as HTMLInputElement).value);
  const markerColor = (document.getElementById('markerColor') as HTMLInputElement).value;
  const useStrokeWidth = (document.getElementById('markerUnits') as HTMLInputElement).checked;

  // Shape 파싱
  const { type, data } = parseShapeValue(shapeValue);
  const { code: markerCode } = createMarkerElement(type, data, markerColor, markerScale);

  // 마커 크기 자동 계산
  const { width: markerWidth, height: markerHeight } = calculateMarkerDimensions(type, data, markerScale);

  const scaledRefX = refX * markerScale;
  const scaledRefY = refY * markerScale;

  // 값 표시 업데이트
  const refXValue = document.getElementById('refXValue');
  const refYValue = document.getElementById('refYValue');
  const lineWidthValue = document.getElementById('lineWidthValue');
  const markerScaleValue = document.getElementById('markerScaleValue');
  const markerColorValue = document.getElementById('markerColorValue');

  if (refXValue) refXValue.textContent = refX.toString();
  if (refYValue) refYValue.textContent = refY.toString();
  if (lineWidthValue) lineWidthValue.textContent = lineWidth.toString();
  if (markerScaleValue) markerScaleValue.textContent = markerScale.toString();
  if (markerColorValue) markerColorValue.textContent = markerColor;

  // 코드 표시 업데이트
  const markerUnitsAttr = useStrokeWidth ? '\n    markerUnits="strokeWidth"' : '';
  const code = `<defs>
  <marker id="arrow"
    markerWidth="${markerWidth}"
    markerHeight="${markerHeight}"
    refX="${scaledRefX}"
    refY="${scaledRefY}"
    orient="auto"${markerUnitsAttr}>
    ${markerCode}
  </marker>
</defs>
<line x1="..." y1="..." x2="..." y2="..."
  stroke="${markerColor}"
  stroke-width="${lineWidth}"
  marker-end="url(#arrow)" />`;

  const paramCode = document.getElementById('paramCode');
  if (paramCode) paramCode.textContent = code;

  // SVG 프리뷰 렌더링
  updateSvgPreview(
    markerWidth,
    markerHeight,
    scaledRefX,
    scaledRefY,
    type,
    data,
    markerScale,
    lineWidth,
    markerColor,
    useStrokeWidth
  );

  // 디버그 SVG가 있으면 실시간 업데이트
  if (debugSvg) {
    updateDebugSvgWithParams(
      markerWidth,
      markerHeight,
      scaledRefX,
      scaledRefY,
      type,
      data,
      markerScale,
      lineWidth,
      markerColor,
      useStrokeWidth
    );
  }
}

// SVG 프리뷰 렌더링
function updateSvgPreview(
  markerWidth: number,
  markerHeight: number,
  refX: number,
  refY: number,
  shapeType: string,
  shapeData: string,
  scale: number,
  lineWidth: number,
  markerColor: string,
  useStrokeWidth = false
): void {
  const previewContainer = document.getElementById('svgPreview');
  if (!previewContainer) return;

  // 기존 SVG 제거
  previewContainer.innerHTML = '';

  // 새 SVG 생성
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '250');
  svg.setAttribute('height', '100');
  svg.setAttribute('viewBox', '0 0 250 100');

  // Defs와 Marker 생성
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'preview-arrow');
  marker.setAttribute('markerWidth', markerWidth.toString());
  marker.setAttribute('markerHeight', markerHeight.toString());
  marker.setAttribute('refX', refX.toString());
  marker.setAttribute('refY', refY.toString());
  marker.setAttribute('orient', 'auto');

  if (useStrokeWidth) {
    marker.setAttribute('markerUnits', 'strokeWidth');
  }

  // Marker 엘리먼트 생성
  const { element } = createMarkerElement(shapeType, shapeData, markerColor, scale);
  marker.appendChild(element);
  defs.appendChild(marker);
  svg.appendChild(defs);

  // 3개의 선 생성 (다양한 각도)
  const lines = [
    { x1: 20, y1: 50, x2: 80, y2: 50, label: '→' },
    { x1: 100, y1: 70, x2: 150, y2: 30, label: '↗' },
    { x1: 170, y1: 30, x2: 220, y2: 70, label: '↘' },
  ];

  lines.forEach(({ x1, y1, x2, y2 }) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());
    line.setAttribute('stroke', markerColor);
    line.setAttribute('stroke-width', lineWidth.toString());
    line.setAttribute('marker-end', 'url(#preview-arrow)');
    svg.appendChild(line);
  });

  previewContainer.appendChild(svg);
}

// 디버그 SVG를 새 파라미터로 업데이트
function updateDebugSvgWithParams(
  markerWidth: number,
  markerHeight: number,
  refX: number,
  refY: number,
  shapeType: string,
  shapeData: string,
  scale: number,
  lineWidth: number,
  markerColor: string,
  useStrokeWidth = false
): void {
  if (!debugSvg) return;

  const container = document.getElementById('demo-custom-cursor');
  const pointA = document.querySelector('[data-id="a"]') as HTMLElement;
  const pointB1 = document.querySelector('[data-id="b1"]') as HTMLElement;

  if (!container || !pointA || !pointB1) return;

  const containerRect = container.getBoundingClientRect();
  const rectA = pointA.getBoundingClientRect();
  const rectB1 = pointB1.getBoundingClientRect();

  const x1 = rectA.right - containerRect.left;
  const y1 = rectA.top + rectA.height / 2 - containerRect.top;
  const x2 = rectB1.left - containerRect.left;
  const y2 = rectB1.top + rectB1.height / 2 - containerRect.top;

  // 기존 SVG 제거 및 새로 생성
  debugSvg.remove();

  debugSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  debugSvg.setAttribute('width', containerRect.width.toString());
  debugSvg.setAttribute('height', containerRect.height.toString());
  debugSvg.style.position = 'absolute';
  debugSvg.style.top = '0';
  debugSvg.style.left = '0';
  debugSvg.style.pointerEvents = 'none';
  debugSvg.style.zIndex = '1000';

  // Defs와 Marker 생성 (marker-end 방식)
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'debug-arrow-marker');
  marker.setAttribute('markerWidth', markerWidth.toString());
  marker.setAttribute('markerHeight', markerHeight.toString());
  marker.setAttribute('refX', refX.toString());
  marker.setAttribute('refY', refY.toString());
  marker.setAttribute('orient', 'auto');

  if (useStrokeWidth) {
    marker.setAttribute('markerUnits', 'strokeWidth');
  }

  // Marker 엘리먼트 생성
  const { element } = createMarkerElement(shapeType, shapeData, markerColor, scale);
  marker.appendChild(element);
  defs.appendChild(marker);
  debugSvg.appendChild(defs);

  // Line 생성 (marker-end 사용)
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1.toString());
  line.setAttribute('y1', y1.toString());
  line.setAttribute('x2', x2.toString());
  line.setAttribute('y2', y2.toString());
  line.setAttribute('stroke', markerColor);
  line.setAttribute('stroke-width', lineWidth.toString());
  line.setAttribute('marker-end', 'url(#debug-arrow-marker)');

  debugSvg.appendChild(line);
  container.appendChild(debugSvg);
}

// Expose functions to window for onclick handlers
declare global {
  interface Window {
    toggleCursorMode: () => void;
    freezeDragState: () => void;
    unfreezeDragState: () => void;
    updateMarkerParams: () => void;
  }
}

window.toggleCursorMode = toggleCursorMode;
window.freezeDragState = freezeDragState;
window.unfreezeDragState = unfreezeDragState;
window.updateMarkerParams = updateMarkerParams;

// 초기 실행
createInstance(hideCursorEnabled);
updateMarkerParams(); // 초기 파라미터 코드 표시

console.log('🎯 Custom Cursor 데모 로드 완료!');
console.log('A 포인트를 드래그하여 B1 또는 B2와 연결해보세요.');
console.log('드래그 중에는 시스템 커서가 숨겨지고 화살표 커서만 표시됩니다.');
