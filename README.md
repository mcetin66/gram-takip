# 🪙 Altın Bilezik Fiyat Takip

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

## Veri çekme motoru (sonraki adım)
Pazaryerleri veri merkezi IP'lerinden gelen otomatik istekleri engeller (403). Gerçek veriyi
toplamak için seçenekler: profesyonel scraping API (ScrapingBee/ScraperAPI), gerçek tarayıcı +
residential IP (Playwright), veya pazaryeri resmi affiliate API'leri. Seçilen yöntem
`scripts/` altına eklenip `data/products.json`'u günceller.
