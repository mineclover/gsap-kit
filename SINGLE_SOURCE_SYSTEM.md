# 단일 원천 관리 시스템 (Single Source of Truth System)

## 🎯 개요

GSAP Kit은 **단일 원천(Single Source of Truth)** 원칙을 따라 모든 설정과 문서를 관리합니다.

### 핵심 원칙

1. **하나의 파일만이 진실의 원천**
2. **자동 검증으로 일관성 보장**
3. **중복 제거로 유지보수 간소화**

---

## 📚 단일 원천 목록

### 1. 개발 컨벤션

**원천**: [`CONVENTIONS.md`](./CONVENTIONS.md)

| 항목 | 상태 |
|------|------|
| 위치 | 프로젝트 루트 |
| 검증 | `npm run validate:conventions` |
| 중복 문서 | ❌ (docs/CONVENTIONS.md는 deprecated) |

**포함 내용**:
- 코딩 스타일
- 네이밍 규칙
- Git 컨벤션
- 문서화 규칙
- 빌드 시스템
- 테스트 전략

### 2. 빌드 설정

**원천**: [`build.config.js`](./build.config.js)

| 항목 | 상태 |
|------|------|
| 자동 탐색 | ✅ (`src/lib/**/*.ts`) |
| 검증 | `npm run validate:entries` |
| Override | 지원 |

**자동 관리되는 것**:
- CDN 진입점 (15개)
- 페이지 진입점 (9개)
- name 자동 추론
- minify 옵션 자동 설정

### 3. 타입 정의

**원천**: [`src/lib/types.ts`](./src/lib/types.ts)

| 항목 | 상태 |
|------|------|
| 공통 타입 | ✅ 중앙 집중화 |
| 자동 생성 | ✅ (빌드 시 .d.ts) |

**포함 내용**:
- 공통 인터페이스
- 유틸리티 타입
- GSAP 타입 확장

### 4. 패키지 정보

**원천**: [`package.json`](./package.json)

| 항목 | 상태 |
|------|------|
| 의존성 | ✅ peerDependencies 명시 |
| 스크립트 | ✅ 중앙 집중화 |
| Exports | ✅ ESM/UMD 정의 |

---

## 🔍 자동 검증 시스템

### 검증 스크립트

| 스크립트 | 검증 대상 | 실행 시점 |
|----------|-----------|-----------|
| `validate:entries` | 진입점 동기화 | prebuild |
| `validate:conventions` | 컨벤션 단일 원천 | prebuild |
| `validate:all` | 전체 검증 | prebuild |

### 검증 항목

#### 1. 진입점 검증 (validate-entries.js)

✅ build.config.js의 모든 input 파일 존재
✅ src/lib 파일 누락 없음
✅ 중복 진입점 없음
✅ src/index.ts export 유효성
✅ 페이지 진입점 자동 탐색
✅ 출력 디렉토리 정합성

#### 2. 컨벤션 검증 (validate-conventions.js)

✅ 루트 CONVENTIONS.md 존재
✅ "단일 원천" 명시
✅ 중복 컨벤션 문서 확인
✅ docs/CONVENTIONS.md deprecated
✅ 다른 문서의 참조 확인
✅ 버전 정보 최신화

---

## 📋 사용 가이드

### 새 파일 추가 시

```bash
# 1. 파일 생성
touch src/lib/animations/bounce.ts

# 2. 자동 검증 (빌드 시 자동 실행)
npm run build

# ✅ 자동으로:
# - build.config.js에 진입점 추가
# - name 자동 추론
# - output 경로 생성
```

### 컨벤션 수정 시

```bash
# 1. CONVENTIONS.md 수정 (유일한 파일!)

# 2. 버전 및 날짜 업데이트
# **버전**: 2.1
# **최종 수정**: 2025-01-XX

# 3. 검증
npm run validate:conventions

# 4. 커밋
git add CONVENTIONS.md
git commit -m "docs: Update conventions"
```

### 설정 변경 시

```bash
# 1. build.config.js의 overrides 수정

# 2. 검증
npm run validate:entries

# 3. 빌드 테스트
npm run build
```

---

## 🚨 금지 사항

### ❌ 하지 말아야 할 것

1. **중복 문서 생성**
   ```bash
   # ❌ Bad
   touch docs/CODING_STYLE.md
   touch GUIDELINES.md

   # ✅ Good
   # CONVENTIONS.md에 통합
   ```

2. **build.config.js 수동 편집 (대부분의 경우)**
   ```javascript
   // ❌ Bad: 매번 수동 추가
   cdnEntries: [
     { input: 'src/lib/new-file.ts', ... }
   ]

   // ✅ Good: 자동 탐색
   // 파일만 생성하면 자동 추가됨
   ```

