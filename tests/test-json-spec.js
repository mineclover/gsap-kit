import { chromium } from 'playwright';

async function testJsonSpec() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[Browser Error]:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.error('[Browser Error]:', error.message);
  });

  console.log('🚀 Testing JSON Spec Runner\n');

  // spec-test 페이지 로드
  await page.goto('http://localhost:8000/pages/spec-test/index.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  console.log('✅ Page loaded\n');

  // line-matching.spec.json 테스트 실행
  console.log('📝 Running line-matching.spec.json...\n');

  await page.evaluate(async () => {
    await window.loadAndRunSpec('/test-specs/line-matching.spec.json');
  });

  // Wait for tests to complete
  await page.waitForTimeout(3000);

  // Get result from window
  const result = await page.evaluate(() => window.__SPEC_TEST_RESULT__);

  if (!result) {
    console.log('❌ No test results found\n');
    await browser.close();
    process.exit(1);
    return;
  }

  console.log('═'.repeat(60));
  console.log('TEST RESULTS');
  console.log('═'.repeat(60));
  console.log('Spec File: line-matching.spec.json');
  console.log('Total Tests:', result.total);
  console.log('Passed:', result.passed);
  console.log('Failed:', result.failed);
  console.log('Pass Rate:', `${result.passRate.toFixed(2)}%`);
  console.log('Duration:', `${(result.duration / 1000).toFixed(2)}s`);
  console.log('═'.repeat(60));

  console.log('\n📊 Suite Breakdown:\n');
  result.suites.forEach((suite, idx) => {
    console.log(`${idx + 1}. ${suite.name}`);
    console.log(`   Total: ${suite.total}, Passed: ${suite.passed}, Failed: ${suite.failed}`);

    suite.tests.forEach((test, _testIdx) => {
      const status = test.passed ? '✅' : '❌';
      console.log(`   ${status} ${test.name} (${test.duration}ms)`);
      if (!test.passed && test.error) {
        console.log(`      Error: ${test.error}`);
      }
    });
    console.log('');
  });

  if (result.failed === 0) {
    console.log('🎉 All tests passed!\n');
  } else {
    console.log('❌ Some tests failed\n');
  }

  await page.waitForTimeout(2000);
  await browser.close();

  process.exit(result.failed === 0 ? 0 : 1);
}

testJsonSpec().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
