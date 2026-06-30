import type { Ayarlar } from "./types";

// Varsayılan ayarlar. Kullanıcı, Ayarlar sayfasından değiştirebilir (LocalStorage).
export const VARSAYILAN_AYARLAR: Ayarlar = {
  kaynak: "mock", // Backend (VPS scraper) hazır olunca "backend" yap.
  backendUrl: "http://localhost:8787",
  otomatikGuncellemeSn: 30,
};

export const STORAGE_KEYS = {
  urunler: "altin-takip:urunler:v1",
  ayarlar: "altin-takip:ayarlar:v1",
} as const;
