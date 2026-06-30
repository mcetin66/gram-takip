# VPS Ajanı — Görev: SPA için `/parse` Backend'i

Bu dosya VPS'te çalışacak ajan (Claude Code vb.) içindir. Bu görevi yap, bitince rapor et.

---

## 🎯 Görev tek cümle
SPA'nın **"Gerçek (VPS)"** modunda çağırdığı `POST /parse` uç noktasını sağlayan,
**Playwright ile pazaryerinden gerçek ürün fiyatı çeken** küçük bir HTTP servisi kur ve VPS'te 7/24 ayakta tut.

## 📦 Bağlam (sen klonlayınca göreceksin)
Repo: `mcetin66/hairharmony` · branch: `claude/new-project-setup-1n4m7h`
```
app/                    → React+Vite SPA (KULLANICI ARAYÜZÜ — DOKUNMA, sadece tüketici)
scripts/
  fetch.mjs             → Mevcut Playwright scraper (liste sayfası gezer)
  sites.mjs             → 6 pazaryeri tanımı + selector'lar
  lib.mjs               → gramaj/fiyat parse, dedupe (TEKRAR KULLAN, KOPYALAMA)
  serve.mjs             → küçük statik sunucu (eski vitrin)
data/products.json      → eski statik vitrin verisi (bu görevde KULLANILMIYOR)
legacy-static/          → eski statik vitrin (bu görevde KULLANILMIYOR)
```
SPA'nın `BackendFetcher` kodu zaten yazılı: `app/src/fetch/BackendFetcher.ts`.
Ona dokunma; sadece **sözleşmeye uyan bir backend** ver.

---

## 📐 API SÖZLEŞMESİ (değiştirilemez — SPA buna bağlı)

### `POST /parse`
İstek:
```json
{ "url": "https://www.idefix.com/rise-gold-...-p-15063439" }
```

Başarılı cevap (HTTP 200):
```json
{
  "url": "https://www.idefix.com/...",
  "site": "idefix",
  "siteLabel": "İdefix",
  "satici": "Rise Gold",
  "urunAdi": "Rise Gold Riselimited 15 gram 22 Ayar Oluklu Ajda Bilezik İşçiliksiz",
  "gram": 15,
  "ayar": 22,
  "fiyat": 66237.50,
  "kargo": 0,
  "simulated": false
}
```
- `fiyat` ZORUNLU, sayı (TL). **Liste fiyatı**; kupon/sepet/banka indirimi YOK.
- `kargo` belirleyemezsen `null` döndür (varsayım yapma).
- Belirleyemediğin diğer alanlar `null` olabilir; SPA URL'den çıkarılanlarla tamamlar.
- `simulated: false` (gerçek veri).

### `GET /health` → `{ "ok": true }`
### CORS → AÇIK olmalı
SPA tarayıcıdan çağıracak. Yanıt başlıklarında:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
`OPTIONS` preflight'a 204 dön.

### Hata durumları (hep JSON döndür)
- 400: `{ "error": "url eksik" }` veya `{ "error": "desteklenmeyen site" }`
- 502: `{ "error": "engellendi", "detay": "..." }` (anti-bot aşılamadı)
- 504: `{ "error": "zaman aşımı" }`

---

## 🔧 Yapılacaklar (sırayla)

### 1. Kurulum
```bash
git clone <REPO_URL> && cd hairharmony
git checkout claude/new-project-setup-1n4m7h
npm install
npx playwright install --with-deps chromium
```

### 2. `scripts/parser/` altına SİTE BAZLI ürün-sayfası parser'ları yaz
**Önce yalnız idefix.** Liste sayfası değil, **tek ürün sayfası** parse eden bir fonksiyon:
```
scripts/parser/idefix.mjs   → export async function parse(page) → { satici, urunAdi, gram, ayar, fiyat, kargo }
scripts/parser/trendyol.mjs
scripts/parser/hepsiburada.mjs
scripts/parser/n11.mjs
scripts/parser/amazon.mjs
scripts/parser/index.mjs    → URL'den hostname'e bakıp doğru parser'ı seç
```
Her parser:
- Playwright `page`'i aldığında ürün adı, satıcı/marka, fiyat, varsa kargoyu döner.
- Gram/ayar'ı başlıktan çıkarmak için `scripts/lib.mjs`'deki `parseGramaj` ve benzeri yardımcıları **TEKRAR KULLAN.**
- Fiyat → `lib.mjs`'deki `parsePrice` (binlik nokta, ondalık virgül).
- Bulamadığın alan `null`.

