import type { SiteParser, UrlBilgisi } from "./types";
import { extractAyar, extractGram, lastSlug, slugToText } from "./common";

export const idefixParser: SiteParser = {
  site: "idefix",
  siteLabel: "İdefix",
  matches: (url) => /(^|\.)idefix\.com$/i.test(url.hostname),
  parseUrl(url): UrlBilgisi {
    const slug = lastSlug(url);
    return {
      site: this.site,
      siteLabel: this.siteLabel,
      urunAdi: slug ? slugToText(slug) : null,
      gram: extractGram(slug),
      ayar: extractAyar(slug),
      satici: null, // çoğunlukla marka; backend ürün sayfasından alır
    };
  },
};
