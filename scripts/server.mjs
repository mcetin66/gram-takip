import http from 'http';
import { chromium } from 'playwright';
import { getParser } from './parser/index.mjs';

const PORT = process.env.PORT || 8787;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ---- Browser lifecycle ---------------------------------------------------
// Chromium bir sebeple (crash, OOM, systemd stop vb.) kapanabilir. Her istekte
// canlı olduğundan emin ol; değilse otomatik yeniden başlat. Eşzamanlı istekler
// aynı launch promise'ını paylaşsın diye tek mutex kullan.
let browser = null;
let launching = null;

async function ensureBrowser() {
  if (browser?.isConnected()) return browser;
  if (launching) return launching;
  launching = chromium
    .launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ]
    })
    .then((b) => {
      b.on('disconnected', () => {
        if (browser === b) browser = null;
        console.warn('[browser] disconnected — bir sonraki istekte yeniden başlatılacak');
      });
      browser = b;
      console.log('[browser] launched');
      return b;
    })
    .finally(() => {
      launching = null;
    });
  return launching;
}

// ---- HTTP handlers -------------------------------------------------------
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function handleParse(url, opts = {}) {
  const parser = await getParser(url);
  if (!parser) return { status: 400, body: { error: 'desteklenmeyen site' } };

  // İlk deneme başarısızsa (browser koptuysa) bir kez yeniden dene.
  for (let deneme = 1; deneme <= 2; deneme++) {
    let context;
    try {
      const b = await ensureBrowser();
      context = await b.newContext({
        userAgent: UA,
        locale: 'tr-TR',
        extraHTTPHeaders: { 'Accept-Language': 'tr-TR,tr;q=0.9' }
      });
      const page = await context.newPage();
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });

      console.log(`[parse] ${url} (deneme ${deneme}${opts.debug ? ', debug' : ''})`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const result = await parser.parse(page, opts);

      return {
        status: 200,
        body: {
          url,
          ...result,
          site: parser.site,
          siteLabel: parser.siteLabel,
          simulated: false
        }
      };
    } catch (err) {
      const msg = String(err?.message || err);
      const kopuk = /Target page, context or browser has been closed|Target closed|Browser closed|Connection closed/i.test(msg);
      console.error(`[parse] hata (deneme ${deneme}): ${msg}`);
      if (kopuk && deneme < 2) {
        // Browser'ı unut, sonraki turda yeniden başlatılacak
        try { await browser?.close(); } catch {}
        browser = null;
        continue;
      }
      return {
        status: 502,
        body: { error: 'engellendi veya hata oluştu', detay: msg }
      };
    } finally {
      if (context) { try { await context.close(); } catch {} }
    }
  }
  return { status: 502, body: { error: 'engellendi veya hata oluştu' } };
}

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health' && req.method === 'GET') {
    return sendJson(res, 200, { ok: true, browser: !!browser?.isConnected() });
  }

  if (req.url?.startsWith('/parse') && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { url, debug } = JSON.parse(body || '{}');
      if (!url) return sendJson(res, 400, { error: 'url eksik' });
      const qsDebug = /[?&]debug=1\b/.test(req.url);
      const { status, body: out } = await handleParse(url, { debug: !!debug || qsDebug });
      return sendJson(res, status, out);
    } catch (err) {
      return sendJson(res, 500, { error: 'internal error', detay: String(err?.message || err) });
    }
  }

  res.writeHead(404);
  res.end();
});

// Başlangıçta browser'ı ısıt (gerekmiyor ama ilk isteği hızlandırır).
ensureBrowser().catch((err) => console.error('İlk browser launch hatası:', err));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function shutdown(sig) {
  console.log(`\n${sig} alındı, kapatılıyor...`);
  try { await browser?.close(); } catch {}
  process.exit(0);
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
