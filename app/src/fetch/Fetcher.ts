import type { ParsedProduct } from "../types";

/**
 * Bir linkten tam ürün bilgisini (fiyat dahil) getiren soyutlama.
 * MockFetcher şimdi çalışır; BackendFetcher gerçek VPS scraper'ına bağlanır.
 * (Dependency Inversion: UI bu arayüze bağlı, somut kaynağa değil.)
 */
export interface Fetcher {
  readonly kind: "mock" | "backend";
  /** Bir ürünü getir (ekleme veya yenileme sırasında). */
  fetchProduct(rawUrl: string): Promise<ParsedProduct>;
}
