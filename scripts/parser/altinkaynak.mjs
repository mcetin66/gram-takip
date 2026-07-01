import { parseGramaj, parsePrice } from '../lib.mjs';

/**
 * Altınkaynak Canlı Kurlar Parser
 * 22 Ayar Hurda Alış Fiyatını çeker.
 */
export async function parse(page) {
  // Sayfanın yüklenmesini bekle
  await page.waitForSelector('#buyB', { timeout: 15000 }).catch(() => {});
  
  const data = await page.evaluate(() => {
    // "22 Ayar Hurda" satırındaki Alış fiyatı (id="buyB")
    const buyB = document.querySelector('#buyB .currencyValue')?.innerText?.trim();
    return { buyB };
  });

  const fiyat = parsePrice(data.buyB);

  return {
    urunAdi: "22 Ayar Hurda Altın (Alış)",
    satici: "Altınkaynak",
    fiyat: fiyat,
    gram: 1,
    ayar: 22,
    site: "altinkaynak",
    siteLabel: "altinkaynak.com"
  };
}
