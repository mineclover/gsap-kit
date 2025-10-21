# Interaction Builder 사용 예제

Interaction Builder를 사용하면 DOM 조건을 검증하고 조건을 만족할 때만 인터렉션을 자동으로 생성할 수 있습니다.

---

## 🎯 기본 사용법

### 1. 수동 검증 후 생성

```typescript
import { createLineMatching } from './lib/advanced/line-matching';
import { InteractionBuilder } from './lib/core/builder';

// 빌더 생성
const builder = new InteractionBuilder({
  validation: {
    selector: '.matching-item',
    minElements: 4,        // 최소 4개 필요
    exactElements: 8,      // 정확히 8개 필요
  },
  beforeInit: (elements) => {
    console.log(`${elements.length}개 요소 발견`);
  },
  onValidationError: (result) => {
    alert(`조건 불만족: ${result.message}`);
  }
});

// 검증 및 생성
const matching = builder.build(createLineMatching, {
  items: {
    'a1': { selector: '#item-1', point: { x: 'right', y: 'center' } },
    'a2': { selector: '#item-2', point: { x: 'right', y: 'center' } },
    // ...
  },
  pairs: {
    'a1': 'b1',
    'a2': 'b2',
  }
});

if (!matching) {
  console.error('검증 실패로 인터렉션을 생성할 수 없습니다.');
}
```

### 2. 빠른 검증 후 생성

```typescript
import { buildWithValidation } from './lib/core/builder';
import { createLineMatching } from './lib/advanced/line-matching';

const matching = buildWithValidation(
  createLineMatching,
  {
    validation: {
      selector: '.item',
      minElements: 4,
      requiredParent: '.game-container',  // 반드시 .game-container 안에 있어야 함
    }
  },
  {
    items: { /* ... */ },
    pairs: { /* ... */ }
  }
);
```

---

## 🔍 고급 검증 규칙

### 1. 여러 조건 동시 검증

```typescript
const builder = new InteractionBuilder({
  validation: [
    // 그룹 A: 왼쪽 아이템들
    {
      selector: '.group-a .item',
      exactElements: 4,
      requiredParent: '.group-a'
    },
    // 그룹 B: 오른쪽 아이템들
    {
      selector: '.group-b .item',
      exactElements: 4,
      requiredParent: '.group-b'
    }
  ]
});
```

### 2. 필수 속성 검증

```typescript
const builder = new InteractionBuilder({
  validation: {
    selector: '[data-match-id]',
    minElements: 2,
    requiredAttributes: ['data-match-id', 'data-group']  // 필수 속성
  }
});
```

### 3. CSS 스타일 체크

```typescript
const builder = new InteractionBuilder({
  validation: {
    selector: '.item',
    minElements: 4,
    forbiddenStyles: {
      'overflow': 'hidden'  // overflow: hidden이면 경고
    }
  }
});
```

### 4. 커스텀 검증 로직

```typescript
const builder = new InteractionBuilder({
  validation: {
    selector: '.item',
    customValidator: (elements) => {
      // 짝수 개수인지 확인
      if (elements.length % 2 !== 0) {
        return '아이템은 짝수 개여야 합니다.';
      }

      // 모든 아이템이 data-pair 속성을 가지는지 확인
      const allHavePair = elements.every(el => el.hasAttribute('data-pair'));
      if (!allHavePair) {
        return '모든 아이템에 data-pair 속성이 필요합니다.';
      }

      return true; // 통과
    }
  }
});
```

---

## 🚀 자동 감지 및 초기화

### HTML에 데이터 속성 사용

```html
<div id="game-area"
     data-interaction="line-matching"
     data-selector=".item"
     data-min-elements="4"
     data-exact-elements="8">

  <div class="item" id="a1">사과</div>
  <div class="item" id="a2">바나나</div>
  <!-- ... -->
</div>
```

### JavaScript에서 자동 감지

```typescript
import { autoDetectAndBuild } from './lib/core/builder';
import { createLineMatching } from './lib/advanced/line-matching';

// 자동 감지 및 생성
const matching = autoDetectAndBuild(
  '[data-interaction="line-matching"]',
  createLineMatching,
  (container) => {
    // 컨테이너에서 옵션 추출
    return {
      container: container,
      items: extractItemsFromDOM(container),
      pairs: extractPairsFromData(container),
      lineStyle: container.dataset.lineStyle || 'solid',
      // ...
    };
  }
);

function extractItemsFromDOM(container: HTMLElement) {
  const items: any = {};
  const elements = container.querySelectorAll('.item');

  elements.forEach((el, index) => {
    items[`item-${index}`] = {
      selector: `#${el.id}`,
      point: { x: 'center', y: 'center' }
    };
  });

  return items;
}

function extractPairsFromData(container: HTMLElement) {
  // data-pairs 속성에서 JSON 파싱
  const pairsData = container.dataset.pairs;
  return pairsData ? JSON.parse(pairsData) : {};
}
```

---

## 💡 실전 예제

### 예제 1: 조건부 게임 초기화

```typescript
import { InteractionBuilder } from './lib/core/builder';
import { createLineMatching } from './lib/advanced/line-matching';

