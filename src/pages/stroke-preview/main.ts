import { createLineMatching } from '../../lib/advanced/line-matching';

// Solid 스타일 데모
const solidDemo = createLineMatching({
  container: '#demo-solid',
  items: {
    's-a1': { selector: '[data-id="s-a1"]', point: { x: 'right', y: 'center' } },
    's-b1': { selector: '[data-id="s-b1"]', point: { x: 'left', y: 'center' } }
  },
  pairs: { 's-a1': 's-b1' },
  lineStyle: 'solid',
  lineWidth: 2,
  lineColor: '#667eea',
  correctColor: '#4CAF50',
  allowMultipleAttempts: false,
  showFeedback: false
});

// Dashed 스타일 데모 (dashArray 자동 계산: lineWidth * 3, lineWidth * 2)
const dashedDemo = createLineMatching({
  container: '#demo-dashed',
  items: {
    'd-a1': { selector: '[data-id="d-a1"]', point: { x: 'right', y: 'center' } },
    'd-b1': { selector: '[data-id="d-b1"]', point: { x: 'left', y: 'center' } }
  },
  pairs: { 'd-a1': 'd-b1' },
  lineStyle: 'dashed',
  lineWidth: 2,
  // dashArray 생략 시 자동으로 "6,4" (lineWidth * 3, lineWidth * 2)
  lineColor: '#667eea',
  correctColor: '#4CAF50',
  allowMultipleAttempts: false,
  showFeedback: false
});

// Dotted 스타일 데모
const dottedDemo = createLineMatching({
  container: '#demo-dotted',
  items: {
    'dt-a1': { selector: '[data-id="dt-a1"]', point: { x: 'right', y: 'center' } },
    'dt-b1': { selector: '[data-id="dt-b1"]', point: { x: 'left', y: 'center' } }
  },
  pairs: { 'dt-a1': 'dt-b1' },
  lineStyle: 'dotted',
  lineWidth: 2,
  lineColor: '#667eea',
  correctColor: '#4CAF50',
  allowMultipleAttempts: false,
  showFeedback: false
});

// Animated Dash 스타일 데모
const animatedDemo = createLineMatching({
  container: '#demo-animated',
  items: {
    'ad-a1': { selector: '[data-id="ad-a1"]', point: { x: 'right', y: 'center' } },
    'ad-b1': { selector: '[data-id="ad-b1"]', point: { x: 'left', y: 'center' } }
  },
  pairs: { 'ad-a1': 'ad-b1' },
  lineStyle: 'animated-dash',
  lineWidth: 2,
  // dashArray 생략 시 자동으로 "6,4"
  lineColor: '#667eea',
  correctColor: '#4CAF50',
  allowMultipleAttempts: false,
  showFeedback: false
});

// Arrow 스타일 데모 (arrowSize 자동 계산: lineWidth * 5, 커스텀 커서 활성화)
const arrowDemo = createLineMatching({
  container: '#demo-arrow',
  items: {
    'ar-a1': { selector: '[data-id="ar-a1"]', point: { x: 'right', y: 'center' } },
    'ar-b1': { selector: '[data-id="ar-b1"]', point: { x: 'left', y: 'center' } }
  },
  pairs: { 'ar-a1': 'ar-b1' },
  lineStyle: 'arrow',
  lineWidth: 2,
  hideCursor: true, // 드래그 중 시스템 커서 숨김 (커스텀 화살표 커서만 표시)
  // arrowSize 생략 시 자동으로 10 (lineWidth * 5)
  lineColor: '#667eea',
  correctColor: '#4CAF50',
  allowMultipleAttempts: false,
  showFeedback: false
});

console.log('🎨 Stroke Preview 데모 로드 완료!');
console.log('각 카드의 포인트를 연결하여 다양한 선 스타일을 확인해보세요.');
