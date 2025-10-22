/**
 * GSAP Kit - JSON Spec Test Runner
 * JSON 스펙 기반 테스트 실행 엔진
 */

import type { AutomationResult } from './automation';
import { type TestFileSpec, TestSpecLoader } from './spec-loader';
import { TestRunner } from './test-runner';

/**
 * JSON 스펙 기반 테스트 러너
 */
export class SpecRunner {
  private testRunner: TestRunner;
  private spec: TestFileSpec | null = null;

  constructor(testRunner: TestRunner = new TestRunner()) {
    this.testRunner = testRunner;
  }

  /**
   * JSON 파일에서 테스트 로드 및 등록
   */
  async loadFromFile(filePath: string): Promise<void> {
    console.log(`[SpecRunner] Loading test spec from: ${filePath}`);

    this.spec = await TestSpecLoader.loadFromFile(filePath);
    this.registerSpec(this.spec);

    console.log(`[SpecRunner] Loaded ${this.spec.suites.length} test suites`);
  }

  /**
   * JSON 객체에서 테스트 로드 및 등록
   */
  loadFromObject(spec: TestFileSpec): void {
    console.log(`[SpecRunner] Loading test spec from object`);

    this.spec = TestSpecLoader.loadFromObject(spec);
    this.registerSpec(this.spec);

    console.log(`[SpecRunner] Loaded ${this.spec.suites.length} test suites`);
  }

  /**
   * 스펙 등록
   */
  private registerSpec(spec: TestFileSpec): void {
    // 기존 테스트 초기화
    this.testRunner.reset();

    // 각 스위트 등록
    for (const suiteSpec of spec.suites) {
      const testSuite = TestSpecLoader.convertToTestSuite(suiteSpec, spec.config);
      this.testRunner.registerSuite(testSuite);
    }
  }

  /**
   * 모든 테스트 실행
   */
  async runAll(): Promise<Map<string, any>> {
    if (!this.spec) {
      throw new Error('[SpecRunner] No test spec loaded');
    }

    console.log(`[SpecRunner] Running all tests...`);

    const results = await this.testRunner.runAll();

    console.log(`[SpecRunner] Tests completed`);

    return results;
  }

  /**
   * 특정 스위트만 실행
   */
  async runSuite(suiteName: string): Promise<any> {
    if (!this.spec) {
      throw new Error('[SpecRunner] No test spec loaded');
    }

    console.log(`[SpecRunner] Running suite: ${suiteName}`);

    const results = await this.testRunner.runSuiteByName(suiteName);

    console.log(`[SpecRunner] Suite completed`);

    return results;
  }

  /**
   * 결과 가져오기
   */
  getResults(): Map<string, any> {
    return this.testRunner.getResults();
  }

  /**
   * 통계 가져오기
   */
  getStats() {
    return this.testRunner.getStats();
  }

  /**
   * 스펙 정보 가져오기
   */
  getSpec(): TestFileSpec | null {
    return this.spec;
  }

  /**
   * TestRunner 가져오기
   */
  getTestRunner(): TestRunner {
    return this.testRunner;
  }
}

/**
 * JSON 스펙 파일에서 자동으로 테스트 로드 및 실행
 */
export async function runTestsFromFile(filePath: string): Promise<AutomationResult> {
  const runner = new SpecRunner();
  await runner.loadFromFile(filePath);

  const results = await runner.runAll();
  const stats = runner.getStats();

  return {
    completed: true,
    total: stats.total,
    passed: stats.passed,
    failed: stats.failed,
    duration: stats.duration,
    passRate: stats.total > 0 ? (stats.passed / stats.total) * 100 : 0,
    suites: Array.from(results.entries()).map(([name, tests]) => ({
      name,
      total: tests.length,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length,
      duration: tests.reduce((sum: number, t: any) => sum + t.duration, 0),
      tests,
    })),
    raw: results,
  };
}

/**
 * JSON 스펙 객체에서 테스트 실행
 */
export function runTestsFromObject(spec: TestFileSpec): Promise<AutomationResult> {
  return new Promise((resolve, reject) => {
    try {
      const runner = new SpecRunner();
      runner.loadFromObject(spec);

      runner
        .runAll()
        .then(results => {
          const stats = runner.getStats();

          resolve({
            completed: true,
            total: stats.total,
            passed: stats.passed,
            failed: stats.failed,
            duration: stats.duration,
            passRate: stats.total > 0 ? (stats.passed / stats.total) * 100 : 0,
            suites: Array.from(results.entries()).map(([name, tests]) => ({
              name,
              total: tests.length,
              passed: tests.filter((t: any) => t.passed).length,
              failed: tests.filter((t: any) => !t.passed).length,
              duration: tests.reduce((sum: number, t: any) => sum + t.duration, 0),
              tests,
            })),
            raw: results,
          });
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

// 전역으로 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
  (window as any).SpecRunner = SpecRunner;
  (window as any).runTestsFromFile = runTestsFromFile;
  (window as any).runTestsFromObject = runTestsFromObject;
}
