import { parsePrice } from '../lib.mjs';

/**
 * Altınkaynak Canlı Kurlar Parser (REFERANS — ürün değil)
 * 22 Ayar Hurda ALIŞ fiyatını çeker; Dashboard'daki "22k Hurda Alış" ve
 * "Makas Oranı" kartlarını besler. Ürün listesine EKLENMEZ.
 */

export const site = "altinkaynak";
export const siteLabel = "Altınkaynak";

export async function parse(page) {
  await page.waitForSelector('#buyB', { timeout: 15000 }).catch(() => {});

  const data = await page.evaluate(() => {
    const buyB = document.querySelector('#buyB .currencyValue')?.innerText?.trim();
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