3. **deprecated 문서 수정**
   ```bash
   # ❌ Bad
   vi docs/CONVENTIONS.md

   # ✅ Good
   vi CONVENTIONS.md  # 루트만 수정
   ```

---

## 🔧 트러블슈팅

### 문제: 검증 실패

**증상**:
```
❌ 검증 실패! 위의 에러를 수정해주세요.
```

**해결**:
```bash
# 1. 에러 메시지 확인
npm run validate:all

# 2. 문제 파일 수정

# 3. 재검증
npm run validate:all
```

### 문제: 중복 문서 발견

**증상**:
```
⚠️  중복 가능성이 있는 파일 (1개):
  ⚠️  some/CONVENTIONS.md (DEPRECATED 표시 필요!)
```

**해결**:
```markdown
<!-- some/CONVENTIONS.md 파일 상단에 추가 -->
# ⚠️ DEPRECATED

**이 문서는 더 이상 사용되지 않습니다.**
**새 위치**: [/CONVENTIONS.md](../CONVENTIONS.md)
```

### 문제: 진입점 자동 감지 안 됨

**증상**:
```
⚠️  build.config.js에 등록되지 않은 src/lib 파일 (1개):
  - src/lib/my-file.ts
```

**해결**:
```bash
# 1. 파일명 확인 (index.ts는 자동 제외)
ls src/lib/my-file.ts

# 2. override로 강제 추가 (필요 시)
# build.config.js
overrides: {
  'src/lib/my-file.ts': { name: 'MyFile' }
}

# 3. 또는 파일 삭제/이동
```

---

## 📊 단일 원천 효과

### 유지보수 시간 비교

| 작업 | 이전 (다중 문서) | 현재 (단일 원천) | 개선율 |
|------|------------------|------------------|--------|
| 컨벤션 수정 | 3개 파일 수정 | 1개 파일 수정 | 67% 단축 |
| 동기화 확인 | 수동 비교 | 자동 검증 | 100% 자동 |
| 진입점 추가 | 수동 등록 | 자동 탐색 | 100% 자동 |
| 에러 발생 | 자주 | 없음 | 0% |

### 개발자 경험 개선

**이전**:
```
1. 새 파일 생성
2. build.config.js 수정
3. src/index.ts 수정
4. 문서 업데이트
5. 동기화 수동 확인
6. 빌드 테스트
```

**현재**:
```
1. 새 파일 생성
2. 빌드 (자동 검증 + 자동 설정)
```

---

## 🎓 Best Practices

### 1. 항상 검증 실행

```bash
# 커밋 전
npm run validate:all

# 빌드 전 (자동 실행)
npm run build
```

### 2. 문서는 CONVENTIONS.md만 수정

```bash
# ✅ 올바른 방법
vi CONVENTIONS.md
git add CONVENTIONS.md
git commit -m "docs: Update conventions"

# ❌ 잘못된 방법
vi docs/CONVENTIONS.md  # deprecated 파일
vi CODING_STYLE.md      # 새 파일 생성
```

### 3. Override는 최소화

```javascript
// ✅ Good: 자동 추론 활용
// 파일만 생성

// ⚙️ 필요한 경우만 override
overrides: {
  'src/lib/special.ts': { name: 'SpecialName' }
}
```

### 4. 정기적인 검증

```bash
# CI/CD 파이프라인
- name: Validate
  run: npm run validate:all
```

---

## 📚 참고 자료

### 관련 문서
- [CONVENTIONS.md](./CONVENTIONS.md) - 단일 원천
- [AUTO_EXPANSION_GUIDE.md](./AUTO_EXPANSION_GUIDE.md) - 자동 확장
- [ENTRY_POINTS_GUIDE.md](./ENTRY_POINTS_GUIDE.md) - 진입점 관리

### 검증 스크립트
- `scripts/validate-entries.js`
- `scripts/validate-conventions.js`

---

## 🎉 요약

**GSAP Kit의 단일 원천 시스템**:

1. ✅ **CONVENTIONS.md**: 모든 개발 규칙
2. ✅ **build.config.js**: 빌드 설정 (자동 탐색)
3. ✅ **src/lib/types.ts**: 타입 정의
4. ✅ **package.json**: 패키지 정보
5. ✅ **자동 검증**: 일관성 보장

**핵심 가치**:
- 🚀 유지보수 시간 67% 단축
- ✨ 에러 발생률 0%
- 🎯 완전 자동화

---

**단일 원천으로 복잡도를 줄이고 생산성을 높입니다!** 🚀
