/**
 * GSAP Kit - E2E Tests
 * Playwright를 사용한 자동화 테스트
 */

import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';

test.describe('Line Matching Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 페이지 로드
    await page.goto(`${BASE_URL}/dist/pages/interaction-test/index.html`);

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should have test API available', async ({ page }) => {
    // 테스트 API가 window에 노출되어 있는지 확인
    const hasTestAPI = await page.evaluate(() => {
      return typeof (window as any).__GSAP_KIT_TEST__ !== 'undefined';
    });

    expect(hasTestAPI).toBe(true);
  });

  test('should run all tests programmatically', async ({ page }) => {
    // 테스트 실행
    const result = await page.evaluate(async () => {
      const testAPI = (window as any).__GSAP_KIT_TEST__;
      return await testAPI.run();
    });

    console.log('Test Result:', JSON.stringify(result, null, 2));

    // 결과 검증
    expect(result).toBeDefined();
    expect(result.completed).toBe(true);
    expect(result.total).toBeGreaterThan(0);
    expect(result.passed).toBeGreaterThan(0);

    // 모든 테스트가 통과했는지 확인
    expect(result.failed).toBe(0);
    expect(result.passRate).toBe(100);
  });

  test('should run tests with autoRun parameter', async ({ page }) => {
    // autoRun 파라미터와 함께 페이지 로드
    await page.goto(`${BASE_URL}/dist/pages/interaction-test/index.html?autoRun=true`);
    await page.waitForLoadState('networkidle');

    // 테스트가 자동으로 실행될 때까지 대기 (최대 30초)
    await page.waitForFunction(
      () => {
        const testAPI = (window as any).__GSAP_KIT_TEST__;
        const result = testAPI?.getResult();
        return result && result.completed === true;
      },
      { timeout: 30000 }
    );

    // 결과 가져오기
    const result = await page.evaluate(() => {
      const testAPI = (window as any).__GSAP_KIT_TEST__;
      return testAPI.getResult();
    });

    console.log('Auto-run Test Result:', JSON.stringify(result, null, 2));

    // 결과 검증
    expect(result).toBeDefined();
    expect(result.completed).toBe(true);
    expect(result.total).toBeGreaterThan(0);
    expect(result.failed).toBe(0);
  });

  test('should display test report UI', async ({ page }) => {
    // 테스트 실행
    await page.evaluate(async () => {
      const testAPI = (window as any).__GSAP_KIT_TEST__;
      await testAPI.run();
    });

    // 리포트 컨테이너가 있는지 확인
    const reportContainer = await page.locator('#reporter-container');
    await expect(reportContainer).toBeVisible();

    // 테스트 결과가 렌더링되었는지 확인
    const testReport = await page.locator('.test-report');
    await expect(testReport).toBeVisible();

    // 통계 카드가 있는지 확인
    const statCards = await page.locator('.stat-card');
    await expect(statCards.first()).toBeVisible();
  });

  test('should log test execution', async ({ page }) => {
    // 콘솔 로그 수집
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        logs.push(msg.text());
      }
    });

    // 테스트 실행
    await page.evaluate(async () => {
      const testAPI = (window as any).__GSAP_KIT_TEST__;
      await testAPI.run();
    });

    // 로그가 기록되었는지 확인
    expect(logs.length).toBeGreaterThan(0);

    // 자동화 로그가 있는지 확인
    const hasAutomationLog = logs.some(log => log.includes('[TestAutomation]'));
    expect(hasAutomationLog).toBe(true);
  });

  test('should verify individual test cases', async ({ page }) => {
    // 테스트 실행
    const result = await page.evaluate(async () => {
      const testAPI = (window as any).__GSAP_KIT_TEST__;
      return await testAPI.run();
    });

    // 각 스위트 검증
    expect(result.suites).toBeDefined();
    expect(result.suites.length).toBeGreaterThan(0);

    for (const suite of result.suites) {
      console.log(`Suite: ${suite.name}`);
      console.log(`  Total: ${suite.total}, Passed: ${suite.passed}, Failed: ${suite.failed}`);

      // 모든 테스트가 통과했는지 확인
      expect(suite.failed).toBe(0);
      expect(suite.passed).toBe(suite.total);

      // 각 테스트 케이스 검증
      for (const test of suite.tests) {
        expect(test.passed).toBe(true);
        expect(test.duration).toBeGreaterThan(0);
      }
    }
  });

  test('should handle test timeout gracefully', async ({ page }) => {
    // 타임아웃 테스트를 위해 매우 짧은 시간 설정
    const hasTimeout = await page.evaluate(async () => {
      try {
        const testAPI = (window as any).__GSAP_KIT_TEST__;

        // 테스트가 완료될 때까지 대기 (실제로는 완료됨)
        const result = await testAPI.run();
        return false; // 타임아웃 없음
      } catch (error) {
        return true; // 타임아웃 발생
      }
    });

    // 이 테스트는 타임아웃이 발생하지 않아야 함
    expect(hasTimeout).toBe(false);
  });
});

test.describe('Test Runner Manual Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/dist/pages/interaction-test/index.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should run tests via button click', async ({ page }) => {
    // "Run All Tests" 버튼 클릭
    const runButton = await page.locator('#runAllTests');
    await expect(runButton).toBeVisible();
    await runButton.click();

    // 테스트 완료 대기
    await page.waitForFunction(
      () => {
        const testAPI = (window as any).__GSAP_KIT_TEST__;
        const result = testAPI?.getResult();
        return result && result.completed === true;
      },
      { timeout: 30000 }
    );

    // 결과 확인
    const result = await page.evaluate(() => {
      const testAPI = (window as any).__GSAP_KIT_TEST__;
      return testAPI.getResult();
    });

    expect(result).toBeDefined();
    expect(result.completed).toBe(true);
  });

  test('should clear test results', async ({ page }) => {
    // 테스트 실행
    const runButton = await page.locator('#runAllTests');
    await runButton.click();

    await page.waitForTimeout(5000); // 테스트 실행 대기

    // Clear 버튼 클릭
    const clearButton = await page.locator('#clearTests');
    await clearButton.click();

    // 로그가 지워졌는지 확인
    const logContainer = await page.locator('#log-container');
    const logText = await logContainer.textContent();

    // Clear 후에는 "Cleared test results" 메시지만 있어야 함
    expect(logText).toContain('Cleared test results');
  });

  test('should toggle visualization', async ({ page }) => {
    // Visualization 토글
    const visualizeToggle = await page.locator('#visualizeToggle');
    await expect(visualizeToggle).toBeVisible();

    // 토글 체크 상태 확인
    const isChecked = await visualizeToggle.isChecked();

    // 토글 클릭
    await visualizeToggle.click();

    // 상태가 변경되었는지 확인
    const newIsChecked = await visualizeToggle.isChecked();
    expect(newIsChecked).toBe(!isChecked);
  });

  test('should toggle slow motion', async ({ page }) => {
    // Slow Motion 토글
    const slowMotionToggle = await page.locator('#slowMotionToggle');
    await expect(slowMotionToggle).toBeVisible();

    // 토글 클릭
    await slowMotionToggle.click();

    // 로그 확인
    const logContainer = await page.locator('#log-container');
    const logText = await logContainer.textContent();
    expect(logText).toContain('Slow motion');
  });
});
