import type { SiteParser, UrlBilgisi } from "./types";
import { extractAyar, extractGram, lastSlug, slugToText } from "./common";

export const trendyolParser: SiteParser = {
  site: "trendyol",
  siteLabel: "Trendyol",
  matches: (url) => /(^|\.)trendyol\.com$/i.test(url.hostname),
  parseUrl(url): UrlBilgisi {
    // Trendyol: /<marka>/<urun-adi>-p-12345  → marka path'in başında olabilir.
    const parts = url.pathname.split("/").filter(Boolean);
    const marka = parts.length >= 2 ? slugToText(parts[0]!) : null;
    const slug = lastSlug(url);
    return {
      site: this.site,
      siteLabel: this.siteLabel,
      urunAdi: slug ? slugToText(slug) : null,
      gram: extractGram(slug),
      ayar: extractAyar(slug),
      satici: marka,
    };
  },
};
