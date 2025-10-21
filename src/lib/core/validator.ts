/**
 * GSAP Kit - DOM Validator
 * DOM 조건 검증 시스템
 */

import { debug } from '../types';

/**
 * 검증 조건 인터페이스
 */
export interface ValidationRule {
  /** 선택자 */
  selector: string;

  /** 최소 요소 개수 */
  minElements?: number;

  /** 최대 요소 개수 */
  maxElements?: number;

  /** 정확한 요소 개수 */
  exactElements?: number;

  /** 필수 상위 요소 선택자 */
  requiredParent?: string;

  /** 필수 속성 */
  requiredAttributes?: string[];

  /** 금지된 CSS 속성 (예: overflow: hidden) */
  forbiddenStyles?: { [property: string]: string };

  /** 커스텀 검증 함수 */
  customValidator?: (elements: HTMLElement[]) => boolean | string;
}

/**
 * 검증 결과
 */
export interface ValidationResult {
  /** 검증 통과 여부 */
  valid: boolean;

  /** 검증 메시지 */
  message?: string;

  /** 발견된 요소들 */
  elements?: HTMLElement[];

  /** 실패한 규칙 */
  failedRule?: string;
}

/**
 * DOM 조건 검증 클래스
 */
export class DOMValidator {
  /**
   * 단일 규칙 검증
   */
  static validate(rule: ValidationRule): ValidationResult {
    debug(`[Validator] 검증 시작: ${rule.selector}`);

    // 1. 요소 찾기
    const elements = Array.from(document.querySelectorAll(rule.selector)) as HTMLElement[];

    if (elements.length === 0) {
      return {
        valid: false,
        message: `선택자 "${rule.selector}"에 해당하는 요소를 찾을 수 없습니다.`,
        failedRule: 'selector',
      };
    }

    // 2. 요소 개수 검증
    if (rule.exactElements !== undefined) {
      if (elements.length !== rule.exactElements) {
        return {
          valid: false,
          message: `${rule.exactElements}개의 요소가 필요하지만 ${elements.length}개가 발견되었습니다.`,
          failedRule: 'exactElements',
        };
      }
    } else {
      if (rule.minElements !== undefined && elements.length < rule.minElements) {
        return {
          valid: false,
          message: `최소 ${rule.minElements}개의 요소가 필요하지만 ${elements.length}개만 발견되었습니다.`,
          failedRule: 'minElements',
        };
      }

      if (rule.maxElements !== undefined && elements.length > rule.maxElements) {
        return {
          valid: false,
          message: `최대 ${rule.maxElements}개의 요소만 허용되지만 ${elements.length}개가 발견되었습니다.`,
          failedRule: 'maxElements',
        };
      }
    }

    // 3. 상위 요소 검증
    if (rule.requiredParent) {
      for (const element of elements) {
        if (!element.closest(rule.requiredParent)) {
          return {
            valid: false,
            message: `요소가 "${rule.requiredParent}" 내부에 있어야 합니다.`,
            elements,
            failedRule: 'requiredParent',
          };
        }
      }
    }

    // 4. 필수 속성 검증
    if (rule.requiredAttributes) {
      for (const element of elements) {
        for (const attr of rule.requiredAttributes) {
          if (!element.hasAttribute(attr)) {
            return {
              valid: false,
              message: `요소에 "${attr}" 속성이 필요합니다.`,
              elements,
              failedRule: 'requiredAttributes',
            };
          }
        }
      }
    }

    // 5. 금지된 스타일 검증
    if (rule.forbiddenStyles) {
      for (const element of elements) {
        const computedStyle = getComputedStyle(element);
        for (const [property, value] of Object.entries(rule.forbiddenStyles)) {
          if (computedStyle.getPropertyValue(property) === value) {
            console.warn(
              `[GSAP Kit] 경고: 요소에 ${property}: ${value}이(가) 설정되어 있어 문제가 발생할 수 있습니다.`,
              element
            );
            // 경고만 하고 통과 (치명적이지 않음)
          }
        }
      }
    }

    // 6. 커스텀 검증
    if (rule.customValidator) {
      const customResult = rule.customValidator(elements);
      if (customResult !== true) {
        return {
          valid: false,
          message: typeof customResult === 'string' ? customResult : '커스텀 검증 실패',
          elements,
          failedRule: 'customValidator',
        };
      }
    }

    // 모든 검증 통과
    debug(`[Validator] 검증 성공: ${elements.length}개 요소 발견`);
    return {
      valid: true,
      message: `${elements.length}개의 유효한 요소를 찾았습니다.`,
      elements,
    };
  }

  /**
   * 여러 규칙 검증 (모두 통과해야 함)
   */
  static validateAll(rules: ValidationRule[]): ValidationResult {
    const allElements: HTMLElement[] = [];

    for (const rule of rules) {
      const result = DOMValidator.validate(rule);
      if (!result.valid) {
        return result;
      }
      if (result.elements) {
        allElements.push(...result.elements);
      }
    }

    return {
      valid: true,
      message: `모든 검증 통과 (총 ${allElements.length}개 요소)`,
      elements: allElements,
    };
  }

  /**
   * 빠른 검증 헬퍼: 요소 개수만 체크
   */
  static hasElements(selector: string, min = 1): boolean {
    return document.querySelectorAll(selector).length >= min;
  }

  /**
   * 빠른 검증 헬퍼: 정확한 개수 체크
   */
  static hasExactElements(selector: string, count: number): boolean {
    return document.querySelectorAll(selector).length === count;
  }

  /**
   * 빠른 검증 헬퍼: 짝수 개수 체크
   */
  static hasPairedElements(selector: string): boolean {
    const count = document.querySelectorAll(selector).length;
    return count > 0 && count % 2 === 0;
  }
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).DOMValidator = DOMValidator;
}
