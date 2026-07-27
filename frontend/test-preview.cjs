const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    }
  });
  page.on('pageerror', err => {
    console.log('UNCAUGHT EXCEPTION:', err.toString());
  });
  await page.goto('http://localhost:4173/admin/reports', { waitUntil: 'networkidle0' });
  await browser.close();
  console.log('DONE');
})();
