// Usage: node dev-scripts/check-article-nav-reveal.mjs <playwright module path>
import assert from 'node:assert/strict';
const { chromium } = await import(process.argv[2]);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const path of ['/blog/essays/3358174', '/blog/bits2bricks/3142718', '/lab/projects/7654321']) {
    await page.goto(`http://127.0.0.1:4173${path}`);
    await page.locator('.article-content').waitFor();
    const nav = page.locator('header.global-nav-shell');
    await page.mouse.move(720, 300);
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    assert.equal(await nav.getAttribute('data-hidden'), 'true', `${path}: down hides`);
    await page.mouse.move(720, 880);
    await page.waitForTimeout(500);
    assert.equal(await nav.getAttribute('data-hidden'), null, `${path}: bottom reveals`);
    await page.mouse.move(720, 300);
    await page.waitForTimeout(500);
    assert.equal(await nav.getAttribute('data-hidden'), 'true', `${path}: leaving hides`);
    await page.evaluate(() => window.scrollBy(0, -150));
    await page.waitForTimeout(500);
    assert.equal(await nav.getAttribute('data-hidden'), null, `${path}: up reveals`);
    console.log(`PASS ${path}: scroll down / bottom pointer / leave / scroll up`);
  }
} finally { await browser.close(); }
