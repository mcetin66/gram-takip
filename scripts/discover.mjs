/**
 * Keşif motoru: pazaryeri kategori sayfalarını gezip 22 ayar bilezikleri toplar,
 * gramaja göre gruplar (5–30 gr, her tam sayı için), her gramda EN UCUZ TL/gr'a
 * sahip ürünü seçer. Sonuçları data/discover.json'a yazar.
 *
 * Kullanım:
 *   node scripts/discover.mjs                 # tüm aktif siteler
 *   node scripts/discover.mjs --only idefix   # tek site
 *   node scripts/discover.mjs --debug         # data/debug/ klasörüne dump
 *
 * Server bunu doğrudan da çağırabilir (runDiscover fonksiyonu).
 */

import { writeFile, mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { DISCOVER_SITES } from "./discover-sites.mjs";
import { parseGramaj, parsePrice, isTargetProduct, inGramRange, nowIso } from "./lib.mjs";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const GRAM_MIN = 5;
const GRAM_MAX = 30;

// ---------- Bir sitede çoklu sayfa tara ----------
async function scrapeSite(browser, cfg, opts) {
  const ctx = await browser.newContext({
    userAgent: UA,
    locale: "tr-TR",
    viewport: { width: 1366, height: 900 },
    extraHTTPHeaders: { "Accept-Language": "tr-TR,tr;q=0.9" },
  });
  await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => undefined }));
  const page = await ctx.newPage();
  const tumUrunler = [];

  for (let p = 1; p <= cfg.maxPages; p++) {
    const url = p === 1 ? cfg.baseUrl : `${cfg.baseUrl}${cfg.baseUrl.includes("?") ? "&" : "?"}${cfg.pageParam}=${p}`;
    try {
      console.log(`  · sayfa ${p}: ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      if (cfg.waitFor) await page.waitForSelector(cfg.waitFor, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1500);

      const kartlar = await page.$$eval(cfg.card, (els, sel) => els.slice(0, 100).map((el) => {
        const pick = (s) => { const n = s ? el.querySelector(s) : null; return n ? n.textContent.trim() : ""; };
        const linkEl = el.querySelector(sel.link) || el.closest("a");
        return {
          title: pick(sel.title) || el.getAttribute("title") || "",
          priceText: pick(sel.price),
          seller: pick(sel.seller),
          href: linkEl ? linkEl.href : "",
        };
      }), { title: cfg.title, price: cfg.price, seller: cfg.seller, link: cfg.link }).catch(() => []);

      if (kartlar.length === 0) {
        if (opts.debug) await dumpDebug(page, `${cfg.label}-p${p}`);
        console.log(`    ! kart yok — sayfa boş veya selector güncel değil`);
        break;
      }

      for (const k of kartlar) {
        if (!k.title || !isTargetProduct(k.title)) continue;
        const gram = parseGramaj(k.title);
        const fiyat = parsePrice(k.priceText);
        if (!inGramRange(gram, GRAM_MIN, GRAM_MAX) || !fiyat) continue;
        tumUrunler.push({
          pazaryeri: cfg.label,
          site: keyForLabel(cfg.label),
          satici: k.seller || null,
          urunAdi: k.title.replace(/\s+/g, " ").trim(),
          gram,
          ayar: 22,
          fiyat,
          kargo: 0,
          link: k.href || cfg.baseUrl,
          tarih: nowIso(),
        });
      }
    } catch (e) {
      console.log(`    ! sayfa ${p} hata: ${e.message}`);
      if (opts.debug) await dumpDebug(page, `${cfg.label}-p${p}-err`);
      break;
    }
  }

  await ctx.close();
  return tumUrunler;
}

function keyForLabel(label) {
  return Object.entries(DISCOVER_SITES).find(([, c]) => c.label === label)?.[0] || "?";
}

async function dumpDebug(page, isim) {
  try {
    await mkdir("data/debug", { recursive: true });
    const safe = isim.replace(/[^\w\-]/g, "_");
    await writeFile(`data/debug/${safe}.html`, await page.content());
    await page.screenshot({ path: `data/debug/${safe}.png` }).catch(() => {});
  } catch {}
}

// ---------- Gramaja göre en ucuzu seç ----------
function bestByGram(urunler) {
  // Her tam gramaj (5..30) için TL/gr en düşük olanı seç.
  const byGram = new Map();
  for (const u of urunler) {
    const key = Math.round(u.gram);
    if (key < GRAM_MIN || key > GRAM_MAX) continue;
    const tlg = (u.fiyat + (u.kargo || 0)) / u.gram;
    const eski = byGram.get(key);
    if (!eski || tlg < eski._tlg) byGram.set(key, { ...u, _tlg: tlg });
  }
  // Boş gramları da rapora koy (kullanıcı boş olanı görsün: "5 gr — bulunamadı")
  const sonuc = [];
  for (let g = GRAM_MIN; g <= GRAM_MAX; g++) {
    const bulunan = byGram.get(g);
    if (bulunan) sonuc.push({ gram: g, urun: bulunan });
    else sonuc.push({ gram: g, urun: null });
  }
  return sonuc;
}

// ---------- Ana giriş: node scripts/discover.mjs ----------
export async function runDiscover({ only = null, debug = false, onProgress = null } = {}) {
  const aktifler = Object.entries(DISCOVER_SITES).filter(([k, c]) => c.aktif && (!only || k === only));
  if (aktifler.length === 0) {
    return { error: only ? `site aktif değil: ${only}` : "hiç aktif site yok" };
  }

  const baslangic = Date.now();
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled", "--disable-dev-shm-usage"],
  });

  const hepsi = [];
  const perSite = {};
  try {
    for (const [key, cfg] of aktifler) {
      console.log(`\n● ${cfg.label} (${key})`);
      onProgress?.({ tip: "site-basladi", site: key });
      const items = await scrapeSite(browser, cfg, { debug });
      perSite[key] = items.length;
      hepsi.push(...items);
      console.log(`  ✓ ${cfg.label}: ${items.length} uygun ürün`);
      onProgress?.({ tip: "site-bitti", site: key, sayi: items.length });
    }
  } finally {
    await browser.close();
  }

  const gramSonuclari = bestByGram(hepsi);
  const rapor = {
    guncellemeTarihi: nowIso(),
    sureMs: Date.now() - baslangic,
    kaynak: "canli",
    perSite,
    toplamUrun: hepsi.length,
    gramSonuclari,
  };

  await mkdir("data", { recursive: true });
  await writeFile("data/discover.json", JSON.stringify(rapor, null, 2) + "\n", "utf8");

  const bulunanGram = gramSonuclari.filter((g) => g.urun).length;
  console.log(`\n✔ Toplam ${hepsi.length} ürün, ${bulunanGram}/${GRAM_MAX - GRAM_MIN + 1} gramda en ucuz belirlendi → data/discover.json`);
  return rapor;
}

// CLI ise: çalıştır
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
  const debug = args.includes("--debug");
  runDiscover({ only, debug }).catch((e) => { console.error(e); process.exit(1); });
}
