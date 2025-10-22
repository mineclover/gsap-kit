# GSAP Kit 개발 컨벤션 (Development Conventions)

> **단일 원천 (Single Source of Truth)**
> 이 문서는 GSAP Kit의 모든 개발 규칙을 정의하는 **유일한 공식 문서**입니다.

**버전**: 2.0
**최종 수정**: 2025-01-22
**상태**: ✅ Active

---

## 📚 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처](#아키텍처)
3. [코딩 컨벤션](#코딩-컨벤션)
4. [Git 컨벤션](#git-컨벤션)
5. [빌드 시스템](#빌드-시스템)
6. [테스트](#테스트)
7. [문서화](#문서화)
8. [배포](#배포)

---

## 프로젝트 개요

**GSAP Kit**: 순수 JavaScript + GSAP CDN을 사용하는 재사용 가능한 인터랙션 함수 라이브러리

### 핵심 가치

- 🎯 **드래그 & 인터랙션 중심**: Draggable 플러그인 활용
- ✅ **TypeScript 지원**: 완전한 타입 정의
- ✅ **번들러 불필요**: CDN으로 바로 사용 가능
- 🚀 **자동 확장**: 파일 추가만으로 빌드 설정 자동 업데이트

### 기술 스택

- **언어**: TypeScript 5.3+
- **런타임**: Node.js 16+
- **빌드 도구**: Rollup 4.x
- **의존성**: GSAP 3.13+ (peerDependency)
- **포맷터**: Biome 2.x
- **Git Hooks**: Husky 9.x

---

## 아키텍처

### 디렉토리 구조

```
gsap-kit/
├── src/
│   ├── lib/                   # 라이브러리 코드 (TypeScript)
│   │   ├── core/              # Core System (Validator & Builder)
│   │   ├── advanced/          # 고급 인터랙션
│   │   ├── animations/        # 애니메이션 함수
│   │   ├── draggable/         # 드래그 함수
│   │   ├── testing/           # 테스트 도구
│   │   ├── utils/             # 유틸리티
│   │   └── types.ts           # 공통 타입
│   ├── pages/                 # 데모 페이지
│   │   └── [page-name]/
│   │       ├── main.ts
│   │       ├── index.html
│   │       └── style.css
│   └── index.ts               # Bundle 진입점
├── dist/                      # 빌드 출력
│   ├── lib/                   # CDN 개별 파일
│   ├── pages/                 # 페이지 번들
│   ├── main.esm.js            # ESM 번들
│   └── main.umd.js            # UMD 번들
├── scripts/                   # 빌드 스크립트
├── docs/                      # (deprecated - 루트 이동)
└── examples/                  # (deprecated - src/pages로 이동)
```

### 진입점 시스템

GSAP Kit은 **자동 확장 시스템**을 사용합니다:

```typescript
// 자동으로 감지되는 진입점
src/lib/**/*.ts         → CDN 개별 파일 (자동)
src/pages/**/main.ts    → 페이지 번들 (자동)
src/index.ts            → Bundle 진입점 (수동)
```

**상세**: [AUTO_EXPANSION_GUIDE.md](./AUTO_EXPANSION_GUIDE.md)

---

## 코딩 컨벤션

### 파일 명명 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| TypeScript | kebab-case | `line-matching.ts` |
| 테스트 | `.test.ts` 또는 `.spec.ts` | `validator.test.ts` |
| 타입 정의 | `.d.ts` | `types.d.ts` |
| 설정 | `.config.js` | `rollup.config.js` |

### 함수 명명 규칙

#### 1. 드래그 함수 (Draggable)

**패턴**: `make` + 동작 + 명사

```typescript
makeDraggable()       // 기본 드래그
makeDraggableX()      // X축 드래그
makeDraggableY()      // Y축 드래그
makeSlider()          // 슬라이더
makeSortable()        // 정렬 가능
makeSwipeable()       // 스와이프
```

#### 2. 애니메이션 함수

**패턴**: 동작 + In/Out + 방향

```typescript
fadeIn()              // 페이드 인
fadeOut()             // 페이드 아웃
fadeInUp()            // 위로 페이드 인
slideInLeft()         // 왼쪽에서 슬라이드
scrollFadeIn()        // 스크롤 페이드 인
```

#### 3. 생성자 함수 (Advanced)

**패턴**: `create` + PascalCase

```typescript
createLineMatching()  // 선 연결 매칭 생성
createPuzzleDrag()    // 퍼즐 드래그 생성
```

#### 4. 클래스 (Core/Testing)

**패턴**: PascalCase

```typescript
class DOMValidator {}
class InteractionBuilder {}
class MouseSimulator {}
```

### TypeScript 코딩 스타일

#### 함수 시그니처

```typescript
/**
 * 요소를 페이드 인시킵니다
 *
 * @param target - CSS 선택자 또는 DOM 요소
 * @param options - 애니메이션 옵션
 * @returns GSAP Tween 인스턴스
 *
 * @example
 * ```typescript
 * fadeIn('.box', { duration: 1.5 });
 * ```
 */
export function fadeIn(
  target: gsap.TweenTarget,
  options: FadeOptions = {}
): gsap.core.Tween {
  const defaults: FadeOptions = {
    duration: 1,
    delay: 0,
    ease: 'power2.out',
  };

  const config = { ...defaults, ...options };

  return gsap.to(target, config);
}
```

#### 타입 정의

```typescript
// Interface for options
interface FadeOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  y?: number;
  onComplete?: () => void;
}

// Type for union types
type DragType = 'x' | 'y' | 'x,y' | 'rotation';

// Utility types
type ElementOrSelector = string | HTMLElement | NodeList;
```

#### 에러 처리

```typescript
export function makeDraggable(
  target: gsap.TweenTarget,
  options: DraggableOptions = {}
): Draggable[] | null {
  // 입력 검증
  if (!target) {
    console.error('[GSAP Kit] target이 필요합니다');
    return null;
  }

  // GSAP 검증
  if (typeof Draggable === 'undefined') {
    console.error('[GSAP Kit] Draggable 플러그인이 로드되지 않았습니다');
    return null;
  }

  // 정상 실행
  return Draggable.create(target, options);
}
```

### 코드 포맷팅

**도구**: Biome

```bash
# 포맷 확인
npm run format

# 포맷 자동 수정
npm run format:write

# Lint + Format
npm run check:write
```

**규칙**:
- 들여쓰기: 2 spaces
- 따옴표: 싱글 ('`'`)
- 세미콜론: 필수
- Trailing comma: 사용
- 최대 줄 길이: 120자

### JSDoc 주석

모든 export된 함수/클래스는 JSDoc 필수:

```typescript
/**
 * 한 줄 요약
 *
 * 상세 설명 (선택)
 *
 * @param paramName - 파라미터 설명
 * @param options - 옵션 객체
 * @param options.duration - 지속 시간
 * @returns 반환값 설명
 *
 * @example
 * ```typescript
 * const result = myFunction('test', { duration: 1 });
 * ```
 *
 * @throws {Error} 에러 발생 조건
 * @deprecated 대체 방법
 */
```

---

## Git 컨벤션

### 브랜치 전략

```
main (master)
  └── feature/feature-name
  └── fix/bug-name
  └── docs/doc-name
  └── refactor/refactor-name
```

### 커밋 메시지 형식

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

#### Type

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat: Add bounce animation` |
| `fix` | 버그 수정 | `fix: Resolve drag boundary issue` |
| `docs` | 문서 수정 | `docs: Update README with new examples` |
| `style` | 코드 포맷팅 | `style: Format with Biome` |
| `refactor` | 리팩토링 | `refactor: Simplify fade animation logic` |
| `perf` | 성능 개선 | `perf: Optimize line matching algorithm` |
| `test` | 테스트 추가/수정 | `test: Add unit tests for validator` |
| `build` | 빌드 시스템 | `build: Add auto-expansion to build config` |
| `ci` | CI 설정 | `ci: Add GitHub Actions workflow` |
| `chore` | 기타 변경 | `chore: Update dependencies` |
| `revert` | 커밋 되돌리기 | `revert: Revert "feat: Add feature"` |

#### Scope (선택)

| Scope | 설명 |
|-------|------|
| `core` | Core 시스템 |
| `animations` | 애니메이션 함수 |
| `draggable` | 드래그 함수 |
| `testing` | 테스트 도구 |
| `build` | 빌드 시스템 |
| `docs` | 문서 |

#### Subject 규칙

- 명령형 현재 시제 (Add, not Added or Adds)
- 첫 글자 대문자
- 마침표 없음
- 50자 이내

#### Body (선택)

- 72자마다 줄바꿈
- 무엇을, 왜 변경했는지 설명
- How는 코드로 설명

#### Footer (선택)

```
BREAKING CHANGE: 설명

Closes #123
Fixes #456
```

### 예시

```
feat(animations): Add bounce animation functions

Add bounceIn() and bounceOut() functions with configurable options.
These functions provide elastic bounce effects using GSAP's bounce.out easing.

Closes #45
```

```
fix(draggable): Resolve boundary calculation bug

Fixed an issue where drag boundaries were incorrectly calculated
when the parent element had CSS transforms applied.

Fixes #78
```

### 커밋 시 자동 검증

```bash
# Husky pre-commit hook
- Biome check (lint + format)
- Type check (tsc --noEmit)
- Entry points validation

# Husky commit-msg hook
- Commit message format validation
```

---

## 빌드 시스템

### 빌드 모드

| 모드 | 명령어 | 출력 | 용도 |
|------|--------|------|------|
| CDN | `npm run build:cdn` | 개별 파일 | 스크립트 태그 사용 |
| Bundle | `npm run build:bundle` | 단일 파일 | NPM import |
| 전체 | `npm run build:all` | 둘 다 | 배포 |

### 자동 확장

새 파일 추가 시 **자동으로 빌드 설정 업데이트**:

```bash
# 1. 파일 생성
touch src/lib/animations/bounce.ts

# 2. 코드 작성

# 3. 빌드 (자동 감지!)
npm run build
```

**상세**: [AUTO_EXPANSION_GUIDE.md](./AUTO_EXPANSION_GUIDE.md)

### 빌드 전 자동 검증

```bash
# prebuild hook에서 자동 실행
npm run validate:entries  # 진입점 검증
npm run type-check        # 타입 체크
```

### Override 설정

세밀한 제어가 필요한 경우:

```javascript
// build.config.js
const overrides = {
  'src/lib/animations/fade.ts': {
    name: 'FadeAnimations',
    minify: true,
  },
  'src/lib/utils/deprecated.ts': false, // 제외
};
```

---

## 테스트

### 테스트 전략

| 레벨 | 도구 | 파일 패턴 |
|------|------|-----------|
| Unit | Jest (예정) | `*.test.ts` |
| Integration | Playwright | `*.spec.ts` |
| E2E | Playwright | `src/pages/**/main.ts` |
| Manual | 데모 페이지 | `src/pages/*/index.html` |

### 테스트 작성 가이드

```typescript
// bounce.test.ts
describe('bounceIn', () => {
  it('should create a tween with correct properties', () => {
    const result = bounceIn('.box', { duration: 2 });

    expect(result).toBeDefined();
    expect(result.duration()).toBe(2);
  });

  it('should use default options when not provided', () => {
    const result = bounceIn('.box');

    expect(result.duration()).toBe(1);
  });
});
```

### 자동화된 인터랙션 테스트

GSAP Kit은 JSON 기반 자동화 테스트 시스템을 제공합니다:

```typescript
// test-scenario.json
{
  "name": "Line Matching Test",
  "steps": [
    {
      "action": "drag",
      "from": ".item-a",
      "to": ".item-b"
    },
    {
      "action": "assert",
      "type": "connected",
      "items": ["a", "b"]
    }
  ]
}
```

**상세**: [Testing README](./src/lib/testing/README.md)

---

## 문서화

### 문서 계층

```
README.md                      # 프로젝트 개요 및 시작 가이드
├── CONVENTIONS.md             # 🎯 이 문서 (단일 원천)
├── QUICK_START.md             # 5분 튜토리얼
├── BUILD_SYSTEM_GUIDE.md      # 빌드 시스템 상세
├── ENTRY_POINTS_GUIDE.md      # 진입점 관리
├── AUTO_EXPANSION_GUIDE.md    # 자동 확장 시스템
├── INTERACTION_BUILDER_GUIDE.md
├── BUILDER_USAGE_EXAMPLES.md
└── PROJECT_STRUCTURE.md
```

### 문서 작성 규칙

#### Markdown 스타일

- 제목: `#`, `##`, `###` (최대 3단계)
- 코드 블록: 언어 명시 필수
- 링크: 상대 경로 사용
- 이모지: 제목에만 사용

#### 예제 코드

```typescript
// ✅ Good: 완전한 예제
import { fadeIn } from 'gsap-kit';

const box = document.querySelector('.box');
fadeIn(box, { duration: 1.5 });

// ❌ Bad: 불완전한 예제
fadeIn('.box');
```

#### 스크린샷

```markdown
![설명](./assets/screenshot.png)
```

### API 문서 자동 생성 (예정)

```bash
npm run docs:generate
```

---

## 배포

### NPM 배포 체크리스트

```bash
# 1. 버전 업데이트
npm version patch|minor|major

# 2. 전체 검증
npm run validate:entries
npm run type-check
npm run build:all

# 3. 커밋 및 태그
git add .
git commit -m "chore: Release v1.x.x"
git tag v1.x.x

# 4. 배포
npm publish

# 5. Push
git push origin master --tags
```

### 버전 관리 (Semantic Versioning)

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1 (patch)   # 버그 수정
1.0.1 → 1.1.0 (minor)   # 새 기능 (하위 호환)
1.1.0 → 2.0.0 (major)   # Breaking change
```

### CHANGELOG 관리

```markdown
## [1.2.0] - 2025-01-22

### Added
- Auto-expansion system for entry points
- Entry points validation script

### Changed
- Migrated from manual to auto build config

### Fixed
- TypeScript config for scripts folder
```

---

## 브라우저 지원

| 브라우저 | 버전 |
|----------|------|
| Chrome | 최신 2개 버전 |
| Firefox | 최신 2개 버전 |
| Safari | 최신 2개 버전 |
| Edge | 최신 2개 버전 |

---

## 라이센스

MIT License

---

## 참고 자료

### 내부 문서
- [README.md](./README.md)
- [AUTO_EXPANSION_GUIDE.md](./AUTO_EXPANSION_GUIDE.md)
- [ENTRY_POINTS_GUIDE.md](./ENTRY_POINTS_GUIDE.md)
- [BUILD_SYSTEM_GUIDE.md](./BUILD_SYSTEM_GUIDE.md)

### 외부 문서
- [GSAP Documentation](https://gsap.com/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Rollup Guide](https://rollupjs.org/guide/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 변경 이력

| 버전 | 날짜 | 변경 사항 |
|------|------|-----------|
| 2.0 | 2025-01-22 | 자동 확장 시스템 추가, 단일 원천으로 재구성 |
| 1.0 | 2024-XX-XX | 초기 컨벤션 문서 작성 |

---

**이 문서에 대한 질문이나 제안은 이슈로 등록해주세요.**

📝 **Last Updated**: 2025-01-22
✅ **Status**: Active
🔗 **Repository**: [github.com/mineclover/gsap-kit](https://github.com/mineclover/gsap-kit)
