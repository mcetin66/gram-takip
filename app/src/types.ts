// Uygulama genelinde paylaşılan temel tipler.

/** Bir parser'ın bir URL'den çıkardığı ham ürün bilgisi. */
export interface ParsedProduct {
  url: string;
  site: string; // makine adı: 'idefix', 'trendyol'...
  siteLabel: string; // görünen ad: 'İdefix'
  marka: string | null; // üretici (Rise Gold, AgaKulche...); yoksa null
  satici: string | null; // pazaryerindeki mağaza; marka ile aynı olabilir; yoksa null
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

/** Keşif motorunun her gramaj için bulduğu en ucuz aday. */
export interface KesifUrun {
  pazaryeri: string;
  site: string;
  satici: string | null;
  urunAdi: string;
  gram: number;
  ayar: number;
  fiyat: number;
  kargo: number;
  link: string;
  tarih: string;
  /** Backend hesaplayıp gönderdiği için burada da tutuyoruz (opsiyonel). */
  _tlg?: number;
}

export interface KesifGramSonucu {
  gram: number;
  urun: KesifUrun | null;
}

export interface KesifRapor {
  guncellemeTarihi: string | null;
  kaynak: "canli" | "yok";
  toplamUrun: number;
  gramSonuclari: KesifGramSonucu[];
  perSite?: Record<string, number>;
}
