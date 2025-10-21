/**
 * GSAP Kit - Test Runner
 * 인터렉션 테스트 실행 및 결과 수집
 */

import { debug } from '../types';
import { MouseSimulator, type MouseSimulatorOptions, type Point } from './mouse-simulator';
import { PathVisualizer, type VisualizerOptions } from './path-visualizer';

/**
 * 테스트 케이스 타입
 */
export type TestCaseType = 'drag' | 'click' | 'hover' | 'custom';

/**
 * 테스트 케이스 정의
 */
export interface TestCase {
  /** 테스트 이름 */
  name: string;

  /** 테스트 설명 */
  description?: string;

  /** 테스트 타입 */
  type: TestCaseType;

  /** 마우스 시뮬레이션 옵션 */
  simulation: MouseSimulatorOptions;

  /** 시각화 옵션 */
  visualization?: VisualizerOptions;

  /** 검증 함수 */
  assert?: () => boolean | Promise<boolean>;

  /** 테스트 전 설정 */
  setup?: () => void | Promise<void>;

  /** 테스트 후 정리 */
  teardown?: () => void | Promise<void>;

  /** 타임아웃 (ms) */
  timeout?: number;
}

/**
 * 테스트 결과
 */
export interface TestResult {
  /** 테스트 이름 */
  name: string;

  /** 성공 여부 */
  passed: boolean;

  /** 실행 시간 (ms) */
  duration: number;

  /** 에러 메시지 */
  error?: string;

  /** 경로 데이터 */
  path?: Point[];

  /** 스크린샷 (선택) */
  screenshot?: string;
}

/**
 * 테스트 스위트
 */
export interface TestSuite {
  /** 스위트 이름 */
  name: string;

  /** 설명 */
  description?: string;

  /** 테스트 케이스 목록 */
  tests: TestCase[];

  /** 스위트 전 설정 */
  beforeAll?: () => void | Promise<void>;

  /** 스위트 후 정리 */
  afterAll?: () => void | Promise<void>;

  /** 각 테스트 전 */
  beforeEach?: () => void | Promise<void>;

  /** 각 테스트 후 */
  afterEach?: () => void | Promise<void>;
}

/**
 * 테스트 러너 클래스
 */
export class TestRunner {
  private suites: TestSuite[] = [];
  private results: Map<string, TestResult[]> = new Map();
  private currentVisualizer: PathVisualizer | null = null;

  /**
   * 테스트 스위트 등록
   */
  registerSuite(suite: TestSuite): void {
    this.suites.push(suite);
    debug(`[TestRunner] Registered suite: ${suite.name}`);
  }