function initMatchingGame() {
  const builder = new InteractionBuilder({
    validation: {
      selector: '.quiz-item',
      minElements: 6,
      maxElements: 12,
      requiredParent: '.quiz-container'
    },
    throwOnValidationError: false,
    onValidationError: (result) => {
      // 사용자에게 친절한 메시지 표시
      showError(`게임을 시작할 수 없습니다: ${result.message}`);
      showHelp('최소 6개의 퀴즈 아이템이 필요합니다.');
    }
  });

  // 검증 통과 시에만 게임 생성
  if (builder.isValid()) {
    const elements = builder.getElements();
    console.log(`게임 시작: ${elements.length}개 아이템`);

    return builder.build(createLineMatching, {
      items: generateItemsFromElements(elements),
      pairs: generatePairsFromData(elements),
      onComplete: () => {
        showCongratulations();
      }
    });
  }

  return null;
}
```

### 예제 2: 동적 콘텐츠 대응

```typescript
import { DOMValidator } from './lib/core/validator';
import { createLineMatching } from './lib/advanced/line-matching';

let matchingInstance: any = null;

// 콘텐츠 로드 후 초기화
async function loadAndInitGame() {
  // 1. 콘텐츠 로드
  await loadQuizContent();

  // 2. DOM 검증
  const result = DOMValidator.validate({
    selector: '.quiz-item',
    minElements: 4
  });

  if (!result.valid) {
    console.error('콘텐츠 로드 실패:', result.message);
    return;
  }

  // 3. 게임 생성
  matchingInstance = createLineMatching({
    items: autoGenerateItems(result.elements!),
    pairs: autoGeneratePairs(result.elements!),
  });
}

function autoGenerateItems(elements: HTMLElement[]) {
  const items: any = {};
  elements.forEach((el, i) => {
    const group = el.dataset.group; // 'a' or 'b'
    const position = group === 'a'
      ? { x: 'right', y: 'center' }
      : { x: 'left', y: 'center' };

    items[`${group}${i}`] = {
      selector: `#${el.id}`,
      point: position
    };
  });
  return items;
}
```

### 예제 3: 여러 인터렉션 관리

```typescript
import { InteractionBuilder } from './lib/core/builder';

class GameManager {
  private builders: Map<string, InteractionBuilder> = new Map();
  private instances: Map<string, any> = new Map();

  registerInteraction(name: string, validation: any) {
    this.builders.set(name, new InteractionBuilder({ validation }));
  }

  initInteraction(name: string, createFn: Function, options: any) {
    const builder = this.builders.get(name);
    if (!builder) {
      console.error(`인터렉션 "${name}"이 등록되지 않았습니다.`);
      return null;
    }

    if (!builder.isValid()) {
      console.warn(`인터렉션 "${name}" 조건 불만족`);
      return null;
    }

    const instance = builder.build(createFn, options);
    this.instances.set(name, instance);
    return instance;
  }

  resetAll() {
    this.instances.forEach(instance => {
      if (instance && instance.reset) {
        instance.reset();
      }
    });
  }

  destroyAll() {
    this.instances.forEach(instance => {
      if (instance && instance.destroy) {
        instance.destroy();
      }
    });
    this.instances.clear();
  }
}

// 사용
const manager = new GameManager();

manager.registerInteraction('matching', {
  selector: '.item',
  minElements: 4
});

manager.registerInteraction('puzzle', {
  selector: '.puzzle-piece',
  minElements: 9,
  exactElements: 9
});

// 초기화
manager.initInteraction('matching', createLineMatching, { /* ... */ });
manager.initInteraction('puzzle', createPuzzle, { /* ... */ });
```

---

## 🛠️ 유틸리티 함수

### 빠른 검증 헬퍼

```typescript
import { DOMValidator } from './lib/core/validator';

// 요소가 존재하는지만 빠르게 체크
if (DOMValidator.hasElements('.item', 4)) {
  console.log('충분한 아이템이 있습니다.');
}

// 정확한 개수 체크
if (DOMValidator.hasExactElements('.item', 8)) {
  console.log('정확히 8개 아이템이 있습니다.');
}

// 짝수 개수 체크
if (DOMValidator.hasPairedElements('.item')) {
  console.log('짝수 개의 아이템이 있습니다.');
}
```

---

## 📚 다음 단계

- [QUICK_START.md](./QUICK_START.md) - 기본 사용법
- [INTERACTION_BUILDER_GUIDE.md](./INTERACTION_BUILDER_GUIDE.md) - 전체 가이드
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 프로젝트 구조

---

## 💡 팁

### 1. 개발 모드에서 검증 로그 확인

`src/lib/types.ts`에서 디버그 모드를 활성화하세요:

```typescript
const IS_DEV = true; // 개발 시 true로 설정
```

### 2. 프로덕션에서는 에러 던지지 않기

```typescript
const builder = new InteractionBuilder({
  throwOnValidationError: false, // 프로덕션에서는 false
  onValidationError: (result) => {
    // 로그 서비스에 전송
    logError('Validation failed', result);
  }
});
```

### 3. 조건부 기능 활성화

```typescript
// 특정 조건에서만 인터렉션 활성화
if (DOMValidator.hasElements('.premium-feature') && user.isPremium) {
  initPremiumInteraction();
}
```
