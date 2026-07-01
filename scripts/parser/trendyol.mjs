import { parseGramaj, parsePrice } from '../lib.mjs';

/**
 * Trendyol Ürün Sayfası Parser
 */

export const site = "trendyol";
export const siteLabel = "Trendyol";

export async function parse(page) {
  await page.waitForTimeout(3000);

  const data = await page.evaluate(() => {
    const urunAdi = document.querySelector('.pr-new-br span')?.parentElement?.innerText?.trim() ||
                    document.querySelector('.product-name')?.innerText?.trim() || null;
    const satici = document.querySelector('.merchant-name')?.innerText?.trim() ||
                   document.querySelector('.pr-new-br a')?.innerText?.trim() || null;
    const fiyatText = document.querySelector('.prc-dsc')?.innerText?.trim() ||
                      document.querySelector('.product-price')?.innerText?.trim() || null;

    return { urunAdi, satici, fiyatText };
  });

  return {
    urunAdi: data.urunAdi,
    satici: data.satici || siteLabel,
    fiyat: parsePrice(data.fiyatText),
    kargo: null,
    gram: parseGramaj(data.urunAdi || ""),
    ayar: 22
  };
}