  /**
   * 단일 테스트 실행
   */
  private async runTest(test: TestCase, suiteContext?: TestSuite): Promise<TestResult> {
    const startTime = Date.now();

    debug(`[TestRunner] Running test: ${test.name}`);

    try {
      // Setup
      if (test.setup) {
        await test.setup();
      }
      if (suiteContext?.beforeEach) {
        await suiteContext.beforeEach();
      }

      // 시각화 준비
      if (test.visualization) {
        this.currentVisualizer = new PathVisualizer(test.visualization);
      }

      // 마우스 시뮬레이션
      const simulator = new MouseSimulator({
        ...test.simulation,
        onMove: (point, progress) => {
          // 시각화가 있으면 경로 업데이트
          if (test.simulation.onMove) {
            test.simulation.onMove(point, progress);
          }
        },
      });

      await simulator.simulate();

      const path = simulator.getPath();

      // 경로 시각화
      if (this.currentVisualizer && path.length > 0) {
        this.currentVisualizer.visualize(path);
        await this.currentVisualizer.animatePath(path);
      }

      // 검증
      let passed = true;
      if (test.assert) {
        passed = await test.assert();
      }

      // Teardown
      if (test.teardown) {
        await test.teardown();
      }
      if (suiteContext?.afterEach) {
        await suiteContext.afterEach();
      }

      const duration = Date.now() - startTime;

      const result: TestResult = {
        name: test.name,
        passed,
        duration,
        path,
      };

      debug(`[TestRunner] Test ${passed ? 'PASSED' : 'FAILED'}: ${test.name} (${duration}ms)`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      const result: TestResult = {
        name: test.name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      };

      debug(`[TestRunner] Test ERROR: ${test.name}`, error);

      return result;
    } finally {
      // 시각화 정리
      if (this.currentVisualizer && !test.visualization?.autoRemove) {
        setTimeout(() => {
          this.currentVisualizer?.clear();
          this.currentVisualizer = null;
        }, test.visualization?.removeDelay || 1000);
      }
    }
  }

  /**
   * 테스트 스위트 실행
   */
  private async runSuite(suite: TestSuite): Promise<TestResult[]> {
    debug(`[TestRunner] Running suite: ${suite.name}`);

    const results: TestResult[] = [];

    try {
      // BeforeAll
      if (suite.beforeAll) {
        await suite.beforeAll();
      }

      // 각 테스트 실행
      for (const test of suite.tests) {
        const result = await this.runTest(test, suite);
        results.push(result);
      }

      // AfterAll
      if (suite.afterAll) {
        await suite.afterAll();
      }
    } catch (error) {
      debug(`[TestRunner] Suite error: ${suite.name}`, error);
    }

    this.results.set(suite.name, results);
    return results;
  }

  /**
   * 모든 테스트 실행
   */
  async runAll(): Promise<Map<string, TestResult[]>> {
    debug('[TestRunner] Running all test suites');

    this.results.clear();

    for (const suite of this.suites) {
      await this.runSuite(suite);
    }

    debug('[TestRunner] All tests completed');

    return this.results;
  }

  /**
   * 특정 스위트만 실행
   */
  async runSuiteByName(name: string): Promise<TestResult[] | null> {
    const suite = this.suites.find(s => s.name === name);

    if (!suite) {
      debug(`[TestRunner] Suite not found: ${name}`);
      return null;
    }

    return this.runSuite(suite);
  }

  /**
   * 결과 가져오기
   */
  getResults(): Map<string, TestResult[]> {
    return this.results;
  }

  /**
   * 통계 생성
   */
  getStats(): {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  } {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let duration = 0;

    for (const results of this.results.values()) {
      for (const result of results) {
        total++;
        if (result.passed) {
          passed++;
        } else {
          failed++;
        }
        duration += result.duration;
      }
    }

    return { total, passed, failed, duration };
  }

  /**
   * 스위트 목록 가져오기
   */
  getSuites(): TestSuite[] {
    return this.suites;
  }

  /**
   * 초기화
   */
  reset(): void {
    this.suites = [];
    this.results.clear();
    debug('[TestRunner] Reset');
  }
}

/**
 * 전역 테스트 러너 인스턴스
 */
export const testRunner = new TestRunner();

/**
 * 테스트 정의 헬퍼
 */
export function describe(name: string, tests: TestCase[], options: Partial<TestSuite> = {}): void {
  testRunner.registerSuite({
    name,
    tests,
    ...options,
  });
}

/**
 * 드래그 테스트 헬퍼
 */
export function testDrag(
  name: string,
  from: string | Point,
  to: string | Point,
  assert?: () => boolean | Promise<boolean>,
  options: Partial<TestCase> = {}
): TestCase {
  return {
    name,
    type: 'drag',
    simulation: {
      from,
      to,
      duration: 1000,
      dispatchEvents: true,
    },
    assert,
    ...options,
  };
}

/**
 * 클릭 테스트 헬퍼
 */
export function testClick(
  name: string,
  target: string | Point,
  assert?: () => boolean | Promise<boolean>,
  options: Partial<TestCase> = {}
): TestCase {
  return {
    name,
    type: 'click',
    simulation: {
      from: target,
      to: target,
      duration: 100,
      dispatchEvents: true,
    },
    assert,
    ...options,
  };
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).TestRunner = TestRunner;
  (window as any).testRunner = testRunner;
  (window as any).describe = describe;
  (window as any).testDrag = testDrag;
  (window as any).testClick = testClick;
}
