# 🪙 Altın Bilezik Fiyat Takip

> 📝 **Not:** Bu repo şu an `hairharmony` adıyla duruyor (eski isim). İleride
> **`gram-takip`** olarak yeniden adlandırılacak. Yeniden adlandırınca yerel remote'u
> güncelle: `git remote set-url origin https://github.com/mcetin66/gram-takip.git`

Belirtilen pazaryerlerindeki **22 ayar işçiliksiz altın bilezikleri** listeleyen ve
**gram başına fiyata (TL/gr) göre en ucuzdan** sıralayan, kişiye özel basit bir web sitesi.

Pazaryerleri: İdefix · N11 · Hepsiburada · Pazarama · PttAVM · Trendyol

## Nasıl çalışır?

```
[Veri çekme motoru]  →  data/products.json  →  [GitHub Pages site]
   (anti-bot'u aşar)        (ürün verisi)          (TL/gr sıralı vitrin)
```

- **Site (vitrin):** `index.html` + `app.js` + `style.css`. Build gerektirmez, saf HTML/JS.
  `data/products.json` dosyasını okur; TL/gr hesaplar, sıralar, "ilk 10" ve "her gramaj için en ucuz"
  tablolarını ve yönetici özetini üretir.
- **Veri:** `data/products.json`. Şu an **örnek** veri var (site üstünde sarı uyarı görünür).
  Gerçek veriyi çekme motoru doldurur.

### Hesaplama kuralları (kullanıcı kriterleri)
- `TL/gr = (Fiyat + Kargo) / Gramaj` — kargo ücretliyse toplam fiyata dahil edilir.
- Yalnızca herkese açık **liste fiyatları**; kupon / banka kampanyası / sepet indirimi hesaba katılmaz.
- `taksitliTutar > fiyat` ise taksit farkı var → "peşin fiyatına 3 taksit" sayılmaz, **uygun değil** işaretlenir.

## Yayına alma (GitHub Pages)
1. Repo **Settings → Pages → Source: GitHub Actions** seç.
2. `.github/workflows/pages.yml` push'ta otomatik yayınlar.
3. Çıkan adresten siteyi aç (telefondan da girilebilir).

Yerelde denemek için: bu klasörde `python3 -m http.server 8000` çalıştır, `http://localhost:8000` aç.

## Veri modeli (`data/products.json`)
```json
{
  "pazaryeri": "İdefix",
  "satici": "AgaKulche",
  "urunAdi": "AgaKulche 3'lü Burma 25 gr 22 Ayar Altın Bilezik",
  "gramaj": 25,
  "fiyat": 110395.77,
  "ucTaksit": true,
  "taksitliTutar": 110395.77,
  "kargo": 0,
  "teslimat": "2-4 iş günü",
  "link": "https://www.idefix.com/...",
  "tarih": "2026-06-19T00:00:00+03:00"
}
```

## Veri çekme motoru (Playwright — VPS'te çalışır)

Pazaryerleri basit isteklerde 403 döner; **Playwright gerçek tarayıcı** açtığı için çoğunu aşar.

### VPS kurulumu
```bash
git clone <repo> && cd hairharmony
npm install
npx playwright install --with-deps chromium

# Önce TEK siteyle test et (en kolayı idefix):
npm run fetch:one idefix

# Sorunsuzsa tümünü çek:
npm run fetch
```
`data/products.json` gerçek veriyle güncellenir. Bir site kart bulamazsa
`data/debug/<site>.{html,png}` üretilir → ona bakıp `scripts/sites.mjs` içindeki
selector'ları düzeltiriz.

### Siteyi VPS'te yayınlama
```bash
npm run serve            # http://SUNUCU_IP:8080
# veya nginx ile statik klasörü servis et
```

### Otomatik güncelleme (cron)
```bash
# her sabah 08:00'de çek
0 8 * * * cd /opt/hairharmony && /usr/bin/npm run fetch >> fetch.log 2>&1
```

### Notlar
- **idefix / pazarama / pttavm / n11** → Playwright ile genelde sorunsuz.
- **Trendyol / Hepsiburada** → en katı korumalı; takılırsa stealth ayarı veya residential proxy eklenir.
- Liste sayfasından **fiyat/gram/satıcı/link** alınır. **Taksit/kargo/teslimat** ürün
  sayfası doğrulaması gerektirir — sonraki adımda eklenecek (`ucTaksit` vb. şimdilik `null`/N/A).
