// node dev-scripts/check-field-of-view.mjs <Playwright module URL> [base URL]
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium } = await import(process.argv[2]);
const base = process.argv[3] || 'http://127.0.0.1:5174';
const data = JSON.parse(fs.readFileSync('src/data/field-of-view.generated.json', 'utf8'));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('sb-welcome-dismissed', '1'));
  await page.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{}' }));
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${base}/home`);
    const pills = page.locator('button.field-plot-point');
    await pills.first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.field-plot').scrollIntoViewIfNeeded();
    assert.equal(await pills.count(), data.points.length);
    const boxes = await pills.evaluateAll(elements => elements.map(el => {
      const r = el.getBoundingClientRect();
      const p = el.closest('.field-plot').getBoundingClientRect();
      return { label: el.textContent, x: r.x, y: r.y, relativeX: r.x - p.x, relativeY: r.y - p.y, right: r.right, bottom: r.bottom, inside: r.left >= p.left && r.right <= p.right && r.top >= p.top && r.bottom <= p.bottom };
    }));
    for (const [i, a] of boxes.entries()) {
      assert.ok(a.inside, `${width}px: ${a.label} stays inside plot`);
      for (const b of boxes.slice(i + 1)) assert.ok(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y, `${width}px overlap: ${a.label}, ${b.label}`);
    }
    for (let i = 0; i < data.points.length; i++) {
      await pills.nth(i).focus();
      const links = page.locator('.field-source-links a');
      assert.equal(await page.locator('.field-wiki-button').getAttribute('href'), `/wiki/${data.points[i].id}`);
      assert.equal(await page.locator('.field-metrics-hint').count(), 0);
      assert.equal(await pills.nth(i).locator('.field-coordinate-pair.is-visible').textContent(), `(${Math.round(data.points[i].share * 100)}%, ${Math.round(data.points[i].practicalRatio * 100)}%)`);
      assert.ok(await pills.nth(i).locator('.field-coordinate-pair').evaluate(el => el.clientHeight <= parseFloat(getComputedStyle(el).lineHeight) + 1), 'The coordinate pair stays on one line');
      assert.equal(await page.locator('.field-detail-summary').innerText(), `${data.points[i].relatedArticles} related articles`);
      const stable = await pills.nth(i).evaluate(el => { const r = el.getBoundingClientRect(), p = el.closest('.field-plot').getBoundingClientRect(); return { x: r.x - p.x, y: r.y - p.y }; });
      assert.ok(Math.abs(stable.x - boxes[i].relativeX) < 1 && Math.abs(stable.y - boxes[i].relativeY) < 1, 'Changing the label to coordinates must not move the pill');
      assert.equal(await page.locator('.field-detail-rationale').textContent(), data.points[i].rationale);
      const panel = await page.locator('.field-split-layout').evaluate(el => ({ height: el.clientHeight, plot: el.querySelector('.field-plot').clientHeight }));
      if (width > 620) assert.ok(panel.height <= panel.plot + 2, `${width}px: evidence must not stretch the plot`);
      const titleHeights = await page.locator('.field-source-title').evaluateAll(elements => elements.map(el => ({ height: el.clientHeight, max: parseFloat(getComputedStyle(el).lineHeight) * 2 + 1 })));
      assert.ok(titleHeights.every(title => title.height <= title.max), 'Article titles occupy at most two lines');
      assert.equal(await links.first().getAttribute('href'), (data.points[i].sources[0].category === 'projects' ? '/lab/projects/' : '/blog/' + data.points[i].sources[0].category + '/') + data.points[i].sources[0].id);
      assert.ok(await links.count() > 1);
    }
    await pills.first().focus();
    assert.equal(await page.locator('.field-source-arrow').first().textContent(), '\u2197');
    for (const theme of ['dark', 'light']) {
      await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme);
      await page.locator('.home-field-index').screenshot({ path: `C:/Dev/infraphysics-review/field-${width}-${theme}.png` });
    }
    console.log(`PASS: ${width}px, ${boxes.length} pills, no overlap or clipping, keyboard evidence`);
  }
  assert.equal(await page.locator('.field-data-anchors, .field-projection-x, .field-projection-y').count(), 0);
  await page.locator('.field-wiki-button').click();
  await page.locator('.article-wiki').waitFor();
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
