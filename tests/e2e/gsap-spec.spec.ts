/**
 * GSAP Spec E2E Tests
 * Playwright test runner for gsap.spec.json
 */

import { expect, test } from '@playwright/test';

test.describe('GSAP Animation Assertions - JSON Spec Execution', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to gsap-test page
    await page.goto('http://localhost:8000/pages/gsap-test/');
    await page.waitForLoadState('networkidle');
  });

  test('should load gsap.spec.json and execute all tests', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for all 18 tests
    // Capture console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('TestSpecLoader') || text.includes('TestRunner') || text.includes('MouseSimulator')) {
        console.log('[BROWSER]', text);
      }
    });

    // Load and execute JSON spec
    const report = await page.evaluate(async () => {
      try {
        const runSpecTests = (window as any).gsapTest.runSpecTests;
        return await runSpecTests('/test-specs/gsap.spec.json');
      } catch (error) {
        console.error('Spec execution error:', error);
        throw error;
      }
    });

    // Verify report structure
    expect(report).toBeDefined();
    expect(report.total).toBeGreaterThan(0);

    // Log results
    console.log('\n📊 GSAP Spec Test Report:');
    console.log(`Total: ${report.total}`);
    console.log(`Passed: ${report.passed}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Pass Rate: ${report.passRate.toFixed(2)}%`);
    console.log(`Duration: ${report.duration}ms`);

    // Log suite details
    for (const suite of report.suites) {
      console.log(`\n${suite.name}:`);
      console.log(`  Total: ${suite.total}`);
      console.log(`  Passed: ${suite.passed}`);
      console.log(`  Failed: ${suite.failed}`);

      for (const testCase of suite.tests) {
        const status = testCase.passed ? '✓' : '✗';
        console.log(`  ${status} ${testCase.name} (${testCase.duration}ms)`);
        if (!testCase.passed && testCase.error) {
          console.log(`    Error: ${testCase.error}`);
        }
      }
    }

    // Assert all tests passed
    expect(report.failed).toBe(0);
    expect(report.passRate).toBe(100);
  });

  test.describe('Specific GSAP Assertions', () => {
    test('gsap-property-value assertion works correctly', async ({ page }) => {
      // Trigger fade animation
      await page.click('#fade-trigger');
      await page.waitForTimeout(1100); // Wait for animation to complete

      // Check opacity property
      const isValid = await page.evaluate(async () => {
        const { validateGSAPAssertion } = (window as any).gsapAssertions;

        return validateGSAPAssertion({
          type: 'gsap-property-value',
          selector: '.fade-box',
          property: 'opacity',
          expected: 1,
          tolerance: 0.1,
        });
      });

      expect(isValid).toBe(true);
    });

    test('gsap-transform assertion works correctly', async ({ page }) => {
      // Trigger slide animation
      await page.click('#slide-trigger');
      await page.waitForTimeout(1600); // Wait for animation to complete

      // Check x transform
      const isValid = await page.evaluate(async () => {
        const { validateGSAPAssertion } = (window as any).gsapAssertions;

        return validateGSAPAssertion({
          type: 'gsap-transform',
          selector: '.slide-box',
          transformProperty: 'x',
          expected: 200,
          tolerance: 5,
        });
      });

      expect(isValid).toBe(true);
    });

    test('gsap-is-animating assertion works correctly', async ({ page }) => {
      // Trigger rotation animation
      await page.click('#rotation-trigger');
      await page.waitForTimeout(100);

      // Check if animating
      const isAnimating = await page.evaluate(async () => {
        const { validateGSAPAssertion } = (window as any).gsapAssertions;

        return validateGSAPAssertion({
          type: 'gsap-is-animating',
          selector: '.rotation-box',
        });
      });

      expect(isAnimating).toBe(true);
    });

    test('gsap-progress assertion works correctly', async ({ page }) => {
      // Trigger progress animation
      await page.click('#progress-trigger');
      await page.waitForTimeout(1500); // Wait for ~50% progress

      // Check progress range
      const isValid = await page.evaluate(async () => {
        const { validateGSAPAssertion } = (window as any).gsapAssertions;

        return validateGSAPAssertion({
          type: 'gsap-progress',
          selector: '.progress-box',
          minProgress: 0.4,
          maxProgress: 0.6,
        });
      });

      expect(isValid).toBe(true);
    });

    test('gsap-duration assertion works correctly', async ({ page }) => {
      // Trigger rotation animation
      await page.click('#rotation-trigger');
      await page.waitForTimeout(100);

      // Check duration
      const isValid = await page.evaluate(async () => {
        const { validateGSAPAssertion } = (window as any).gsapAssertions;

        return validateGSAPAssertion({
          type: 'gsap-duration',
          selector: '.rotation-box',
          expected: 2,
          tolerance: 0.1,
        });
      });

      expect(isValid).toBe(true);
    });

    test('waitForAnimation option works correctly', async ({ page }) => {
      // Trigger scale animation
      await page.click('#scale-trigger');

      // Validate with waitForAnimation
      const isValid = await page.evaluate(async () => {
        const { validateGSAPAssertion } = (window as any).gsapAssertions;

        return validateGSAPAssertion({
          type: 'gsap-transform',
          selector: '.scale-box',
          transformProperty: 'scale',
          expected: 1.5,
          tolerance: 0.1,
          waitForAnimation: true,
          timeout: 2000,
        });
      });

      expect(isValid).toBe(true);
    });
  });
});
