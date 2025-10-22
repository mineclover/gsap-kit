/**
 * GSAP Kit - JSON Test Specification Loader
 * JSON 기반 테스트 스펙을 로드하고 실행하는 엔진
 */

import type { GSAPAssertionOptions } from './gsap-assertions';
import { validateGSAPAssertion } from './gsap-assertions';
import type { MouseSimulatorOptions } from './mouse-simulator';
import type { VisualizerOptions } from './path-visualizer';
import type { TestCase, TestCaseType } from './test-runner';

/**
 * JSON 테스트 스펙 - 단일 테스트
 */
export interface TestSpec {
  /** 테스트 이름 */
  name: string;

  /** 테스트 설명 */
  description?: string;

  /** 테스트 타입 */
  type: TestCaseType;

  /** 시뮬레이션 설정 */
  simulation: {
    /** 시작 셀렉터 또는 좌표 (drag/click) */
    from?: string | { x: number; y: number };

    /** 끝 셀렉터 또는 좌표 (drag) */
    to?: string | { x: number; y: number };

    /** 타겟 셀렉터 (hover) */
    target?: string;

    /** 시작 위치 */
    fromPosition?:
      | 'center'
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right';

    /** 끝 위치 */
    toPosition?:
      | 'center'
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right';

    /** 타겟 위치 (hover) */
    targetPosition?:
      | 'center'
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right';

    /** 이동 시간 (ms) */
    duration?: number;

    /** 진입 시간 (hover, ms) */
    enterDuration?: number;

    /** 호버 지속 시간 (hover, ms) */
    hoverDuration?: number;

    /** 탈출 시간 (hover, ms) */
    exitDuration?: number;

    /** 경로 곡률 */
    curvature?: number;

    /** 이벤트 디스패치 여부 */
    dispatchEvents?: boolean;
  };

  /** 검증 지연 시간 (ms) */
  delay?: number;

  /** 시각화 설정 */
  visualization?: {
    /** 경로 색상 */
    pathColor?: string;

    /** 커서 표시 */
    showCursor?: boolean;

    /** 자동 제거 */
    autoRemove?: boolean;

    /** 제거 지연 (ms) */
    removeDelay?: number;
  };

  /** 검증 설정 */
  assert?: {
    /** 검증 타입 */
    type:
      | 'selector-exists'
      | 'selector-not-exists'
      | 'has-class'
      | 'not-has-class'
      | 'text-equals'
      | 'text-contains'
      | 'count-equals'
      | 'count-greater-than'
      | 'custom'
      // GSAP assertions
      | 'gsap-is-animating'
      | 'gsap-is-paused'
      | 'gsap-progress'
      | 'gsap-duration'
      | 'gsap-property-value'
      | 'gsap-transform'
      | 'gsap-timeline-state';

    /** 검증 대상 셀렉터 */
    selector?: string;

    /** 기대값 */
    expected?: any;

    /** 커스텀 검증 함수 (문자열로 저장, eval로 실행) */
    customFunction?: string;

    // GSAP assertion options
    /** CSS 속성 이름 (gsap-property-value용) */
    property?: string;

    /** 허용 오차 (숫자 비교용) */
    tolerance?: number;

    /** 최소 진행도 (gsap-progress용) */
    minProgress?: number;

    /** 최대 진행도 (gsap-progress용) */
    maxProgress?: number;

    /** Transform 속성 (gsap-transform용) */
    transformProperty?: 'x' | 'y' | 'rotation' | 'scale' | 'scaleX' | 'scaleY';

    /** 애니메이션 완료 대기 */
    waitForAnimation?: boolean;

    /** 대기 타임아웃 (ms) */
    timeout?: number;
  };

  /** Setup 설정 */
  setup?: {
    /** 리셋할 함수 이름 */
    resetFunction?: string;

    /** 대기 시간 (ms) */
    waitTime?: number;

    /** 실행할 함수 이름 */
    executeFunction?: string;
  };

  /** Teardown 설정 */
  teardown?: {
    /** 실행할 함수 이름 */
    executeFunction?: string;
  };

  /** 타임아웃 (ms) */
  timeout?: number;
}

/**
 * JSON 테스트 스위트 스펙
 */
export interface TestSuiteSpec {
  /** 스위트 이름 */
  name: string;

  /** 설명 */
  description?: string;

  /** 테스트 케이스 목록 */
  tests: TestSpec[];

