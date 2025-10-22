import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Starting manual GSAP test...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to gsap-test page
  console.log('📄 Loading gsap-test page...');
  await page.goto('http://localhost:8000/pages/gsap-test/');
  await page.waitForLoadState('networkidle');

  console.log('✅ Page loaded');

  // Check if globals are available
  const globals = await page.evaluate(() => {
    return {
      hasGsapTest: typeof window.gsapTest !== 'undefined',
      hasGsapAssertions: typeof window.gsapAssertions !== 'undefined',
      hasRunTestsFromFile: typeof window.runTestsFromFile !== 'undefined',
      gsapTestKeys: window.gsapTest ? Object.keys(window.gsapTest) : [],
      gsapAssertionsKeys: window.gsapAssertions ? Object.keys(window.gsapAssertions) : [],
    };
  });

  console.log('\n📦 Global objects:');
  console.log(JSON.stringify(globals, null, 2));

  // Test 1: gsap-property-value assertion
  console.log('\n🧪 Test 1: gsap-property-value assertion');
  await page.click('#fade-trigger');
  console.log('  ✓ Clicked fade trigger');

  await page.waitForTimeout(1100);
  console.log('  ✓ Waited for animation');

  const test1Result = await page.evaluate(async () => {
    const { validateGSAPAssertion } = window.gsapAssertions;
    return validateGSAPAssertion({
      type: 'gsap-property-value',
      selector: '.fade-box',
      property: 'opacity',
      expected: 1,
      tolerance: 0.1,
    });
  });

  console.log(`  ${test1Result ? '✅' : '❌'} Result: ${test1Result}`);

  // Test 2: gsap-transform assertion
  console.log('\n🧪 Test 2: gsap-transform assertion');
  await page.click('#slide-trigger');
  console.log('  ✓ Clicked slide trigger');

  await page.waitForTimeout(1600);
  console.log('  ✓ Waited for animation');

  const test2Result = await page.evaluate(async () => {
    const { validateGSAPAssertion } = window.gsapAssertions;
    return validateGSAPAssertion({
      type: 'gsap-transform',
      selector: '.slide-box',
      transformProperty: 'x',
      expected: 200,
      tolerance: 5,
    });
  });

  console.log(`  ${test2Result ? '✅' : '❌'} Result: ${test2Result}`);

  // Test 3: gsap-is-animating assertion
  console.log('\n🧪 Test 3: gsap-is-animating assertion');
  await page.evaluate(() => window.gsapTest.resetAllAnimations());
  await page.waitForTimeout(500);

  await page.click('#rotation-trigger');
  console.log('  ✓ Clicked rotation trigger');

  await page.waitForTimeout(100);

  const test3Result = await page.evaluate(async () => {
    const { validateGSAPAssertion } = window.gsapAssertions;
    return validateGSAPAssertion({
      type: 'gsap-is-animating',
      selector: '.rotation-box',
    });
  });

  console.log(`  ${test3Result ? '✅' : '❌'} Result: ${test3Result}`);

  // Test 4: runTestsFromFile (JSON spec)
  console.log('\n🧪 Test 4: JSON spec execution');
  try {
    const specReport = await page.evaluate(async () => {
      const runSpecTests = window.gsapTest.runSpecTests;
      return await runSpecTests('/test-specs/gsap.spec.json');
    });

    console.log('  ✓ Spec executed');
    console.log(`  Total: ${specReport?.summary?.total || 'N/A'}`);
    console.log(`  Passed: ${specReport?.summary?.passed || 'N/A'}`);
    console.log(`  Failed: ${specReport?.summary?.failed || 'N/A'}`);
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }

  console.log('\n🎉 Manual test complete!');
  console.log('Press Ctrl+C to close browser...');

  // Close browser automatically
  await browser.close();
  console.log('\n👋 Browser closed');
})();