### 3. `scripts/server.mjs` — HTTP servisi
- Saf Node `http` modülü (yeni bağımlılık YOK).
- Playwright `chromium`'u **tek instance** olarak açılışta launch et (her istekte yeni context aç, kapat).
- Endpoints: `POST /parse`, `GET /health`, `OPTIONS *`.
- Akış: URL'i al → hostname'e göre parser seç → `browser.newContext()` → `page.goto(url, {waitUntil:'domcontentloaded'})` → `parser.parse(page)` → context kapat → JSON dön.
- User-Agent ve `Accept-Language: tr-TR` ayarla; `navigator.webdriver` gizle (`addInitScript`).
- İstek timeout: 30 sn.
- PORT env değişkeninden okunur, varsayılan **8787**.

### 4. `package.json`'a script ekle
```json
"scripts": {
  "server": "node scripts/server.mjs",
  "fetch": "node scripts/fetch.mjs",
  "fetch:one": "node scripts/fetch.mjs --only"
}
```

### 5. Test (commit'ten önce ÇALIŞTIR ve ÇIKTIYI KAYDET)
```bash
PORT=8787 npm run server &
sleep 3
curl -s http://localhost:8787/health
curl -s -X POST http://localhost:8787/parse \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.idefix.com/rise-gold-riselimited-15-gram-22-ayar-oluklu-ajda-bilezik-isciliksiz-p-15063439"}'
```
**Beklenen:** Yukarıdaki JSON şemasına uyan, **`fiyat` sayı ve makul** (gerçek bir TL değeri) bir cevap.
Çıkmazsa: `data/debug/parse-<host>-<ts>.{html,png}` üret, raporda paylaş.

### 6. Kalıcı yayın (VPS'te 7/24)
**systemd unit** olarak çalıştır:
```ini
# /etc/systemd/system/gram-takip-backend.service
[Unit]
Description=Gram Takip Backend
After=network.target

[Service]
WorkingDirectory=/opt/hairharmony
ExecStart=/usr/bin/node scripts/server.mjs
Environment=PORT=8787
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload && sudo systemctl enable --now gram-takip-backend
```
Public erişim: nginx reverse proxy (varsa HTTPS) veya geçici test için `:8787` portunu firewall'da aç.

### 7. Commit + push
```bash
git add scripts/parser scripts/server.mjs package.json
git commit -m "VPS backend: POST /parse — Playwright ile idefix ürün fiyatı"
git push origin claude/new-project-setup-1n4m7h
```

---

## ⛔ Yapma
- SPA dosyalarına (`app/**`) dokunma.
- Selector'ları KÖRLEMESINE yazma — gerçekten test et.
- Anti-bot'a takılırsan **kafana göre proxy/ScrapingBee satın alma** → rapor et, sor.
- `lib.mjs`'deki helper'ları kopyalama, **import et**.
- Liste sayfasını parse etme (bu görevde değil) — bu uç nokta **tek ürün**.

---

## ✅ "Bitti" kriteri
1. `curl /health` → 200, `{ok:true}`
2. `curl /parse` (idefix linkiyle) → `fiyat` sayısal ve makul, JSON şemaya uygun
3. Servis systemd ile otomatik başlıyor, `systemctl status` aktif
4. Aynı sözleşmeyle Trendyol/Hepsiburada/n11/Amazon TR de cevap veriyor (en azından idefix MUTLAKA)
5. Branch'e commit + push yapıldı

## 📣 Rapor
Şunları yaz:
- Yayın adresi (örn. `http://VPS_IP:8787`)
- Hangi siteler için ÇALIŞTI, hangi siteler engellendi (sebep)
- idefix `curl /parse` örnek çıktısı (gerçek JSON)
- Takıldığın yer varsa: ne denedin, ne SORACAKSIN

## 📞 SPA'yı bağla (kullanıcı için, sen bilgilendir)
Kullanıcı SPA'da: **Ayarlar → Veri Kaynağı → "Gerçek (VPS)"** seçer ve
**VPS Backend adresi**'ne `http://VPS_IP:8787` (veya HTTPS adresin) yazar. Hepsi bu.
