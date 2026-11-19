import { parseGramaj, parsePrice } from '../lib.mjs';

/**
 * Akakçe Ürün Sayfası Parser
 * Akakçe pazaryerlerini taradığı için VPS IP'sinden erişilebilir.
 * Sözleşme: marka + satıcı ayrı; ikisi de opsiyonel.
 */

export const site = 'akakce';
export const siteLabel = 'Akakçe';

export async function parse(page) {
  await page.waitForTimeout(1200);

  const data = await page.evaluate(() => {
    const metin = (sel) => {
      const el = document.querySelector(sel);
      return el && el.innerText?.trim() ? el.innerText.trim() : null;
    };
    const urunAdi = metin('h1') || document.title;
    // "6.053,24 TL/gr" ya da "60.532,38 TL"
    const govde = document.body.innerText || '';
    const tlgr = (govde.match(/([\d.]+,\d{2})\s*TL\/gr/) || [])[1] || null;
    const fiyat = (govde.match(/([\d.]+,\d{2})\s*TL(?!\/gr)/) || [])[1] || null;
    const magaza = metin('.spt_v8, .p_s_v8, [class*="seller"]');
    return { urunAdi, tlgr, fiyat, magaza };
  });

  const gram = parseGramaj(data.urunAdi || '');
  const fiyat = parsePrice(data.fiyat || '');

  return {
    urunAdi: data.urunAdi,
    marka: null,
    satici: data.magaza,
    fiyat,
    kargo: null,
    gram,
    ayar: 22
  };
}
