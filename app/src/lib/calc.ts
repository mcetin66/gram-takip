import type { ParsedProduct, Product } from "../types";

/** TL/gram = (Fiyat + Kargo) / Gram. Kargo ücretliyse toplam fiyata dahil. */
export function tlPerGram(p: Pick<ParsedProduct, "fiyat" | "kargo" | "gram">): number {
  if (!p.gram || p.gram <= 0) return Infinity;
  const kargo = p.kargo && p.kargo > 0 ? p.kargo : 0;
  return (p.fiyat + kargo) / p.gram;
}

/** Listeyi TL/gram'a göre artan (en ucuz üstte) sırala — saf, kopya döndürür. */
export function sortByTlGram<T extends Product>(list: readonly T[]): T[] {
  return [...list].sort((a, b) => tlPerGram(a) - tlPerGram(b));
}

export type FiyatYonu = "yukseldi" | "dustu" | "sabit";

export function fiyatYonu(guncel: number, onceki: number | null): FiyatYonu {
  if (onceki == null) return "sabit";
  if (guncel > onceki + 0.001) return "yukseldi";
  if (guncel < onceki - 0.001) return "dustu";
  return "sabit";
}
