import { parsePrice } from '../lib.mjs';

/**
 * Altınkaynak Canlı Kurlar Parser (REFERANS — ürün değil)
 * 22 Ayar Hurda ALIŞ fiyatını çeker. Dashboard'daki "22k Hurda Alış" ve
 * "Makas Oranı" kartlarını besler. Ürün listesine EKLENMEZ.
 */

export const site = "altinkaynak";
export const siteLabel = "Altınkaynak";

export async function parse(page) {
  // #buyB DOM'da hemen olabilir ama içi JS ile geç dolar; içerik gelene kadar bekle.
  await page
    .waitForFunction(() => {
      const el = document.querySelector('#buyB .currencyValue');
      return el && el.innerText && el.innerText.trim().length > 0;
    }, { timeout: 20000 })
    .catch(() => {});

  const data = await page.evaluate(() => {
    const oku = (sel) => document.querySelector(sel)?.innerText?.trim() || null;

    // Öncelikli: id="buyB" (Altınkaynak'ın 22 Ayar Hurda alış hücresi)
    let buyB = oku('#buyB .currencyValue') || oku('#buyB');

    // Fallback: "22 Ayar Hurda" içeren satırın ALIŞ hücresi
    if (!buyB) {
      const rows = Array.from(document.querySelectorAll('tr, .row, li'));
      const hedef = rows.find((r) => /22\s*ayar\s*hurda/i.test(r.innerText || ''));
      if (hedef) {
        const alis = hedef.querySelector('.buy, [class*="Buy"], td:nth-child(2)');
        buyB = alis?.innerText?.trim() || null;
      }
    }

    return { buyB };
  });

  return {
    urunAdi: "22 Ayar Hurda Altın (Alış)",
    satici: siteLabel,
    fiyat: parsePrice(data.buyB),
    kargo: null,
    gram: 1,
    ayar: 22
  };
}
