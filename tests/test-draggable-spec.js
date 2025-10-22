import { chromium } from 'playwright';

async function testDraggableSpec() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext().then(c => c.newPage());

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[Browser Error]:', msg.text());
    }
  });

  console.log('🚀 Testing Draggable Spec\n');

  await page.goto('http://localhost:8000/pages/draggable/index.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  console.log('✅ Page loaded\n');

  // Check if draggable elements exist
  const hasDraggables = await page.evaluate(() => {
    const free = document.querySelector('.drag-free');
    const xBox = document.querySelector('.drag-box-x');
    const yBox = document.querySelector('.drag-box-y');
    const bounded = document.querySelector('#bounded-box');

    console.log('Found elements:', {
      free: !!free,
      xBox: !!xBox,
      yBox: !!yBox,
      bounded: !!bounded,
    });

    return !!(free && xBox && yBox && bounded);
  });

  console.log('Has draggable elements:', hasDraggables);

  await browser.close();
}

testDraggableSpec().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
