import type { Fetcher } from "./Fetcher";
import type { ParsedProduct } from "../types";
import { analyzeUrl } from "../parsers/registry";

/**
 * Gerçek kaynak. VPS'teki scraper'a (Playwright) bağlanır.
 *
 * Beklenen API sözleşmesi:
 *   POST {backendUrl}/parse   body: { "url": "<urun-linki>" }
 *   200  →  ParsedProduct (fiyat dahil)
 *
 * Backend, scripts/ altındaki scraper'ı tek-ürün modunda sarmalayarak sağlanır.
 */
export class BackendFetcher implements Fetcher {
  readonly kind = "backend" as const;
  constructor(private readonly backendUrl: string) {}

  async fetchProduct(rawUrl: string): Promise<ParsedProduct> {
    // Önce linki doğrula / desteklenen site mi (hızlı geri bildirim, gereksiz istek yok).
    const { url, bilgi } = analyzeUrl(rawUrl);

    const res = await fetch(`${this.backendUrl.replace(/\/$/, "")}/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.href }),
    });
    if (!res.ok) {
      throw new Error(`Backend hata (${res.status}). VPS scraper çalışıyor mu?`);
    }
    const data = (await res.json()) as Partial<ParsedProduct>;

    return {
      url: url.href,
      site: data.site ?? bilgi.site,
      siteLabel: data.siteLabel ?? bilgi.siteLabel,
      marka: data.marka ?? bilgi.marka ?? null,
      satici: data.satici ?? null,
      urunAdi: data.urunAdi ?? bilgi.urunAdi ?? "Altın Ürün",
      gram: data.gram ?? bilgi.gram ?? 0,
      ayar: data.ayar ?? bilgi.ayar ?? 0,
      fiyat: data.fiyat ?? 0,
      kargo: data.kargo ?? 0,
      simulated: false,
    };
  }
}
