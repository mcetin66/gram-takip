/**
 * Keşif motoru için pazaryeri kategori konfigürasyonu.
 * Her giriş: kategori sayfası + ürün kartı selector'ları + pagination.
 *
 * İlk sürüm: sadece İDEFIX gerçek. Diğerleri iskelet — VPS'te selector'ları
 * ayarlayıp aktif etmek gerek (data/debug/<site>.html + .png üretilir).
 */
export const DISCOVER_SITES = {
  idefix: {
    label: "İdefix",
    baseUrl: "https://www.idefix.com/22-ayar-altin-bilezik-c-450376563",
    pageParam: "pi",              // idefix: ?pi=2 → sayfa 2
    maxPages: 10,                  // ilk 10 sayfa (~400 ürün) yeterli
    waitFor: ".productItem, .product-item, [class*='ProductCard'], [class*='productItem']",
    card: ".productItem, .product-item, [class*='ProductCard'], [class*='productItem']",
    title: ".productName, .product-name, a[title], h3",
    price: ".currentPrice, .product-price, .price, [class*='price']",
    seller: ".publisher, .brand, [class*='Brand']",
    link: "a",
    aktif: true,
  },

  pazarama: {
    label: "Pazarama",
    baseUrl: "https://www.pazarama.com/arama?q=22%20ayar%20isciliksiz%20bilezik",
    pageParam: "page",
    maxPages: 8,
    waitFor: "[class*='product-card'], [class*='ProductCard']",
    card: "[class*='product-card'], [class*='ProductCard']",
    title: "[class*='name'], [class*='title'], h3",
    price: "[class*='price']",
    seller: "[class*='seller'], [class*='merchant']",
    link: "a",
    aktif: false,  // önce debug ekran görüntüsü ile selector'lar sabitlensin
  },

  pttavm: {
    label: "PttAVM",
    baseUrl: "https://www.pttavm.com/arama?q=22+ayar+isciliksiz+bilezik",
    pageParam: "page",
    maxPages: 8,
    waitFor: "[class*='product-card'], [class*='ProductCard'], [class*='product']",
    card: "[class*='product-card'], [class*='ProductCard'], [class*='product']",
    title: "[class*='name'], [class*='title'], h3",
    price: "[class*='price'], [class*='Price']",
    seller: "[class*='seller'], [class*='merchant']",
    link: "a",
    aktif: false,
  },

  hepsiburada: {
    label: "Hepsiburada",
    baseUrl: "https://www.hepsiburada.com/ara?q=22+ayar+isciliksiz+bilezik",
    pageParam: "sayfa",
    maxPages: 8,
    waitFor: "[class*='productCard'], li[class*='product']",
    card: "[class*='productCard'], li[class*='product']",
    title: "[class*='title'], h3",
    price: "[class*='price']",
    seller: "[class*='merchant'], [class*='seller']",
    link: "a",
    aktif: false,  // katı anti-bot; ilk denemede muhtemelen boş dönecek
  },

  n11: {
    label: "N11",
    baseUrl: "https://www.n11.com/arama?q=22+ayar+isciliksiz+bilezik",
    pageParam: "pg",
    maxPages: 8,
    waitFor: ".columnContent .pro, li.column .pro, [class*='product']",
    card: ".columnContent .pro, li.column .pro, [class*='product']",
    title: ".productName, h3",
    price: ".newPrice, [class*='price']",
    seller: ".sellerNickName, [class*='seller']",
    link: "a",
    aktif: false,
  },
};
