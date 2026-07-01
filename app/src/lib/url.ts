/**
 * URL'i mükerrer karşılaştırması için normalize et:
 * - lowercase host, `www.` prefix'i eş sayılır
 * - hash silinir, tracking query param'ları (utm_, gclid, fbclid) silinir
 * - trailing slash silinir
 * - path olduğu gibi (case-sensitive) — pazaryerlerinde slug case korunur
 * Ayrıştırılamayan girdiler için düşük etki için düz trim/lowercase döner.
 */
const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "gclid", "fbclid", "yclid", "ref", "referrer",
]);

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    u.hash = "";
    const params = new URLSearchParams(u.search);
    for (const key of [...params.keys()]) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) params.delete(key);
    }
    const q = params.toString();
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "") || "/";
    return `${host}${path}${q ? `?${q}` : ""}`;
  } catch {
    return trimmed.toLowerCase();
  }
}

export function sameUrl(a: string, b: string): boolean {
  return normalizeUrl(a) === normalizeUrl(b);
}
