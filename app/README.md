# Altın Ürün Takip Sistemi (Local Web App)

Link yapıştır → sistem ürünü otomatik analiz eder → canlı TL/gram takibi. React + Vite +
TypeScript (strict), LocalStorage, dark theme, mobile-first (iPhone Safari).

## Çalıştırma
```bash
cd app
npm install
npm run dev        # http://localhost:5173 (telefondan: http://BILGISAYAR_IP:5173)
```
Üretim derlemesi: `npm run build` → `dist/` · Önizleme: `npm run preview`

## Özellikler
- **Tek giriş:** Sadece link yapıştırırsın; site/ürün/gram/ayar otomatik çıkar.
- **Canlı izleme:** Açılışta + her 30 sn'de (ayarlanabilir) fiyatlar yenilenir, geri sayım gösterilir, “Şimdi Güncelle” butonu var.
- **TL/gram sıralı:** En ucuz gram fiyatı her zaman en üstte.
- **Parlama:** Fiyat yükselince satır 2 sn kırmızı, düşünce 2 sn yeşil yanar.
- **Kalıcılık:** Ürünler LocalStorage'da; sayfa kapansa da kalır.
- **Aç:** Ürünün satış sayfasını yeni sekmede açar.

## Mimari (modüler, ölçeklenebilir)
```
src/
  parsers/      Her site ayrı dosya (idefix, trendyol, hepsiburada, n11, amazon) + registry
  fetch/        Fetcher arayüzü → MockFetcher (simülasyon) | BackendFetcher (gerçek/VPS)
  hooks/        useProducts, useSettings, useAutoRefresh
  components/   ProductRow (parlama), ProductList, TabBar, Icons
  pages/        Dashboard, Settings
  lib/          calc (TL/gram), format, id
  storage/      LocalStorage sarmalayıcı
```
Yeni site eklemek = `parsers/` altına bir dosya + `registry.ts`'e bir satır (Open/Closed).

## Veri kaynağı: Simülasyon vs Gerçek
Tarayıcıdaki bir SPA, pazaryeri sayfalarını **doğrudan çekemez** (CORS + anti-bot/403).
Bu yüzden veri çekme `Fetcher` arayüzü arkasındadır:

- **Simülasyon (varsayılan):** Linkten site/ürün/gram/ayar'ı **gerçekten** çıkarır; fiyatı
  simüle edip oynatır. Tüm davranışı (güncelleme/parlama/sıralama) test etmek için.
- **Gerçek (VPS):** Ayarlar → “Gerçek (VPS)” seç + backend adresini gir. Backend sözleşmesi:
  `POST {backendUrl}/parse  body:{url}` → `ParsedProduct` (fiyat dahil). Bu uç nokta,
  repodaki `scripts/` Playwright scraper'ı sarmalanarak sağlanır.

## Gelecek altyapısı (hazır)
Fiyat alarmı, bildirim, favoriler, filtre/arama, Excel dışa aktarma, grafik, fiyat geçmişi,
çoklu kategori, sunucu senkronu — tipler ve katmanlar bunları genişletmeye uygun tasarlandı.
