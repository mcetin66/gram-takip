// Uygulama genelinde paylaşılan temel tipler.

/** Bir parser'ın bir URL'den çıkardığı ham ürün bilgisi. */
export interface ParsedProduct {
  url: string;
  site: string; // makine adı: 'idefix', 'trendyol'...
  siteLabel: string; // görünen ad: 'İdefix'
  satici: string;
  urunAdi: string;
  gram: number;
  ayar: number;
  fiyat: number; // TL
  kargo: number | null;
  /** Fiyat gerçek mi yoksa simüle mi (Mock kaynak). */
  simulated: boolean;
}

/** LocalStorage'da saklanan ve listede izlenen ürün. */
export interface Product extends ParsedProduct {
  id: string;
  prevFiyat: number | null;
  sonGuncelleme: string; // ISO tarih
  eklenmeTarihi: string; // ISO tarih
}

export type VeriKaynagi = "mock" | "backend";

export interface Ayarlar {
  kaynak: VeriKaynagi;
  backendUrl: string;
  otomatikGuncellemeSn: number;
}
