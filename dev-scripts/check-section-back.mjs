// Usage: node dev-scripts/check-section-back.mjs <playwright module path> [base URL]
import assert from 'node:assert/strict';
const { chromium } = await import(process.argv[2]);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${process.argv[3] || 'http://127.0.0.1:4173'}/home`);
  const go = async path => {
    await page.evaluate(path => {
      history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
    await page.waitForTimeout(700);
  };
  for (const path of ['/about', '/contact', '/blog/essays', '/lab/projects', '/wiki']) {
    await go(path);
    assert.equal(await page.locator('button[aria-label="Return to previous section"]').count(), 2);
  }
  await page.locator('aside.fixed').waitFor();
  assert.equal(await page.locator('aside.fixed').evaluate(el => getComputedStyle(el).borderRightWidth), '0px');
  await go('/wiki/iOGYFvso');
  await page.reload();
  await page.waitForTimeout(1000);
  await page.keyboard.press('Escape');
  await page.locator('header button[aria-label="Return to previous section"]').last().focus();
  await page.locator('header button[aria-label="Return to previous section"]').last().click();
  await page.waitForURL('**/lab/projects');
  await page.setViewportSize({ width: 390, height: 844 });
  await go('/contact');
  assert.equal(await page.locator('button[aria-label="Return to previous section"]').first().isVisible(), true);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const sizes = [];
    for (const path of ['/blog/essays/3358174', '/blog/bits2bricks/3142718']) {
      await go(path);
      const paragraph = page.locator('.article-content > p').first();
      await paragraph.waitFor();
      sizes.push(await paragraph.evaluate(el => getComputedStyle(el).fontSize));
    }
    assert.equal(sizes[0], sizes[1], `Reading size at ${width}px`);
    console.log(`PASS: essay / Bits2Bricks body ${sizes[0]} at ${width}px`);
  }
  console.log('PASS: shared return action, wiki origin across notes/reload, border removal, mobile button');
} finally {
  await browser.close();
}
