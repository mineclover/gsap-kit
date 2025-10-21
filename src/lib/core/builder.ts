/**
 * GSAP Kit - Interaction Builder
 * 조건 검증 후 인터렉션 자동 생성
 */

import { debug } from '../types';
import { DOMValidator, type ValidationResult, type ValidationRule } from './validator';

/**
 * 빌더 옵션
 */
export interface BuilderOptions {
  /** 검증 규칙 */
  validation?: ValidationRule | ValidationRule[];

  /** 검증 실패 시 에러 던지기 (기본: false, 경고만 출력) */
  throwOnValidationError?: boolean;

  /** 자동 초기화 (기본: true) */
  autoInit?: boolean;

  /** 초기화 전 콜백 */
  beforeInit?: (elements: HTMLElement[]) => void;

  /** 초기화 후 콜백 */
  afterInit?: (instance: any) => void;

  /** 검증 실패 콜백 */
  onValidationError?: (result: ValidationResult) => void;
}

/**
 * 인터렉션 빌더 베이스 클래스
 *
 * @example
 * ```typescript
 * const builder = new InteractionBuilder({
 *   validation: {
 *     selector: '.matching-item',
 *     minElements: 4,
 *     exactElements: 8
 *   },
 *   autoInit: true,
 *   beforeInit: (elements) => console.log('초기화 전:', elements.length)
 * });
 *
 * if (builder.isValid()) {
 *   const instance = builder.build(createLineMatching, options);
 * }
 * ```
 */
export class InteractionBuilder {
  private options: BuilderOptions;
  private validationResult: ValidationResult | null = null;

  constructor(options: BuilderOptions = {}) {
    this.options = {
      throwOnValidationError: false,
      autoInit: true,
      ...options,
    };
  }

  /**
   * 검증 실행
   */
  validate(): ValidationResult {
    if (!this.options.validation) {
      // 검증 규칙이 없으면 항상 통과
      this.validationResult = {
        valid: true,
        message: '검증 규칙이 없습니다. (통과)',
      };
      return this.validationResult;
    }

    debug('[Builder] 검증 시작');

    // 단일 규칙 또는 여러 규칙 처리
    const rules = Array.isArray(this.options.validation) ? this.options.validation : [this.options.validation];

    this.validationResult = DOMValidator.validateAll(rules);

    if (!this.validationResult.valid) {
      const errorMsg = `[GSAP Kit] 검증 실패: ${this.validationResult.message}`;

      // 콜백 호출
      if (this.options.onValidationError) {
        this.options.onValidationError(this.validationResult);
      }

      // 에러 처리
      if (this.options.throwOnValidationError) {
        throw new Error(errorMsg);
      } else {
        console.error(errorMsg);
      }
    } else {
      debug('[Builder] 검증 성공:', this.validationResult.message);
    }

    return this.validationResult;
  }

  /**
   * 검증 통과 여부
   */
  isValid(): boolean {
    if (!this.validationResult) {
      this.validate();
    }
    return this.validationResult?.valid ?? false;
  }

  /**
   * 검증된 요소들 가져오기
   */
  getElements(): HTMLElement[] {
    if (!this.validationResult) {
      this.validate();
    }
    return this.validationResult?.elements ?? [];
  }

  /**
   * 인터렉션 빌드 (검증 후 생성)
   *
   * @param createFn 인터렉션 생성 함수 (예: createLineMatching)
   * @param options 인터렉션 옵션
   * @returns 생성된 인터렉션 인스턴스 또는 null
   */
  build<T>(createFn: (options: any) => T, options: any): T | null {
    debug('[Builder] 빌드 시작');

    // 검증 실행
    if (!this.isValid()) {
      console.error('[GSAP Kit] 검증 실패로 인터렉션을 생성할 수 없습니다.');
      return null;
    }

    const elements = this.getElements();

    // beforeInit 콜백
    if (this.options.beforeInit) {
      this.options.beforeInit(elements);
    }

    // 인터렉션 생성
    debug('[Builder] 인터렉션 생성 중...');
    const instance = createFn(options);

    // afterInit 콜백
    if (this.options.afterInit) {
      this.options.afterInit(instance);
    }

    debug('[Builder] 빌드 완료');
    return instance;
  }

  /**
   * 조건부 빌드 (검증 통과 시에만 실행)
   *
   * @param createFn 인터렉션 생성 함수
   * @param optionsFn 옵션 생성 함수 (검증된 요소를 받아서 옵션 반환)
   * @returns 생성된 인터렉션 인스턴스 또는 null
   */
  buildIf<T>(createFn: (options: any) => T, optionsFn: (elements: HTMLElement[]) => any): T | null {
    if (!this.isValid()) {
      return null;
    }

    const elements = this.getElements();
    const options = optionsFn(elements);
    return this.build(createFn, options);
  }
}

/**
 * 빠른 검증 후 빌드 헬퍼 함수
 *
 * @example
 * ```typescript
 * const matching = buildWithValidation(
 *   createLineMatching,
 *   {
 *     validation: { selector: '.item', minElements: 4 },
 *   },
 *   {
 *     items: { ... },
 *     pairs: { ... }
 *   }
 * );
 * ```
 */
export function buildWithValidation<T>(
  createFn: (options: any) => T,
  builderOptions: BuilderOptions,
  interactionOptions: any
): T | null {
  const builder = new InteractionBuilder(builderOptions);
  return builder.build(createFn, interactionOptions);
}

/**
 * 자동 감지 및 빌드 (데이터 속성 기반)
 *
 * @example
 * ```html
 * <div data-interaction="line-matching"
 *      data-selector=".item"
 *      data-min-elements="4"></div>
 * ```
 *
 * ```typescript
 * autoDetectAndBuild('[data-interaction="line-matching"]', createLineMatching);
 * ```
 */
export function autoDetectAndBuild<T>(
  containerSelector: string,
  createFn: (options: any) => T,
  optionsExtractor: (container: HTMLElement) => any
): T | null {
  const container = document.querySelector(containerSelector) as HTMLElement;

  if (!container) {
    console.warn(`[GSAP Kit] 컨테이너를 찾을 수 없습니다: ${containerSelector}`);
    return null;
  }

  debug('[Builder] 자동 감지 시작:', containerSelector);

  // 데이터 속성에서 검증 규칙 추출
  const validationRule: ValidationRule = {
    selector: container.dataset.selector || '.interaction-item',
  };

  if (container.dataset.minElements) {
    validationRule.minElements = Number.parseInt(container.dataset.minElements, 10);
  }

  if (container.dataset.maxElements) {
    validationRule.maxElements = Number.parseInt(container.dataset.maxElements, 10);
  }

  if (container.dataset.exactElements) {
    validationRule.exactElements = Number.parseInt(container.dataset.exactElements, 10);
  }

  // 빌더 생성 및 실행
  const builder = new InteractionBuilder({
    validation: validationRule,
    throwOnValidationError: false,
  });

  // 옵션 추출 및 빌드
  const options = optionsExtractor(container);
  return builder.build(createFn, options);
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).InteractionBuilder = InteractionBuilder;
  (window as any).buildWithValidation = buildWithValidation;
  (window as any).autoDetectAndBuild = autoDetectAndBuild;
}
