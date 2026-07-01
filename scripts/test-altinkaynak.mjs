import { chromium } from 'playwright';
import { parse } from './parser/altinkaynak.mjs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.altinkaynak.com/canli-kurlar/');
  try {
    const result = await parse(page);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
