#!/usr/bin/env ts-node

/**
 * GSAP Kit Example Runner
 * Playwright 기반 예제 실행 및 테스트 자동화
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { type Browser, chromium, type Page } from 'playwright';

// ==================== 타입 정의 ====================

interface ScenarioConfig {
  name: string;
  target: {
    html: string;
    waitForSelector?: string;
    viewport?: { width: number; height: number };
    timeout?: number;
  };
  tests: TestCase[];
}

interface TestCase {
  id: string;
  name: string;
  actions: Action[];
  assertions?: Assertion[];
  capturePoints?: ('start' | 'middle' | 'end')[];
}

interface Action {
  type: 'drag' | 'click' | 'wait';
  from?: string;
  to?: string;
  target?: string;
  duration?: number;
  delay?: number;
}

interface Assertion {
  eval: string;
  expected?: any;
}

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'error';
  duration: number;
  error?: string;
  assertions?: AssertionResult[];
  screenshots?: {
    start?: string;
    middle?: string;
    end?: string;
  };
}

interface AssertionResult {
  eval: string;
  result: boolean;
  actual?: any;
  expected?: any;
}

// ==================== 유틸리티 ====================

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
  };
  const reset = '\x1b[0m';
  const icon = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warning: '⚠',
  };

  console.log(`${colors[type]}${icon[type]} ${message}${reset}`);
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ==================== Example Runner ====================

class ExampleRunner {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private headed: boolean;
  private slowMo: number;

  constructor(options: { headed?: boolean; slowMo?: number } = {}) {
    this.headed = options.headed ?? false;
    this.slowMo = options.slowMo ?? 0;
  }

  async init(): Promise<void> {
    log('Initializing browser...', 'info');
    this.browser = await chromium.launch({
      headless: !this.headed,
      slowMo: this.slowMo,
    });
    this.page = await this.browser.newPage();
    log(`Browser launched (headless: ${!this.headed})`, 'success');
  }

  async runScenario(scenarioPath: string, options: { test?: string } = {}): Promise<void> {
    if (!this.page || !this.browser) {
      throw new Error('Browser not initialized');
    }

    const scenarioDir = path.resolve(process.cwd(), 'examples', scenarioPath);
    const scenarioFile = path.join(scenarioDir, 'scenario.json');

    if (!fs.existsSync(scenarioFile)) {
      throw new Error(`Scenario not found: ${scenarioFile}`);
    }

    log(`Loading scenario: ${scenarioPath}`, 'info');
    const scenario: ScenarioConfig = JSON.parse(fs.readFileSync(scenarioFile, 'utf-8'));

    // HTML 경로 해결
    const htmlPath = path.resolve(scenarioDir, scenario.target.html);
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HTML not found: ${htmlPath}`);
    }

    // 결과 디렉토리 생성
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const resultDir = path.join(process.cwd(), 'test-results', scenarioPath, `${timestamp}-${Date.now()}`);
    ensureDir(resultDir);

    log(`Result directory: ${resultDir}`, 'info');

    // Viewport 설정
    if (scenario.target.viewport) {
      await this.page.setViewportSize(scenario.target.viewport);
    }

    // HTML 로드
    log(`Loading HTML: ${htmlPath}`, 'info');
    await this.page.goto(`file://${htmlPath}`);

    // 페이지 로드 대기
    await this.page.waitForLoadState('domcontentloaded');

    // GSAP 라이브러리가 로드될 때까지 대기
    await this.page.waitForFunction('typeof gsap !== "undefined"', { timeout: 5000 });
    log('GSAP loaded', 'success');

    // 시나리오별 필요한 라이브러리 주입
    const scenarioName = path.basename(scenarioDir);
    const libPath = path.join(process.cwd(), 'dist', 'lib', `${scenarioName}.min.js`);

    if (fs.existsSync(libPath)) {
      log(`Injecting library: ${libPath}`, 'info');
      await this.page.addScriptTag({ path: libPath });

      // 라이브러리가 로드될 때까지 추가 대기
      await this.page.waitForTimeout(500);
    } else {
      log(`Library not found: ${libPath}`, 'warning');
    }

    if (scenario.target.waitForSelector) {
      const timeout = scenario.target.timeout ?? 10000;
      log(`Waiting for selector: ${scenario.target.waitForSelector}`, 'info');
      try {
        await this.page.waitForSelector(scenario.target.waitForSelector, { timeout });
        log(`Selector found: ${scenario.target.waitForSelector}`, 'success');
      } catch (error) {
        // 디버깅을 위한 페이지 내용 출력
        const content = await this.page.content();
        log(`Page content length: ${content.length}`, 'warning');
        const hasSelector = await this.page.$(scenario.target.waitForSelector);
        log(`Selector found: ${!!hasSelector}`, 'warning');

        // window 객체의 createLineMatching 확인
        const hasCreate = await this.page.evaluate(() => typeof (window as any).createLineMatching !== 'undefined');
        log(`window.createLineMatching exists: ${hasCreate}`, 'warning');

        throw error;
      }
    }

    // 테스트 필터링
    const testsToRun = options.test ? scenario.tests.filter(t => t.id === options.test) : scenario.tests;

    if (testsToRun.length === 0) {
      log(`No tests found${options.test ? ` with id: ${options.test}` : ''}`, 'warning');
      return;
    }

    log(`Running ${testsToRun.length} test(s)...`, 'info');

    const results: TestResult[] = [];

    for (const test of testsToRun) {
      const result = await this.runTest(test, this.page, resultDir);
      results.push(result);

      if (result.status === 'passed') {
        log(`Test "${test.name}" passed (${result.duration}ms)`, 'success');
      } else {
        log(`Test "${test.name}" failed: ${result.error}`, 'error');
      }
    }

    // Summary 저장
    const summary = {
      scenario: scenario.name,
      timestamp: new Date().toISOString(),
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      error: results.filter(r => r.status === 'error').length,
      results,
    };

    fs.writeFileSync(path.join(resultDir, 'summary.json'), JSON.stringify(summary, null, 2));

    log('\n===== Summary =====', 'info');
    log(`Total: ${summary.total}`, 'info');
    log(`Passed: ${summary.passed}`, 'success');
    log(`Failed: ${summary.failed}`, summary.failed > 0 ? 'error' : 'info');
    log(`Error: ${summary.error}`, summary.error > 0 ? 'error' : 'info');
    log(`Results saved to: ${resultDir}`, 'success');
  }

  private async runTest(test: TestCase, page: Page, resultDir: string): Promise<TestResult> {
    const startTime = Date.now();
    const testDir = path.join(resultDir, test.id);
    ensureDir(testDir);

    const result: TestResult = {
      id: test.id,
      name: test.name,
      status: 'passed',
      duration: 0,
      screenshots: {},
      assertions: [],
    };

    try {
      const capturePoints = test.capturePoints ?? ['start', 'middle', 'end'];

      // Start 캡처
      if (capturePoints.includes('start')) {
        const startPath = path.join(testDir, 'start.png');
        await page.screenshot({ path: startPath });
        result.screenshots!.start = path.relative(resultDir, startPath);
      }

      // Actions 실행
      for (let i = 0; i < test.actions.length; i++) {
        const action = test.actions[i];

        // Middle 캡처 (첫 번째 액션 중간)
        if (i === 0 && capturePoints.includes('middle')) {
          await this.executeAction(action, page, async progress => {
            if (progress >= 0.5 && !result.screenshots!.middle) {
              const middlePath = path.join(testDir, 'middle.png');
              await page.screenshot({ path: middlePath });
              result.screenshots!.middle = path.relative(resultDir, middlePath);
            }
          });
        } else {
          await this.executeAction(action, page);
        }
      }

      // End 캡처
      if (capturePoints.includes('end')) {
        const endPath = path.join(testDir, 'end.png');
        await page.screenshot({ path: endPath });
        result.screenshots!.end = path.relative(resultDir, endPath);
      }

      // Assertions 실행
      if (test.assertions) {
        for (const assertion of test.assertions) {
          const assertionResult = await this.executeAssertion(assertion, page);
          result.assertions!.push(assertionResult);

          if (!assertionResult.result) {
            result.status = 'failed';
            result.error = `Assertion failed: ${assertion.eval}`;
          }
        }
      }
    } catch (error) {
      result.status = 'error';
      result.error = error instanceof Error ? error.message : String(error);
    }

    result.duration = Date.now() - startTime;

    // 테스트 결과 저장
    fs.writeFileSync(path.join(testDir, 'result.json'), JSON.stringify(result, null, 2));

    return result;
  }

  private async executeAction(
    action: Action,
    page: Page,
    onProgress?: (progress: number) => Promise<void>
  ): Promise<void> {
    switch (action.type) {
      case 'drag': {
        if (!action.from || !action.to) {
          throw new Error('Drag action requires "from" and "to" selectors');
        }

        const fromElement = await page.$(action.from);
        const toElement = await page.$(action.to);

        if (!fromElement || !toElement) {
          throw new Error(`Element not found: ${!fromElement ? action.from : action.to}`);
        }

        const fromBox = await fromElement.boundingBox();
        const toBox = await toElement.boundingBox();

        if (!fromBox || !toBox) {
          throw new Error('Could not get element bounding box');
        }

        // 중심점 계산
        const fromX = fromBox.x + fromBox.width / 2;
        const fromY = fromBox.y + fromBox.height / 2;
        const toX = toBox.x + toBox.width / 2;
        const toY = toBox.y + toBox.height / 2;

        const duration = action.duration ?? 1000;
        const steps = Math.ceil(duration / 16); // ~60fps

        await page.mouse.move(fromX, fromY);
        await page.mouse.down();

        for (let i = 0; i <= steps; i++) {
          const progress = i / steps;
          const x = fromX + (toX - fromX) * progress;
          const y = fromY + (toY - fromY) * progress;

          await page.mouse.move(x, y);

          if (onProgress) {
            await onProgress(progress);
          }

          await page.waitForTimeout(16);
        }

        await page.mouse.up();
        break;
      }

      case 'click': {
        if (!action.target) {
          throw new Error('Click action requires "target" selector');
        }
        await page.click(action.target);
        break;
      }

      case 'wait': {
        const delay = action.delay ?? 1000;
        await page.waitForTimeout(delay);
        break;
      }

      default:
        throw new Error(`Unknown action type: ${(action as any).type}`);
    }
  }

  private async executeAssertion(assertion: Assertion, page: Page): Promise<AssertionResult> {
    try {
      const actual = await page.evaluate(assertion.eval);
      const result = assertion.expected !== undefined ? actual === assertion.expected : !!actual;

      return {
        eval: assertion.eval,
        result,
        actual,
        expected: assertion.expected,
      };
    } catch (error) {
      return {
        eval: assertion.eval,
        result: false,
        actual: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      log('Browser closed', 'info');
    }
  }
}

// ==================== CLI ====================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
GSAP Kit Example Runner

Usage:
  npm run example <scenario> [options]

Arguments:
  <scenario>       Scenario name (e.g., "line-matching")

Options:
  --headed         Run with visible browser
  --show           Alias for --headed
  --slow-mo <ms>   Slow down execution by N milliseconds
  --test <id>      Run specific test by ID
  --all            Run all examples

Examples:
  npm run example line-matching
  npm run example line-matching --headed
  npm run example line-matching --test test-001
  npm run example line-matching --slow-mo 500
  npm run example --all
    `);
    process.exit(0);
  }

  const headed = args.includes('--headed') || args.includes('--show');
  const slowMoIndex = args.indexOf('--slow-mo');
  const slowMo = slowMoIndex !== -1 ? Number.parseInt(args[slowMoIndex + 1], 10) : 0;
  const testIndex = args.indexOf('--test');
  const testId = testIndex !== -1 ? args[testIndex + 1] : undefined;
  const runAll = args.includes('--all');

  const scenario = args.find(arg => !arg.startsWith('--'));

  if (!runAll && !scenario) {
    log('Error: Scenario name required', 'error');
    process.exit(1);
  }

  const runner = new ExampleRunner({ headed, slowMo });

  try {
    await runner.init();

    if (runAll) {
      const examplesDir = path.join(process.cwd(), 'examples');
      const scenarios = fs
        .readdirSync(examplesDir)
        .filter(dir => fs.existsSync(path.join(examplesDir, dir, 'scenario.json')));

      log(`Found ${scenarios.length} scenario(s)`, 'info');

      for (const sc of scenarios) {
        log(`\n===== Running: ${sc} =====`, 'info');
        await runner.runScenario(sc, { test: testId });
      }
    } else if (scenario) {
      await runner.runScenario(scenario, { test: testId });
    }
  } catch (error) {
    log(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
  } finally {
    await runner.close();
  }
}

main().catch(error => {
  console.error('Unhandled error in main:', error);
  process.exit(1);
});
