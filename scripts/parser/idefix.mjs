import { parseGramaj, parsePrice } from '../lib.mjs';

/**
 * İdefix Ürün Sayfası Parser
 * Örnek: https://www.idefix.com/rise-gold-riselimited-15-gram-22-ayar-oluklu-ajda-bilezik-isciliksiz-p-15063439
 */

// Sözleşme: her parser kendi site kimliğini bildirir.
export const site = "idefix";
export const siteLabel = "İdefix";

/**
 * Ürün adının başındaki markayı çıkar.
 * "Rise Gold RİSELİMİTED 15 GRAM ..." → "Rise Gold"
 * "AgaKulche 3'lü Burma ..." → "AgaKulche"
 * (Rakam veya tümü BÜYÜK harfli kelimede durur — sonrası model/gram/ayar.)
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

export async function parse(page) {
  await page.waitForTimeout(5000);

  const data = await page.evaluate(() => {
    const getBySelectors = (selectors) => {
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.innerText.trim()) return el.innerText.trim();
      }
      return null;
    };

    const urunAdi = getBySelectors([
      'h1[id="productName"]',
      'h1.product-name',
      '.product-name',
      '.item-title',
      'h1'
    ]);

    const saticiHtml = getBySelectors([
      '.merchant-name a',
      '.merchant-name',
      '.seller-name',
      '.product-seller'
    ]);

    const fiyatText = getBySelectors([
      '.product-price-wrapper .price',
      '.price-info .price',
      '#salePrice',
      '.product-price',
      '.current-price',
      '.price',
      '.amount',
      '.total-price'
    ]) || document.body.innerText.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s*TL/)?.[1];

    return { urunAdi, saticiHtml, fiyatText };
  });

  const marka = extractMarka(data.urunAdi);

  return {
    urunAdi: data.urunAdi,
    // Öncelik: sayfada yazan satıcı → ürün adından çıkarılan marka → site adı
    satici: data.saticiHtml || marka || siteLabel,
    fiyat: parsePrice(data.fiyatText),
    kargo: null,
    gram: parseGramaj(data.urunAdi || ""),
    ayar: 22
  };
}
