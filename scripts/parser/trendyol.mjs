import { parseGramaj, parsePrice } from '../lib.mjs';

/**
 * Trendyol Ürün Sayfası Parser
 * Sözleşme: marka + satıcı ayrı; ikisi de opsiyonel.
 */

export const site = "trendyol";
export const siteLabel = "Trendyol";

export async function parse(page) {
  await page.waitForTimeout(3000);

  const data = await page.evaluate(() => {
    const oku = (selectors) => {
      for (const s of selectors) {
        const el = document.querySelector(s);
        if (el && el.innerText?.trim()) return el.innerText.trim();
      }
      return null;
    };

    const marka = oku(['.pr-new-br a', '.pr-new-br span', '.brand', '[class*="brand"] a']);
    const urunAdi =
      document.querySelector('.pr-new-br')?.innerText?.trim() ||
      oku(['.product-name', 'h1']);
    const satici = oku(['.merchant-name', '.seller-name-text', '[class*="Merchant"] a']);
    const fiyatText = oku(['.prc-dsc', '.product-price']);

    return { marka, urunAdi, satici, fiyatText };
  });

  return {
    urunAdi: data.urunAdi,
    marka: data.marka,
    satici: data.satici,   // yoksa null
    fiyat: parsePrice(data.fiyatText),
    kargo: null,
    gram: parseGramaj(data.urunAdi || ""),
    ayar: 22
  };
}
