import type { SiteParser, UrlBilgisi } from "./types";
import { extractAyar, extractGram, slugToText } from "./common";

export const amazonParser: SiteParser = {
  site: "amazon",
  siteLabel: "Amazon TR",
  matches: (url) => /(^|\.)amazon\.com\.tr$/i.test(url.hostname),
  parseUrl(url): UrlBilgisi {
    // Amazon: /<urun-adi>/dp/<ASIN>  → ürün adı /dp/'den önceki segment.
    const parts = url.pathname.split("/").filter(Boolean);
    const dpIdx = parts.findIndex((p) => /^(dp|gp)$/i.test(p));
    const nameSeg = dpIdx > 0 ? parts[dpIdx - 1]! : parts[0] ?? "";
    return {
      site: this.site,
      siteLabel: this.siteLabel,
      urunAdi: nameSeg ? slugToText(nameSeg) : null,
      gram: extractGram(nameSeg),
      ayar: extractAyar(nameSeg),
      satici: null,
    };
  },
};
