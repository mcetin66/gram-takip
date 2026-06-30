import type { SiteParser, UrlBilgisi } from "./types";
import { idefixParser } from "./idefix";
import { trendyolParser } from "./trendyol";
import { hepsiburadaParser } from "./hepsiburada";
import { n11Parser } from "./n11";
import { amazonParser } from "./amazon";

/** Desteklenen parser'lar. Yeni site = buraya bir satır ekle. */
export const PARSERS: readonly SiteParser[] = [
  idefixParser,
  trendyolParser,
  hepsiburadaParser,
  n11Parser,
  amazonParser,
];

export const DESTEKLENEN_SITELER = PARSERS.map((p) => p.siteLabel);

export class DesteklenmeyenSiteHatasi extends Error {
  constructor(host: string) {
    super(`Desteklenmeyen site: ${host}. Desteklenenler: ${DESTEKLENEN_SITELER.join(", ")}`);
    this.name = "DesteklenmeyenSiteHatasi";
  }
}

export class GecersizLinkHatasi extends Error {
  constructor() {
    super("Geçersiz link. Lütfen tam bir ürün adresi yapıştır (https://...).");
    this.name = "GecersizLinkHatasi";
  }
}

function normalizeUrl(raw: string): URL {
  const trimmed = raw.trim();
  if (!trimmed) throw new GecersizLinkHatasi();
  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    throw new GecersizLinkHatasi();
  }
}

/** URL'i analiz et: parser bul + URL'den çıkarılabilenleri döndür. */
export function analyzeUrl(raw: string): { url: URL; parser: SiteParser; bilgi: UrlBilgisi } {
  const url = normalizeUrl(raw);
  const parser = PARSERS.find((p) => p.matches(url));
  if (!parser) throw new DesteklenmeyenSiteHatasi(url.hostname);
  return { url, parser, bilgi: parser.parseUrl(url) };
}
