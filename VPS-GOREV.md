# VPS Ajanı — Görev Brifingi

Bu dosya, VPS üzerinde çalışacak ajan (veya kişi) içindir. Amacımızı, yapılacakları ve
"bitti" sayılma kriterlerini net tanımlar.

## 🎯 Ne istiyoruz (amaç)

Türkiye pazaryerlerindeki **22 ayar işçiliksiz altın bilezikleri** otomatik toplayıp,
**gram başına fiyata (TL/gr) göre en ucuzdan** sıralayan **kişiye özel (private)** bir web
sitesini bu VPS'te canlı tutmak.

- Pazaryerleri: **İdefix · N11 · Hepsiburada · Pazarama · PttAVM · Trendyol**
- Site kodu (vitrin) ve scraper bu repoda HAZIR. Görev: **scraper'ı her site için gerçekten
  çalışır hale getirmek**, veriyi `data/products.json`'a akıtmak ve siteyi **VPS'te yayınlamak.**

## 📐 Kurallar (uyulması zorunlu)

- `TL/gr = (Fiyat + Kargo) / Gramaj` — kargo ücretliyse toplam fiyata dahil.
- Yalnızca herkese açık **liste fiyatı**; kupon/banka kampanyası/sepet indirimi YOK.
- `taksitliTutar > fiyat` ise → "peşin fiyatına 3 taksit" değildir, **uygun değil** işaretle.
- **Varsayım yapma. Ulaşılamayan veriyi tahmin etme.** Çekemediğin alanı `null`/N/A bırak.
- Gram aralığı: **5–30 gr**. Sadece 22 ayar bilezik; diğerlerini ele.

## 🔧 Yapılacaklar (sırayla)

### 1. Kurulum
```bash
git clone <REPO_URL> && cd hairharmony       # repo: mcetin66/hairharmony
git checkout claude/new-project-setup-1n4m7h # geliştirme branch'i
npm install
npx playwright install --with-deps chromium
```

### 2. Scraper'ı site site çalıştır (önce idefix)
```bash
npm run fetch:one idefix
```
- **"✓ N uygun ürün"** → çalışıyor, sıradaki siteye geç.
- **"⚠️ kart bulunamadı"** → `data/debug/idefix.html` ve `idefix.png` üretildi.
  Bu dosyalara bak, gerçek ürün kartının CSS seçicisini bul ve
  `scripts/sites.mjs` içindeki ilgili site bloğunda `card/title/price/seller/link`
  alanlarını **gerçek seçicilerle güncelle**. Tekrar çalıştır. Çalışana kadar tekrarla.

Sonra diğerleri:
```bash
npm run fetch:one pazarama
npm run fetch:one pttavm
npm run fetch:one n11
npm run fetch:one hepsiburada   # katı korumalı
npm run fetch:one trendyol      # katı korumalı
```
> **Trendyol/Hepsiburada** veri merkezi IP'sinde 403/challenge verebilir. Sırayla dene:
> (a) `headless: false` veya yavaş insan-benzeri gezinme, (b) playwright-extra + stealth
> eklentisi, (c) son çare residential proxy. Hangisinin gerektiğini RAPORLA, kendi başına
> proxy satın alma.

### 3. Hepsini birden çek
```bash
npm run fetch
```
`data/products.json` → `meta.kaynak: "canli"` olmalı ve gerçek ürünler dolmalı.

### 4. Siteyi VPS'te yayınla (private kalsın — sadece bu VPS sunsun)
Hızlı yol:
```bash
npm run serve        # http://0.0.0.0:8080
```
Kalıcı yol (önerilir): **nginx** ile repo klasörünü statik servis et + (varsa) alan adı/HTTPS.
Yayını sadece sahibinin görmesi için **HTTP Basic Auth** veya IP kısıtı ekle (private istiyoruz).

### 5. Otomatik güncelleme (cron)
```bash
0 8 * * * cd /opt/hairharmony && /usr/bin/npm run fetch >> /opt/hairharmony/fetch.log 2>&1
```

## ✅ "Bitti" kriteri
- En az **idefix** dahil 3+ pazaryerinden gerçek ürünler `data/products.json`'da.
- Site VPS'te açılıyor ve ürünler **TL/gr artan** sıralı görünüyor.
- Değişiklikler commit + push edildi (branch: `claude/new-project-setup-1n4m7h`).

## 📣 Geri bildirim (rapor et)
Şunları bildir: her site için "çalıştı / selector güncellendi / engellendi (sebep)",
toplam çekilen ürün sayısı, yayın adresi, ve takıldığın yerler. Proxy/ücretli servis
gerekiyorsa önce SOR.

## ⚠️ Bilinen kısıtlar
- VPS = veri merkezi IP'si; Playwright çoğu siteyi aşar ama büyük olanlar zorlayabilir.
- Liste sayfasından fiyat/gram/satıcı/link gelir. **Taksit/kargo/teslimat** ürün sayfası
  doğrulaması ister → ikinci aşama (ana akış oturduktan sonra).
