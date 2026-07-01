import type { SiteParser, UrlBilgisi } from "./types";
import { extractAyar, extractGram, lastSlug, slugToText } from "./common";

export const hepsiburadaParser: SiteParser = {
  site: "hepsiburada",
  siteLabel: "Hepsiburada",
  matches: (url) => /(^|\.)hepsiburada\.com$/i.test(url.hostname),
  parseUrl(url): UrlBilgisi {
    // Hepsiburada: /<urun-adi>-p-HBVxxxxxxxx
    const slug = lastSlug(url);
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
