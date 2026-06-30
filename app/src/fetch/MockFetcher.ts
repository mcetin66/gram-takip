import type { Fetcher } from "./Fetcher";
import type { ParsedProduct } from "../types";
import { analyzeUrl } from "../parsers/registry";

/**
 * Geliştirme/demo kaynağı. Linkten site/ürün/gram/ayar'ı GERÇEKTEN çıkarır,
 * fiyatı simüle eder ve her çağrıda hafifçe oynatır (rastgele yürüyüş) — böylece
 * canlı güncelleme, kırmızı/yeşil parlama ve sıralama gerçek davranışla görülür.
 */
export class MockFetcher implements Fetcher {
  readonly kind = "mock" as const;
  private prices = new Map<string, number>();

  async fetchProduct(rawUrl: string): Promise<ParsedProduct> {
    const { url, bilgi } = analyzeUrl(rawUrl);
    await delay(180 + Math.random() * 320); // ağ gecikmesi hissi

    const gram = bilgi.gram ?? defaultGram(url.href);
    const ayar = bilgi.ayar ?? 22;
    const fiyat = this.nextPrice(url.href, gram, ayar);

    return {
      url: url.href,
      site: bilgi.site,
      siteLabel: bilgi.siteLabel,
      satici: bilgi.satici ?? bilgi.siteLabel,
      urunAdi: bilgi.urunAdi ?? "Altın Ürün",
      gram,
      ayar,
      fiyat,
      kargo: 0,
      simulated: true,
    };
  }

  private nextPrice(key: string, gram: number, ayar: number): number {
    const prev = this.prices.get(key);
    if (prev == null) {
      // Ayara göre yaklaşık gram fiyatı (SİMÜLE — gerçek değildir).
      const perGram = ayar >= 24 ? 4700 : ayar >= 22 ? 4300 : ayar >= 18 ? 3550 : 2750;
      const base = Math.round(gram * perGram * (0.99 + seeded(key) * 0.02));
      this.prices.set(key, base);
      return base;
    }
    // ±%0.6 rastgele yürüyüş
    const drift = 1 + (Math.random() - 0.5) * 0.012;
    const next = Math.max(1, Math.round(prev * drift));
    this.prices.set(key, next);
    return next;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** URL'den 0..1 deterministik sayı. */
function seeded(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function defaultGram(href: string): number {
  const options = [5, 10, 15, 20, 25];
  return options[Math.floor(seeded(href) * options.length)] ?? 10;
}
