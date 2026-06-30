import type { SiteParser, UrlBilgisi } from "./types";
import { extractAyar, extractGram, lastSlug, slugToText } from "./common";

export const n11Parser: SiteParser = {
  site: "n11",
  siteLabel: "N11",
  matches: (url) => /(^|\.)n11\.com$/i.test(url.hostname),
  parseUrl(url): UrlBilgisi {
    // n11: /urun/<urun-adi>-<id>
    const slug = lastSlug(url);
    return {
      site: this.site,
      siteLabel: this.siteLabel,
      urunAdi: slug ? slugToText(slug.replace(/-\d+$/, "")) : null,
      gram: extractGram(slug),
      ayar: extractAyar(slug),
      satici: null,
    };
  },
};
