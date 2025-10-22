/**
 * GSAP Kit - Test Automation Interface
 * 자동화된 테스트 실행을 위한 인터페이스
 */

import type { TestResult, TestRunner } from './test-runner';

/**
 * 자동화 테스트 결과
 */
export interface AutomationResult {
  /** 테스트 완료 여부 */
  completed: boolean;

  /** 전체 테스트 수 */
  total: number;

  /** 통과한 테스트 수 */
  passed: number;

  /** 실패한 테스트 수 */
  failed: number;

  /** 전체 실행 시간 (ms) */
  duration: number;

  /** 성공률 (0-100) */
  passRate: number;

  /** 스위트별 결과 */
  suites: {
    name: string;
    total: number;
    passed: number;
    failed: number;
    duration: number;
    tests: TestResult[];
  }[];

  /** 원시 결과 맵 */
  raw: Map<string, TestResult[]>;
}

/**
 * 자동화 실행 옵션
 */
export interface AutomationOptions {
  /** 자동 시작 여부 */
  autoStart?: boolean;

  /** 시작 지연 (ms) */
  startDelay?: number;

  /** 결과를 window에 저장할 키 */
  resultKey?: string;

  /** 완료 콜백 */
  onComplete?: (result: AutomationResult) => void;

  /** 진행 콜백 */
  onProgress?: (current: number, total: number) => void;
}

/**
 * 테스트 자동화 클래스
 */
export class TestAutomation {
  private testRunner: TestRunner;
  private options: Required<AutomationOptions>;
  private result: AutomationResult | null = null;
  private isRunning = false;

  constructor(testRunner: TestRunner, options: AutomationOptions = {}) {
    this.testRunner = testRunner;
    this.options = {
      autoStart: false,
      startDelay: 0,
      resultKey: '__TEST_RESULT__',
      onComplete: () => {},
      onProgress: () => {},
      ...options,
    };
  }

  /**
   * 테스트 실행 및 결과 반환
   */
  async run(): Promise<AutomationResult> {
    if (this.isRunning) {
      throw new Error('Tests are already running');
    }

    this.isRunning = true;
    console.log('[TestAutomation] Starting automated test execution...');

    const startTime = Date.now();

    try {
      // 테스트 실행
      const rawResults = await this.testRunner.runAll();

      // 결과 변환
      this.result = this.transformResults(rawResults, Date.now() - startTime);

      // window에 결과 저장
      (window as any)[this.options.resultKey] = this.result;

      // 콜백 호출
      this.options.onComplete(this.result);

      console.log('[TestAutomation] Tests completed:', this.result);

      return this.result;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 결과 변환
   */
  private transformResults(rawResults: Map<string, TestResult[]>, totalDuration: number): AutomationResult {
    let total = 0;
    let passed = 0;
    let failed = 0;

    const suites = Array.from(rawResults.entries()).map(([name, tests]) => {
      const suitePassed = tests.filter(t => t.passed).length;
      const suiteFailed = tests.filter(t => !t.passed).length;
      const suiteDuration = tests.reduce((sum, t) => sum + t.duration, 0);

      total += tests.length;
      passed += suitePassed;
      failed += suiteFailed;

      return {
        name,
        total: tests.length,
        passed: suitePassed,
        failed: suiteFailed,
        duration: suiteDuration,
        tests,
      };
    });

    const passRate = total > 0 ? (passed / total) * 100 : 0;

    return {
      completed: true,
      total,
      passed,
      failed,
      duration: totalDuration,
      passRate,
      suites,
      raw: rawResults,
    };
  }

  /**
   * 현재 결과 가져오기
   */
  getResult(): AutomationResult | null {
    return this.result;
  }

  /**
   * 실행 중 여부
   */
  isTestRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 자동 시작 설정
   */
  static setupAutoStart(testRunner: TestRunner, options: AutomationOptions = {}): TestAutomation {
    const automation = new TestAutomation(testRunner, {
      ...options,
      autoStart: true,
    });

    // DOM 로드 후 자동 실행
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => automation.run(), automation.options.startDelay);
      });
    } else {
      // 이미 로드됨
      setTimeout(() => automation.run(), automation.options.startDelay);
    }

    return automation;
  }
}

/**
 * 전역 자동화 인터페이스 설정
 */
export function setupGlobalAutomation(testRunner: TestRunner, options: AutomationOptions = {}): void {
  const automation = new TestAutomation(testRunner, options);

  // 전역 API 노출
  (window as any).__GSAP_KIT_TEST__ = {
    run: () => automation.run(),
    getResult: () => automation.getResult(),
    isRunning: () => automation.isTestRunning(),
    runner: testRunner,
    automation,
  };

  console.log('[TestAutomation] Global automation API initialized');
  console.log('Usage: window.__GSAP_KIT_TEST__.run()');

  // 자동 시작 설정
  if (options.autoStart) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => automation.run(), options.startDelay || 0);
      });
    } else {
      setTimeout(() => automation.run(), options.startDelay || 0);
    }
  }
}

/**
 * 테스트 완료 대기 (Playwright/Puppeteer용)
 */
export async function waitForTestCompletion(timeout = 30000): Promise<AutomationResult> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      const testAPI = (window as any).__GSAP_KIT_TEST__;

      if (!testAPI) {
        clearInterval(checkInterval);
        reject(new Error('Test API not found'));
        return;
      }

      const result = testAPI.getResult();

      if (result && result.completed) {
        clearInterval(checkInterval);
        resolve(result);
        return;
      }

      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error(`Test timeout after ${timeout}ms`));
      }
    }, 100);
  });
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).TestAutomation = TestAutomation;
  (window as any).setupGlobalAutomation = setupGlobalAutomation;
  (window as any).waitForTestCompletion = waitForTestCompletion;
}
