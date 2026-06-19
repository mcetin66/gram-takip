// Ana scraper: Playwright ile pazaryeri liste sayfalarını gerçek tarayıcıda gezer,
// 22 ayar işçiliksiz bilezikleri ayıklar, TL/gr için gerekli veriyi data/products.json'a yazar.
//
// Kullanım (VPS'te):
//   npm install
//   npx playwright install chromium
//   npm run fetch                 # tüm siteler
//   npm run fetch:one idefix      # tek site (önce bununla test et)
//
// Bulamazsa data/debug/<site>.{html,png} üretir; ona göre scripts/sites.mjs selector'larını güncelleriz.

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { SITES } from "./sites.mjs";
import { parseGramaj, parsePrice, isTargetProduct, dedupe, inGramRange, nowIso } from "./lib.mjs";

const args = process.argv.slice(2);
const onlyIdx = args.indexOf("--only");
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : (args.find(a => !a.startsWith("--")) || null);

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function scrapeSite(browser, name, cfg) {
  const ctx = await browser.newContext({
    userAgent: UA,
    locale: "tr-TR",
    viewport: { width: 1366, height: 900 },
    extraHTTPHeaders: { "Accept-Language": "tr-TR,tr;q=0.9" },
  });
  // Basit stealth: webdriver bayrağını gizle
  await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => undefined }));
  const page = await ctx.newPage();
  const out = [];

  for (const url of cfg.urls) {
    try {
      console.log(`  → ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      if (cfg.waitFor) {
        await page.waitForSelector(cfg.waitFor, { timeout: 15000 }).catch(() => {});
      }
      await page.waitForTimeout(1500); // lazy-load için

      const cards = await page.$$eval(
        cfg.card,
        (els, sel) => els.slice(0, 60).map(el => {
          const pick = s => { const n = s ? el.querySelector(s) : null; return n ? n.textContent.trim() : ""; };
          const linkEl = el.querySelector(sel.link) || el.closest("a");
          return {
            title: pick(sel.title) || (el.getAttribute("title") || ""),
            priceText: pick(sel.price),
            seller: pick(sel.seller),
            href: linkEl ? linkEl.href : "",
          };
        }),
        { title: cfg.title, price: cfg.price, seller: cfg.seller, link: cfg.link }
      ).catch(() => []);

      if (!cards.length) {
        await dumpDebug(page, name);
        console.log(`  ⚠️  ${name}: kart bulunamadı (debug dosyası yazıldı). Selector güncellemesi gerekebilir.`);
      }

      for (const c of cards) {
        if (!c.title || !isTargetProduct(c.title)) continue;
        const gramaj = parseGramaj(c.title);
        const fiyat = parsePrice(c.priceText);
        if (!inGramRange(gramaj) || !fiyat) continue;
        out.push({
          pazaryeri: cfg.label,
          satici: c.seller || cfg.label,
          urunAdi: c.title.replace(/\s+/g, " ").trim(),
          gramaj,
          fiyat,
          ucTaksit: null,          // ürün sayfasından doğrulanmalı (sonraki adım)
          taksitliTutar: null,
          kargo: null,             // N/A → site detayından alınabilir
          teslimat: null,
          link: c.href || cfg.urls[0],
          tarih: nowIso(),
        });
      }
    } catch (e) {
      console.log(`  ✖ ${name} ${url}: ${e.message}`);
      await dumpDebug(page, name);
    }
  }

  await ctx.close();
  return out;
}

async function dumpDebug(page, name) {
  try {
    await mkdir("data/debug", { recursive: true });
    await writeFile(`data/debug/${name}.html`, await page.content());
    await page.screenshot({ path: `data/debug/${name}.png`, fullPage: false }).catch(() => {});
  } catch {}
}

async function main() {
  const entries = Object.entries(SITES).filter(([n]) => !only || n === only);
  if (!entries.length) {
    console.error(`Bilinmeyen site: ${only}. Geçerli: ${Object.keys(SITES).join(", ")}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  let all = [];
  for (const [name, cfg] of entries) {
    console.log(`\n● ${cfg.label} (${name})`);
    const items = await scrapeSite(browser, name, cfg);
    console.log(`  ✓ ${items.length} uygun ürün`);
    all = all.concat(items);
  }
  await browser.close();

  all = dedupe(all).sort((a, b) => (a.fiyat / a.gramaj) - (b.fiyat / b.gramaj));

  const payload = {
    meta: {
      guncellemeTarihi: nowIso(),
      kaynak: all.length ? "canli" : "ornek",
      not: all.length
        ? "Playwright ile pazaryeri liste sayfalarindan cekildi. Taksit/kargo/teslimat icin urun sayfasi dogrulamasi sonraki adimda."
        : "Hicbir urun cekilemedi; site selector'lari guncellenmeli (data/debug klasorune bak).",
    },
    urunler: all,
  };

  await mkdir("data", { recursive: true });
  await writeFile("data/products.json", JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`\n✔ Toplam ${all.length} ürün → data/products.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
