import { chromium } from 'file:///C:/Users/f29de/AppData/Local/npm-cache/_npx/420ff84f11983ee5/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(() => localStorage.setItem('sb-welcome-dismissed', '1'));
  await page.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{}' }));
  async function measure(label) {
    await page.locator('.article-wiki .article-content p').first().waitFor();
    const result = await page.evaluate(() => {
      const sel = '.article-wiki .article-content';
      return { root: getComputedStyle(document.documentElement).fontSize, body: getComputedStyle(document.body).fontSize, elements: [...document.querySelectorAll(`${sel} p, ${sel} li, ${sel} h2`)].slice(0, 8).map(n => ({ tag: n.tagName, size: getComputedStyle(n).fontSize, line: getComputedStyle(n).lineHeight })), sheets: [...document.styleSheets].map(s => s.href) };
    });
    console.log(label, result.elements);
    return result.elements.map(element => element.size);
  }
  await page.goto('http://127.0.0.1:4173/home');
  await page.locator('.sh-card-copy').click();
  const initial = await measure('from home');
  await page.screenshot({ path: 'C:/Dev/infraphysics-review/wiki-entry.png' });
  await page.reload();
  assert.deepEqual(await measure('reload'), initial);
  await page.goto('http://127.0.0.1:4173/blog/bits2bricks/3819540');
  await page.locator('.article-content').first().waitFor();
  await page.locator('.glab-crumb a[href="/home"]').click();
  await page.locator('.sh-card-copy').click();
  assert.deepEqual(await measure('after reading an article'), initial);
  console.log('PASS: wiki typography is identical on direct entry, reload and after article navigation.');
} finally { await browser.close(); }
