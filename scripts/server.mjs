import http from 'http';
import { chromium } from 'playwright';
import { getParser } from './parser/index.mjs';

const PORT = process.env.PORT || 8787;

let browser;

async function initBrowser() {
  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });
  console.log('Browser launched');
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.url === '/parse' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { url } = JSON.parse(body);
        if (!url) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'url eksik' }));
          return;
        }

        const parser = await getParser(url);
        if (!parser) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'desteklenmeyen site' }));
          return;
        }

        const context = await browser.newContext({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          locale: 'tr-TR'
        });

        const page = await context.newPage();
        
        // Anti-bot mitigation
        await page.addInitScript(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        console.log(`Parsing URL: ${url}`);
        
        try {
          await page.goto(url, { waitUntil: 'commit', timeout: 30000 });
          const result = await parser.parse(page);
          
          const urlObj = new URL(url);
          const response = {
            url,
            site: urlObj.hostname.replace('www.', '').split('.')[0],
            siteLabel: urlObj.hostname.replace('www.', ''),
            ...result,
            simulated: false
          };

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        } catch (err) {
          console.error(`Error parsing ${url}:`, err);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'engellendi veya hata oluştu', detay: err.message }));
        } finally {
          await context.close();
        }

      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'internal error', detay: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

initBrowser().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

process.on('SIGINT', async () => {
  if (browser) await browser.close();
  process.exit();
});
