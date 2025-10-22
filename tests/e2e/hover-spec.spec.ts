/**
 * Hover Spec Test Runner
 * Tests hover simulation with JSON spec
 */

import { expect, test } from '@playwright/test';

test.describe('Hover Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Load the hover test page
    await page.goto('/pages/hover-test/');
    await page.waitForLoadState('networkidle');
  });

  test('should run hover.spec.json tests with 100% pass rate', async ({ page }) => {
    // Load the test spec
    const results = await page.evaluate(async () => {
      const { runTestsFromFile } = window as any;
      const result = await runTestsFromFile('/test-specs/hover.spec.json');
      return result;
    });

    console.log('\n=== Hover Spec Test Results ===');
    console.log(`Total: ${results.total}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Pass Rate: ${results.passRate.toFixed(2)}%`);
    console.log(`Duration: ${results.duration}ms`);

    // Log suite details
    for (const suite of results.suites) {
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

    // Assert 100% pass rate
    expect(results.failed).toBe(0);
    expect(results.passRate).toBe(100);
  });

  test('should handle tooltip hover correctly', async ({ page }) => {
    // Manual verification test
    const tooltipVisible = await page.evaluate(async () => {
      const { simulateHover } = window as any;

      // Simulate hover on tooltip trigger
      await simulateHover({
        target: '#tooltip-trigger',
        targetPosition: 'center',
        hoverDuration: 500,
      });

      // Check if tooltip is visible
      const tooltip = document.querySelector('.tooltip');
      return tooltip?.classList.contains('visible') ?? false;
    });

    expect(tooltipVisible).toBe(true);
  });

  test('should handle hover box color change', async ({ page }) => {
    const hoverBoxHovered = await page.evaluate(async () => {
      const { simulateHover } = window as any;

      await simulateHover({
        target: '.hover-box',
        targetPosition: 'center',
        hoverDuration: 300,
      });

      const hoverBox = document.querySelector('.hover-box');
      return hoverBox?.classList.contains('hovered') ?? false;
    });

    expect(hoverBoxHovered).toBe(true);
  });

  test('should handle scale animation', async ({ page }) => {
    const scaleAnimated = await page.evaluate(async () => {
      const { simulateHover } = window as any;

      await simulateHover({
        target: '#hover-scale',
        targetPosition: 'center',
        hoverDuration: 300,
      });

      const hoverScale = document.querySelector('#hover-scale');
      return hoverScale?.classList.contains('scaled') ?? false;
    });

    expect(scaleAnimated).toBe(true);
  });

  test('should remove hover state after leaving', async ({ page }) => {
    const stateAfterLeave = await page.evaluate(async () => {
      const { simulateHover } = window as any;

      // Hover and then leave
      await simulateHover({
        target: '#hover-scale',
        targetPosition: 'center',
        hoverDuration: 200,
        exitDuration: 300,
      });

      // Wait for exit animation to complete
      await new Promise(resolve => setTimeout(resolve, 400));

      const hoverScale = document.querySelector('#hover-scale');
      return hoverScale?.classList.contains('scaled') ?? false;
    });

    expect(stateAfterLeave).toBe(false);
  });
});
