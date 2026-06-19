// Pazaryeri tanımları. Her site bir "liste sayfası" verir; motor kartları ayıklar.
// NOT: Bu selector'lar makul ilk tahminlerdir. Siteler arayüzünü değiştirebilir;
// ilk çalıştırmada scraper bulamazsa data/debug/<site>.html + .png üretir, ona bakıp
// aşağıdaki seçicileri güncelleriz. (En kolay: idefix ile başla.)

export const SITES = {
  idefix: {
    label: "İdefix",
    // 22 ayar altın bilezik kategori sayfası (gerçek, doğrulanmış URL):
    urls: [
      "https://www.idefix.com/22-ayar-altin-bilezik-c-450376563",
    ],
    waitFor: ".productItem, .product-item, [class*='ProductCard']",
    card: ".productItem, .product-item, [class*='ProductCard']",
    title: ".productName, .product-name, a[title], h3",
    price: ".currentPrice, .product-price, [class*='price']",
    seller: ".publisher, .brand, [class*='Brand']",
    link: "a",
  },

  trendyol: {
    label: "Trendyol",
    urls: [
      "https://www.trendyol.com/sr?q=22%20ayar%20i%C5%9Fciliksiz%20bilezik",
    ],
    waitFor: ".p-card-wrppr, [class*='p-card']",
    card: ".p-card-wrppr, [class*='p-card']",
    title: ".prdct-desc-cntnr-name, [class*='name']",
    price: ".prc-box-dscntd, .prc-box-sllng, [class*='price']",
    seller: ".prdct-desc-cntnr-ttl, [class*='merchant']",
    link: "a",
    note: "Trendyol katı korumalı — Playwright stealth gerekebilir; takılırsa residential proxy.",
  },

  hepsiburada: {
    label: "Hepsiburada",
    urls: [
      "https://www.hepsiburada.com/ara?q=22+ayar+isciliksiz+bilezik",
    ],
    waitFor: "[class*='productCard'], li[class*='product']",
    card: "[class*='productCard'], li[class*='product']",
    title: "[class*='title'], h3",
    price: "[class*='price']",
    seller: "[class*='merchant'], [class*='seller']",
    link: "a",
    note: "Hepsiburada katı korumalı — Playwright stealth gerekebilir.",
  },

  n11: {
    label: "N11",
    urls: [
      "https://www.n11.com/arama?q=22+ayar+i%C5%9Fciliksiz+bilezik",
    ],
    waitFor: ".columnContent .pro, li.column .pro, [class*='product']",
    card: ".columnContent .pro, li.column .pro, [class*='product']",
    title: ".productName, h3",
    price: ".newPrice, [class*='price']",
    seller: ".sellerNickName, [class*='seller']",
    link: "a",
  },

  pazarama: {
    label: "Pazarama",
    urls: [
      "https://www.pazarama.com/arama?q=22%20ayar%20i%C5%9Fciliksiz%20bilezik",
    ],
    waitFor: "[class*='product-card'], [class*='ProductCard']",
    card: "[class*='product-card'], [class*='ProductCard']",
    title: "[class*='name'], [class*='title'], h3",
    price: "[class*='price']",
    seller: "[class*='seller'], [class*='merchant']",
    link: "a",
  },

  pttavm: {
    label: "PttAVM",
    urls: [
      "https://www.pttavm.com/arama?q=22+ayar+i%C5%9Fciliksiz+bilezik",
    ],
    waitFor: "[class*='product'], [class*='Product']",
    card: "[class*='product-card'], [class*='ProductCard'], [class*='product']",
    title: "[class*='name'], [class*='title'], h3",
    price: "[class*='price'], [class*='Price']",
    seller: "[class*='seller'], [class*='merchant']",
    link: "a",
  },
};
