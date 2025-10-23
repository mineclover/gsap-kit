/**
 * GSAP Kit - Test Runner Adapter
 * GSAP Kit의 테스트 러너를 ITestRunner 인터페이스에 맞게 어댑터 패턴으로 래핑
 */

import { createReport } from './reporter';
import { runTestsFromFile, runTestsFromObject } from './spec-runner';
import type { ITestReporter, ITestRunner, TestRunResult } from './test-runner-interface';

/**
 * GSAP Kit 테스트 러너 어댑터
 */
export class GsapTestRunnerAdapter implements ITestRunner {
  async runFromFile(filePath: string): Promise<TestRunResult> {
    const results = await runTestsFromFile(filePath);
    return {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      duration: results.duration,
      passRate: results.passRate,
      raw: results.raw,
    };
  }

  async runFromObject(spec: any): Promise<TestRunResult> {
    const results = await runTestsFromObject(spec);
    return {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      duration: results.duration,
      passRate: results.passRate,
      raw: results.raw,
    };
  }
}

/**
 * GSAP Kit 테스트 리포터 어댑터
 */
export class GsapTestReporterAdapter implements ITestReporter {
  render(results: Map<string, any>, container: HTMLElement): void {
    // createReport는 ReporterOptions를 받으므로 container 객체로 전달
    createReport(results, { container });
  }
}

/**
 * 기본 GSAP Kit 테스트 러너 인스턴스
 */
export const defaultTestRunner = new GsapTestRunnerAdapter();

/**
 * 기본 GSAP Kit 테스트 리포터 인스턴스
 */
export const defaultTestReporter = new GsapTestReporterAdapter();
