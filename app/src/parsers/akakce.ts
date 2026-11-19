import type { SiteParser, UrlBilgisi } from "./types";
import { extractAyar, extractGram, lastSlug, slugToText } from "./common";

/**
 * Akakçe: pazaryerlerini tarayan fiyat motoru. VPS IP'sinden erişilebildiği için
 * pazar yeri sayfaları blokluyken tek çalışan yol.
 * URL: /<kategori>/en-ucuz-<urun>-fiyati,<id>.html
 */
export const akakceParser: SiteParser = {
  site: "akakce",
  siteLabel: "Akakçe",
  matches: (url) => /(^|\.)akakce\.com$/i.test(url.hostname),
  parseUrl(url): UrlBilgisi {
    const slug = lastSlug(url)
      .replace(/\.html$/i, "")
      .replace(/,\d+$/i, "")
      .replace(/^en-ucuz-/i, "")
      .replace(/-fiyati.*$/i, "");
    return {
      site: this.site,
      siteLabel: this.siteLabel,
      urunAdi: slug ? slugToText(slug) : null,
      gram: extractGram(slug),
      ayar: extractAyar(slug),
      marka: null,
    };
  },
};
