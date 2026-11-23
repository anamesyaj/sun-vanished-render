// GitHub Actions shard renderer for the Sun-vanished portrait explainer.
// Usage: node render-farm.js <startFrame> <endFrame>
// Renders frames [start, end) of index.html (1080x1920, 30fps) via window.seek(t)
// into frames/fNNNN.jpg (JPEG quality 88). Adapted from the local render.js:
// normal `require('playwright')` instead of an absolute local path, and a
// relative file:// URL to index.html in the repo root.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const start = parseInt(process.argv[2] || '0', 10);
  const end = parseInt(process.argv[3] || '1200', 10);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    console.error(`Bad frame range: ${process.argv[2]}..${process.argv[3]}`);
    process.exit(1);
  }
  const htmlUrl = 'file://' + path.join(__dirname, 'index.html');
  const browser = await chromium.launch({
    args: ['--disable-dev-shm-usage', '--disable-gpu-sandbox', '--allow-file-access-from-files', '--use-angle=swiftshader'],
  });
  let page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto(htmlUrl);
  await page.waitForTimeout(600);
  fs.mkdirSync('frames', { recursive: true });
  for (let i = start; i < end; i++) {
    if (i > start && (i - start) % 240 === 0) {
      await page.close();
      page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
      await page.goto(htmlUrl);
      await page.waitForTimeout(400);
    }
    await page.evaluate((t) => window.seek(t), i / 30);
    await page.screenshot({ path: `frames/f${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 88 });
    if (i % 60 === 0) console.log('frame', i);
  }
  await browser.close();
  console.log(`DONE frames ${start}-${end - 1}`);
})().catch((e) => { console.error(e); process.exit(1); });
