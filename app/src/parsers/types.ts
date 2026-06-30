import type { ParsedProduct } from "../types";

/**
 * URL'den çıkarılabilen alanlar. Fiyat ve satıcı çoğu zaman URL'de yoktur;
 * onları Fetcher (Mock/Backend) tamamlar.
 */
export interface UrlBilgisi {
  site: string;
  siteLabel: string;
  urunAdi: string | null;
  gram: number | null;
  ayar: number | null;
  satici: string | null;
}

/**
 * Her pazaryeri için bir parser. Yeni site eklemek = yeni dosya + registry'e ekleme.
 * (Open/Closed: mevcut kod değişmeden genişler.)
 */
export interface SiteParser {
  readonly site: string;
  readonly siteLabel: string;
  /** Bu URL bu siteye mi ait? */
  matches(url: URL): boolean;
  /** URL'den çıkarılabilecekleri döndür. */
  parseUrl(url: URL): UrlBilgisi;
}

/** Backend HTML döndürürse, parser'lar bunu da uygulayabilir (ileriye dönük). */
export type ParseResult = Partial<ParsedProduct>;
