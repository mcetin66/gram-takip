// Biçimlendirme yardımcıları (tr-TR).

const tl0 = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});
const tl2 = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

export const formatTL = (n: number): string => tl0.format(n);
export const formatTL2 = (n: number): string => tl2.format(n);

export function formatGram(g: number): string {
  return `${g.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} gr`;
}

/** "12:04:33" / "2 dk önce" gibi göreli zaman. */
export function goreliZaman(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sn = Math.floor(diff / 1000);
  if (sn < 5) return "az önce";
  if (sn < 60) return `${sn} sn önce`;
  const dk = Math.floor(sn / 60);
  if (dk < 60) return `${dk} dk önce`;
  const sa = Math.floor(dk / 60);
  if (sa < 24) return `${sa} sa önce`;
  return new Date(iso).toLocaleDateString("tr-TR");
}

export function saat(iso: string): string {
  return new Date(iso).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Pazaryeri etiketi normalize et:
 *  "idefix.com" | "www.idefix.com" | "idefix" | "İdefix" → "İdefix"
 * Backend eski/yeni versiyonlarda farklı formatta gönderebilir; SPA daima temiz gösterir.
 */
const SITE_ISIMLERI: Record<string, string> = {
  idefix: "İdefix",
  trendyol: "Trendyol",
  hepsiburada: "Hepsiburada",
  n11: "N11",
  amazon: "Amazon TR",
  altinkaynak: "Altınkaynak",
};

export function displaySite(label: string | undefined | null): string {
  if (!label) return "";
  const key = label
    .toLocaleLowerCase("tr")
    .replace(/^www\./, "")
    .replace(/\.(com\.tr|com|net|org|co|io)$/, "");
  if (SITE_ISIMLERI[key]) return SITE_ISIMLERI[key]!;
  return key.charAt(0).toLocaleUpperCase("tr") + key.slice(1);
}
