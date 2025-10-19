# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Line Matching System (2025-01-20)

#### 새로운 기능
- **Line Matching 시스템** (`src-ts/advanced/line-matching.ts`)
  - SVG 기반 포인트 간 선 연결 매칭 게임
  - 드래그 앤 드롭으로 선 연결
  - 정답/오답 자동 판정 및 피드백

- **5가지 선 스타일 지원**
  - `solid`: 실선 (기본)
  - `dashed`: 점선
  - `dotted`: 점선 (작은 점)
  - `animated-dash`: 애니메이션 점선
  - `arrow`: 화살표 (SVG marker-end 기반)

- **SVG Marker-End 시스템**
  - `marker-end` 속성을 활용한 화살표 렌더링
  - 자동 방향 설정 (`orient="auto"`)
  - markerWidth/Height 자동 계산 로직
  - 4가지 마커 형태: 삼각형, 원형, 빈 원형, 열린 삼각형

- **커서 제어**
  - 드래그 중 시스템 커서 자동 숨김 (`hideCursor: true`)
  - `cursor: none !important` 스타일 동적 적용/제거

- **TypeScript 타입 정의 및 Export**
  - `PositionValue`: 위치 값 타입
  - `PointPosition`: 포인트 위치 인터페이스
  - `MatchItem`: 매칭 아이템 인터페이스
  - `LineStyle`: 선 스타일 타입
  - `LineMatchingOptions`: 옵션 인터페이스
  - 모든 공개 타입에 JSDoc 주석 및 예제 추가

- **인터랙티브 데모 페이지**
  - `examples/custom-cursor-demo.html`: SVG marker-end 파라미터 조정 UI
    - 실시간 파라미터 슬라이더 (refX, refY, scale, color, lineWidth)
    - 4가지 마커 형태 선택 (삼각형, 원형, 빈 원형, 열린 삼각형)
    - 실시간 SVG 렌더링 프리뷰
    - SVG 코드 자동 생성
    - 드래그 상태 고정 디버깅 기능
  - `examples/line-matching.html`: 기본 Line Matching 데모

#### 빌드 시스템 개선
- **Rollup 번들러 추가** (`rollup.config.js`)
  - TypeScript → IIFE 포맷 번들링
  - GSAP 외부 의존성 처리
  - Terser 압축 및 소스맵 지원
  - 출력: `dist/line-matching.min.js`

- **빌드 스크립트 추가** (`package.json`)
  - `npm run bundle`: Rollup 번들 생성
  - `npm run bundle:watch`: 감시 모드 번들링

- **빌드 후처리** (`scripts/remove-exports.js`)
  - export 문 자동 제거 스크립트

#### 공통 타입 시스템
- **타입 유틸리티** (`src-ts/types.ts`)
  - `DOMTarget`: DOM 요소 타겟 타입
  - `AnimationTarget`: 애니메이션 타겟 타입
  - `BaseDraggableOptions`: 드래그 기본 옵션
  - `BaseAnimationOptions`: 애니메이션 기본 옵션
  - `validateTarget()`: 타겟 검증 유틸리티
  - `debug()`: 디버그 로깅 함수
  - `toElementArray()`: 요소 배열 변환 유틸리티

#### 문서화
- **README 업데이트**
  - Line Matching 섹션 추가
  - 프로젝트 구조 업데이트 (advanced/ 폴더 포함)
  - 사용 예제 추가 (기본 연결, 다중 선택, 화살표 스타일)
  - 5가지 선 스타일 예제
  - 로드맵 업데이트

- **JSDoc 주석 추가**
  - 모든 공개 인터페이스에 상세한 주석
  - `@public`, `@param`, `@returns` 태그
  - 실제 사용 예제 (`@example`)

### Technical Details

#### Line Matching 아키텍처
```typescript
// 공개 API
export function createLineMatching(options: LineMatchingOptions): LineMatchingInstance

// 반환 인스턴스 메서드
- reset(): void      // 모든 연결 초기화
- destroy(): void    // 인스턴스 제거
```

#### 주요 옵션
```typescript
interface LineMatchingOptions {
  items: { [id: string]: MatchItem };
  pairs: { [id: string]: string | string[] };
  container?: string | HTMLElement;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'animated-dash' | 'arrow';
  hideCursor?: boolean;
  onCorrect?: (fromId: string, toId: string) => void;
  onIncorrect?: (fromId: string, toId: string) => void;
  // ... more options
}
```

#### 마커 크기 자동 계산
```javascript
function calculateMarkerDimensions(type, data, scale) {
  // polygon: points 좌표에서 최대값 추출
  // circle: 반지름 × 2
  // chevron: width=size, height=1.7×size
}
```

### Improved

- **타입 안전성 강화**: 모든 공개 타입 export
- **재사용성 개선**: 타입 재사용 가능하도록 export
- **개발자 경험**: JSDoc 주석으로 IntelliSense 지원
- **빌드 파이프라인**: TypeScript → Rollup → Minified IIFE

### Files Changed

#### Added
- `src-ts/advanced/line-matching.ts` (1320 lines)
- `src-ts/types.ts` (92 lines)
- `examples/custom-cursor-demo.html` (1210 lines)
- `examples/line-matching.html`
- `examples/stroke-preview.html`
- `rollup.config.js`
- `scripts/remove-exports.js`
- `CHANGELOG.md`

#### Modified
- `README.md` - Line Matching 문서 추가
- `package.json` - Rollup 스크립트 추가
- `src-ts/draggable/*.ts` - 타입 import 개선
- `src-ts/animations/*.ts` - 타입 import 개선
- `src-ts/utils/helpers.ts` - 타입 import 개선

### Performance

- SVG marker-end 방식으로 화살표 렌더링 최적화
- 각 연결마다 독립적인 SVG 엘리먼트 생성
- 드래그 중에만 임시 SVG 생성, 완료 후 영구 SVG로 전환

### Browser Compatibility

- Chrome (latest) ✅
- Firefox (latest) ✅
- Safari (latest) ✅
- Edge (latest) ✅

### Breaking Changes

없음 - 기존 API와 완전히 호환됨

### Migration Guide

기존 프로젝트에 Line Matching 추가하기:

```html
<!-- GSAP CDN -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/Draggable.min.js"></script>

<!-- Line Matching (번들) -->
<script src="./dist/line-matching.min.js"></script>

<script>
const matching = createLineMatching({
  // ... options
});
</script>
```

---

## [1.0.0] - 2025-01-XX

### Added
- 초기 릴리스
- 기본 드래그 함수들 (basic.ts)
- 고급 드래그 함수들 (advanced.ts)
- 애니메이션 함수들 (fade, slide, scroll, rotate)
- TypeScript 지원

---

[Unreleased]: https://github.com/mineclover/gsap-kit/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mineclover/gsap-kit/releases/tag/v1.0.0