  /** BeforeAll 설정 */
  beforeAll?: {
    executeFunction?: string;
    waitTime?: number;
  };

  /** AfterAll 설정 */
  afterAll?: {
    executeFunction?: string;
  };

  /** BeforeEach 설정 */
  beforeEach?: {
    executeFunction?: string;
    waitTime?: number;
  };

  /** AfterEach 설정 */
  afterEach?: {
    executeFunction?: string;
  };
}

/**
 * JSON 테스트 파일 전체 스펙
 */
export interface TestFileSpec {
  /** 파일 버전 */
  version: string;

  /** 메타데이터 */
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    tags?: string[];
  };

  /** 전역 설정 */
  config?: {
    /** 기본 duration */
    defaultDuration?: number;

    /** 기본 curvature */
    defaultCurvature?: number;

    /** 시각화 활성화 */
    visualizationEnabled?: boolean;

    /** 슬로우 모션 */
    slowMotion?: boolean;
  };

  /** 테스트 스위트 목록 */
  suites: TestSuiteSpec[];
}

/**
 * Assertion 검증기
 */
export class AssertionValidator {
  /**
   * Assertion 실행
   */
  static async validate(assert: TestSpec['assert'], delay?: number): Promise<boolean> {
    if (!assert) return true;

    // 지연 시간이 있으면 대기
    if (delay && delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    switch (assert.type) {
      case 'selector-exists': {
        const element = document.querySelector(assert.selector!);
        return element !== null;
      }

      case 'selector-not-exists': {
        const element = document.querySelector(assert.selector!);
        return element === null;
      }

      case 'has-class': {
        const element = document.querySelector(assert.selector!);
        return element?.classList.contains(assert.expected) ?? false;
      }

      case 'not-has-class': {
        const element = document.querySelector(assert.selector!);
        if (!element) return true; // Element doesn't exist, so class doesn't exist either
        return !element.classList.contains(assert.expected);
      }

      case 'text-equals': {
        const element = document.querySelector(assert.selector!);
        return element?.textContent?.trim() === assert.expected;
      }

      case 'text-contains': {
        const element = document.querySelector(assert.selector!);
        return element?.textContent?.includes(assert.expected) ?? false;
      }

      case 'count-equals': {
        const elements = document.querySelectorAll(assert.selector!);
        return elements.length === assert.expected;
      }

      case 'count-greater-than': {
        const elements = document.querySelectorAll(assert.selector!);
        return elements.length > assert.expected;
      }

      case 'custom': {
        if (!assert.customFunction) return true;
        // eval을 사용하여 커스텀 함수 실행
        try {
          const func = new Function('return ' + assert.customFunction)();
          const result = await func();
          return result;
        } catch (error) {
          console.error('[AssertionValidator] Custom function error:', error);
          return false;
        }
      }

      // GSAP Assertions
      case 'gsap-is-animating':
      case 'gsap-is-paused':
      case 'gsap-progress':
      case 'gsap-duration':
      case 'gsap-property-value':
      case 'gsap-transform':
      case 'gsap-timeline-state': {
        if (!assert.selector) return false;

        const gsapOptions: GSAPAssertionOptions = {
          type: assert.type,
          selector: assert.selector,
          property: assert.property,
          expected: assert.expected,
          tolerance: assert.tolerance,
          minProgress: assert.minProgress,
          maxProgress: assert.maxProgress,
          transformProperty: assert.transformProperty,
          waitForAnimation: assert.waitForAnimation,
          timeout: assert.timeout,
        };

        return validateGSAPAssertion(gsapOptions);
      }

      default:
        return true;
    }
  }
}

/**
 * JSON 테스트 스펙 로더
 */
export class TestSpecLoader {
  /**
   * JSON 파일 로드
   */
  static async loadFromFile(filePath: string): Promise<TestFileSpec> {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load test spec: ${filePath}`);
    }
    return response.json();
  }

  /**
   * JSON 객체에서 로드
   */
  static loadFromObject(spec: TestFileSpec): TestFileSpec {
    return spec;
  }

  /**
   * TestSpec을 TestCase로 변환
   */
  static convertToTestCase(spec: TestSpec, config?: TestFileSpec['config']): TestCase {
    // Ensure simulation object exists
    if (!spec.simulation) {
      console.error('[TestSpecLoader] Missing simulation object for test:', spec.name);
      throw new Error(`Test "${spec.name}" is missing required simulation object`);
    }

    // For click type, if 'to' is not specified, set it to 'from'
    const simulationTo = spec.simulation.to ?? (spec.type === 'click' ? spec.simulation.from : undefined);

    const testCase: TestCase = {
      name: spec.name,
      description: spec.description,
      type: spec.type,
      simulation: {
        // Drag/Click properties
        from: spec.simulation.from,
        to: simulationTo,
        fromPosition: spec.simulation.fromPosition,
        toPosition: spec.simulation.toPosition,

        // Hover properties
        target: spec.simulation.target,
        targetPosition: spec.simulation.targetPosition,
        enterDuration: spec.simulation.enterDuration,
        hoverDuration: spec.simulation.hoverDuration,
        exitDuration: spec.simulation.exitDuration,

        // Common properties
        duration: spec.simulation.duration ?? config?.defaultDuration ?? 1000,
        curvature: spec.simulation.curvature ?? config?.defaultCurvature ?? 0.3,
        dispatchEvents: spec.simulation.dispatchEvents ?? true,
      },
      timeout: spec.timeout,
    };

    // 시각화 설정
    if (spec.visualization && config?.visualizationEnabled !== false) {
      testCase.visualization = {
        pathColor: spec.visualization.pathColor ?? '#667eea',
        showCursor: spec.visualization.showCursor ?? true,
        autoRemove: spec.visualization.autoRemove ?? true,
        removeDelay: spec.visualization.removeDelay ?? 1000,
      };
    }

    // Assertion 설정
    if (spec.assert) {
      testCase.assert = async () => {
        return AssertionValidator.validate(spec.assert, spec.delay);
      };
    }

    // Setup 설정
    if (spec.setup) {
      testCase.setup = async () => {
        if (spec.setup!.resetFunction) {
          const resetFn = TestSpecLoader.resolveFunction(spec.setup!.resetFunction);
          if (typeof resetFn === 'function') {
            await resetFn();
          }
        }

        if (spec.setup!.waitTime) {
          await new Promise(resolve => setTimeout(resolve, spec.setup!.waitTime));
        }

        if (spec.setup!.executeFunction) {
          const executeFn = TestSpecLoader.resolveFunction(spec.setup!.executeFunction);
          if (typeof executeFn === 'function') {
            await executeFn();
          }
        }
      };
    }

    // Teardown 설정
    if (spec.teardown) {
      testCase.teardown = async () => {
        if (spec.teardown!.executeFunction) {
          const executeFn = TestSpecLoader.resolveFunction(spec.teardown!.executeFunction);
          if (typeof executeFn === 'function') {
            await executeFn();
          }
        }
      };
    }

    return testCase;
  }

  /**
   * Resolve function from nested path (e.g., "gsapTest.resetAllAnimations")
   */
  private static resolveFunction(path: string): Function | null {
    const parts = path.split('.');
    let obj: any = window;

    for (const part of parts) {
      if (obj && typeof obj === 'object') {
        obj = obj[part];
      } else {
        return null;
      }
    }

    return typeof obj === 'function' ? obj : null;
  }

  /**
   * Hook 함수 변환
   */
  private static convertHook(hook?: {
    executeFunction?: string;
    waitTime?: number;
  }): (() => void | Promise<void>) | undefined {
    if (!hook) return undefined;

    return async () => {
      if (hook.executeFunction) {
        const fn = TestSpecLoader.resolveFunction(hook.executeFunction);
        if (typeof fn === 'function') {
          await fn();
        }
      }

      if (hook.waitTime) {
        await new Promise(resolve => setTimeout(resolve, hook.waitTime));
      }
    };
  }

  /**
   * TestSuiteSpec을 TestSuite로 변환
   */
  static convertToTestSuite(suiteSpec: TestSuiteSpec, config?: TestFileSpec['config']) {
    return {
      name: suiteSpec.name,
      description: suiteSpec.description,
      tests: suiteSpec.tests.map(testSpec => TestSpecLoader.convertToTestCase(testSpec, config)),
      beforeAll: TestSpecLoader.convertHook(suiteSpec.beforeAll),
      afterAll: TestSpecLoader.convertHook(suiteSpec.afterAll),
      beforeEach: TestSpecLoader.convertHook(suiteSpec.beforeEach),
      afterEach: TestSpecLoader.convertHook(suiteSpec.afterEach),
    };
  }
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).TestSpecLoader = TestSpecLoader;
  (window as any).AssertionValidator = AssertionValidator;
}
