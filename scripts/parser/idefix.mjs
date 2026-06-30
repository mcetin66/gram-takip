import { parseGramaj, parsePrice } from '../lib.mjs';

/**
 * Idefix Ürün Sayfası Parser
 * Örnek: https://www.idefix.com/rise-gold-riselimited-15-gram-22-ayar-oluklu-ajda-bilezik-isciliksiz-p-15063439
 */
export async function parse(page) {
  // Sayfanın yüklenmesini bekle
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

    const satici = getBySelectors([
      '.merchant-name a',
      '.merchant-name',
      '.seller-name',
      '.product-seller'
    ]) || "İdefix";
    
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

    return { urunAdi, satici, fiyatText };
  });

  return {
    urunAdi: data.urunAdi,
    satici: data.satici,
    fiyat: parsePrice(data.fiyatText),
    kargo: null,
    gram: parseGramaj(data.urunAdi || ""),
    ayar: 22
  };
}
