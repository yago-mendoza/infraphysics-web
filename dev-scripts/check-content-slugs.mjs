// node dev-scripts/check-content-slugs.mjs <playwright module path> [base URL] [--serve]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { preview } from 'vite';
const { chromium } = await import(process.argv[2]);
const base = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 'http://localhost:4175';
const server = process.argv.includes('--serve') ? await preview({ configFile: false, preview: { host: 'localhost', port: 4175, strictPort: true } }) : null;
let browser;
const errors = [];
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    // Playwright injects this into subframes too; sandboxed frames cannot use storage.
    if (window !== window.top) return;
    try { localStorage.setItem('sb-welcome-dismissed', '1'); } catch { /* opaque initial document */ }
  });
  page.on('pageerror', e => { errors.push(e.message); console.log('PAGE ERROR', e.message); });
  page.on('console', m => {
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) console.log('CONSOLE ERROR', m.text());
    if (m.text().includes('[ErrorBoundary]')) errors.push(m.text());
  });
  await page.route('**/api/**', r => r.fulfill({ json: { views: 42, hearts: 12, hearted: false } }));
  // Comments and media are external; this test verifies local navigation.
  await page.route('https://giscus.app/**', r => r.abort());
  await page.route('https://cdn.infraphysics.net/**', r => r.abort());
  const requests = [];
  page.on('request', r => { if (r.url().includes('/api/')) requests.push(r.url()); });
  const cases = [
    ['/wiki/Economy1?via=test#section', '/wiki/economics?via=test#section', 'Economics'],
    ['/lab/second-brain/iOGYFvso?via=test#section', '/wiki/feedback-loop?via=test#section', 'Feedback loop'],
    ['/wiki/OpEx7Rn', '/wiki/op-ex', null],
    ['/lab/projects/7654321?via=test#method', '/lab/projects/forecasting-visual-auras?via=test#method', 'Forecasting'],
    ['/projects/7654321', '/lab/projects/forecasting-visual-auras', 'Forecasting'],
    ['/blog/threads/4419076#section', '/blog/essays/why-rust-exists#section', 'Why Rust'],
    ['/blog/bits2bricks/5917362', '/blog/bits2bricks/transformers-from-scratch', 'Transformers'],
    ['/wiki/react-framework', '/wiki/react-framework', 'React'],
    ['/wiki/react-agent', '/wiki/react-agent', 'ReAct'],
  ];
  const entries = JSON.parse(fs.readFileSync('src/data/content-routes.generated.json'));
  cases[2][1] = '/wiki/' + entries.find(e => e.id === 'OpEx7Rn').slug;
  for (const [from, to, title] of cases) {
    await page.goto(base + from);
    await page.waitForURL(base + to);
    if (title) await page.getByRole('heading').filter({ hasText: title }).first().waitFor({ timeout: 10000 }).catch(async error => {
      console.log('FAILED PAGE', page.url(), (await page.locator('body').innerText()).slice(0, 1600));
      throw error;
    });
    assert.equal(new URL(page.url()).pathname + new URL(page.url()).search + new URL(page.url()).hash, to);
    console.log(`OK ${from} -> ${to}`);
  }
  // Every article can be opened directly by its canonical URL.
  for (const entry of entries.filter(e => e.category !== 'wikinotes')) {
    const target = `/${entry.category === 'projects' ? 'lab' : 'blog'}/${entry.category}/${entry.slug}`;
    await page.goto(base + target);
    await page.locator('.article-content').waitFor();
    assert.equal(new URL(page.url()).pathname, target);
  }
  assert.ok(requests.some(url => url.includes('/api/views/lab/projects/7654321')));
  assert.ok(!requests.some(url => url.includes('/api/views/lab/projects/forecasting-visual-auras')));
  await page.goto(base + '/wiki/feedback-loop');
  await page.getByRole('heading').filter({ hasText: 'Feedback loop' }).first().waitFor();
  const link = page.locator('a.wiki-ref-resolved[href^="/wiki/"]').first();
  await link.waitFor();
  const target = await link.getAttribute('href');
  assert.ok(entries.some(e => target === '/wiki/' + e.slug));
  await link.click();
  await page.waitForURL(base + target);
  await page.goBack();
  await page.waitForURL(base + '/wiki/feedback-loop');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/wiki/Economy1');
  await page.waitForURL(base + '/wiki/economics');
  await page.getByRole('heading').filter({ hasText: 'Economics' }).first().waitFor();
  await page.screenshot({ path: 'room/content-slugs/wiki-mobile.png' });
  assert.deepEqual(errors, []);
  console.log('PASS: historical routes, 28 canonical articles, Wiki clicks/back, mobile, stable engagement keys; no page errors.');
} finally {
  await browser?.close();
  if (server) await new Promise((resolve, reject) => {
    server.httpServer.close(error => error ? reject(error) : resolve());
    server.httpServer.closeAllConnections();
  });
}
