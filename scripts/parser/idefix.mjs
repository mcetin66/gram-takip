import { parseGramaj, parsePrice } from '../lib.mjs';

/**
 * İdefix Ürün Sayfası Parser
 * Sözleşme:
 *   marka   = üretici (ürün adı başında ya da HTML brand alanında)
 *   satici  = pazaryerindeki mağaza (yoksa null — marka'ya DÜŞMEZ)
 *
 * debug=true iken response'a `_debug` alanı eklenir (selector arama izleri).
 */

export const site = "idefix";
export const siteLabel = "İdefix";

/**
 * Ürün adının başındaki markayı çıkar.
 * "Rise Gold RİSELİMİTED 15 GRAM ..." → "Rise Gold"
 * "Milenyum 10 gr 22 Ayar ..."         → "Milenyum"
 */
function extractMarka(urunAdi) {
  if (!urunAdi) return null;
  const marka = [];
  for (const k of urunAdi.trim().split(/\s+/)) {
    if (marka.length >= 3) break;
    if (/\d/.test(k)) break;
    const upper = k.toLocaleUpperCase("tr");
    if (k.length >= 2 && k === upper && upper !== upper.toLocaleLowerCase("tr")) break;
    marka.push(k);
  }
  return marka.length ? marka.join(" ") : null;
}

export async function parse(page, opts = {}) {
  const debug = !!opts.debug;
  await page.waitForTimeout(5000);

  const data = await page.evaluate(({ debug }) => {
    const oku = (selectors) => {
      for (const s of selectors) {
        try {
          const el = document.querySelector(s);
          if (el && el.innerText?.trim()) return el.innerText.trim();
        } catch {}
      }
      return null;
    };

    // Label-based arama: "Satıcı:" / "Mağaza:" / "Sold by" gibi bir label'ın
    // yanındaki değeri bul. DOM yapısı değişse de yakalar.
    const findByLabel = (labels) => {
      const kandidatlar = document.querySelectorAll('span, div, label, td, dt, strong, b, p, li, small');
      for (const el of kandidatlar) {
        const t = el.innerText?.trim().toLocaleLowerCase("tr");
        if (!t || t.length > 40) continue; // label kısa olmalı
        if (!labels.some((l) => t === l || t === l + ":" || t.startsWith(l + " "))) continue;

        // Değer: kardeş → çocuk → parent'ın value class'lı çocuğu
        const adaylar = [
          el.nextElementSibling,
          el.parentElement?.querySelector('.value, .val, [class*="alue"]'),
          ...(el.parentElement ? Array.from(el.parentElement.children).filter((c) => c !== el) : []),
        ].filter(Boolean);
        for (const c of adaylar) {
          const v = c.innerText?.trim();
          if (v && v.length > 0 && v.length < 80 && v.toLocaleLowerCase("tr") !== t) return v;
        }
      }
      return null;
    };

    // "Satıcı: X" gibi tek satırdaki metni bul
    const findInlineLabel = (labels) => {
      const text = document.body.innerText || "";
      for (const label of labels) {
        const re = new RegExp(`(?:${label})\\s*[:\\-–]?\\s*([^\\n]{2,60})`, "i");
        const m = text.match(re);
        if (m && m[1]) {
          const val = m[1].trim().replace(/^by\s+/i, "");
          if (val && val.length < 80) return val;
        }
      }
      return null;
    };

    const urunAdi = oku([
      'h1[id="productName"]',
      'h1.product-name',
      '.product-name',
      '.item-title',
      'h1'
    ]);

    const brand = oku([
      '.brand a',
      '.brand',
      '.product-brand',
      '[class*="Brand"] a',
      '[class*="brand"] a'
    ]);

    // Satıcı: DOM selector → label arama → inline metin
    const merchantSelectors = [
      '.merchant-name a', '.merchant-name',
      '.seller-name', '.seller-name-text', '.seller-info',
      '.product-seller', '.product-seller-name',
      '[class*="Merchant"] a', '[class*="merchant"] a',
      '[class*="Seller"] a', '[class*="seller"] a',
      '[data-testid*="seller"]', '[data-testid*="merchant"]'
    ];
    const merchantSelectorHit = oku(merchantSelectors);
    const merchantLabelHit = merchantSelectorHit ? null
      : findByLabel(['satıcı', 'mağaza', 'satan', 'seller', 'merchant', 'sold by']);
    const merchantInlineHit = merchantSelectorHit || merchantLabelHit ? null
      : findInlineLabel(['satıcı', 'mağaza', 'satan', 'sold by']);

    const fiyatText = oku([
      '.product-price-wrapper .price',
      '.price-info .price',
      '#salePrice',
      '.product-price',
      '.current-price',
      '.price',
      '.amount',
      '.total-price'
    ]) || document.body.innerText.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s*TL/)?.[1];

    const result = {
      urunAdi, brand,
      merchantSelectorHit, merchantLabelHit, merchantInlineHit,
      fiyatText
    };

    if (debug) {
      // Debug: sayfadaki tüm "satıcı/mağaza/seller/merchant" içeren kısa metinler
      const izler = [];
      const tumu = document.querySelectorAll('*');
      for (const el of tumu) {
        const t = el.innerText?.trim();
        if (!t || t.length > 120) continue;
        if (/(satıcı|mağaza|satan|seller|merchant|sold by)/i.test(t) && el.children.length <= 3) {
          izler.push({ tag: el.tagName.toLowerCase(), cls: el.className?.slice?.(0, 60) || '', text: t.slice(0, 120) });
          if (izler.length >= 15) break;
        }
      }
      result._debugIzler = izler;
    }
    return result;
  }, { debug });

  const marka = data.brand || extractMarka(data.urunAdi);
  const satici = data.merchantSelectorHit || data.merchantLabelHit || data.merchantInlineHit;

  const out = {
    urunAdi: data.urunAdi,
    marka,
    satici,
    fiyat: parsePrice(data.fiyatText),
    kargo: null,
    gram: parseGramaj(data.urunAdi || ""),
    ayar: 22
  };

  if (debug) {
    out._debug = {
      merchantSelectorHit: data.merchantSelectorHit,
      merchantLabelHit: data.merchantLabelHit,
      merchantInlineHit: data.merchantInlineHit,
      brand: data.brand,
      izler: data._debugIzler || [],
    };
  }
  return out;
}
