// Parser'ların paylaştığı metin/slug çıkarım yardımcıları.

/** URL slug'ını okunur metne çevir: "agakulche-3lu-burma-25-gr-22-ayar" → "Agakulche 3lü Burma 25 Gr 22 Ayar" */
export function slugToText(slug: string): string {
  const cleaned = slug
    .replace(/-p-\d+.*$/i, "") // idefix/hepsiburada ürün id eki
    .replace(/-pm-\d+.*$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.replace(/\b\w/g, (c) => c.toLocaleUpperCase("tr"));
}

/** Metinden gramaj çıkar: "25 gr", "25gr", "25-gram", "10,0 gr" → number */
export function extractGram(text: string): number | null {
  const t = decodeURIComponent(text).replace(/[-_]/g, " ").replace(",", ".");
  const m = t.match(/(\d+(?:\.\d+)?)\s*(?:gr|gram|g)\b/i);
  if (!m) return null;
  const n = parseFloat(m[1]!);
  return Number.isFinite(n) ? n : null;
}

/** Metinden ayar çıkar: "22 ayar", "22-ayar", "22k", "22 karat" → number */
export function extractAyar(text: string): number | null {
  const t = decodeURIComponent(text).replace(/[-_]/g, " ");
  const m = t.match(/(\d{1,2})\s*(?:ayar|karat|k)\b/i);
  if (!m) return null;
  const n = parseInt(m[1]!, 10);
  return n >= 8 && n <= 24 ? n : null;
}

/** Path'in son anlamlı segmentini al (slug). */
export function lastSlug(url: URL): string {
  const parts = url.pathname.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1]! : "";
}
