// Ortak yardımcılar: gramaj çıkarma, 22 ayar/işçiliksiz filtresi, tekilleştirme.

// Başlıktan gramajı çıkar: "25 gr", "25gr", "25 gram", "25,0 gr" → 25
export function parseGramaj(text = "") {
  const t = text.replace(",", ".");
  const m = t.match(/(\d+(?:\.\d+)?)\s*(?:gr|gram|g\b)/i);
  return m ? parseFloat(m[1]) : null;
}

// Fiyat metnini sayıya çevir: "110.395,77 TL" → 110395.77
export function parsePrice(text = "") {
  if (typeof text === "number") return text;
  const cleaned = String(text)
    .replace(/[^\d.,]/g, "")
    .replace(/\./g, "")     // binlik ayıracı nokta
    .replace(",", ".");     // ondalık virgül
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

// Ürün 22 ayar işçiliksiz altın bilezik mi? (başlık üzerinden)
export function isTargetProduct(title = "") {
  const t = title.toLocaleLowerCase("tr");
  const ayar22 = /22\s*ayar|22k/.test(t);
  const bilezik = /bilezik|burma|hasır|ajda/.test(t);
  return ayar22 && bilezik;
}

// Aynı ürünün varyasyonlarını tekilleştir (pazaryeri + satıcı + gramaj + normalize başlık)
export function dedupe(items) {
  const seen = new Map();
  for (const u of items) {
    const key = [
      u.pazaryeri,
      (u.satici || "").toLocaleLowerCase("tr").trim(),
      u.gramaj,
      (u.urunAdi || "").toLocaleLowerCase("tr").replace(/\s+/g, " ").slice(0, 40),
    ].join("|");
    const prev = seen.get(key);
    // Aynı ürünse en düşük fiyatlıyı tut
    if (!prev || (u.fiyat ?? Infinity) < (prev.fiyat ?? Infinity)) seen.set(key, u);
  }
  return [...seen.values()];
}

// Gramaj aralığı kontrolü (5–30 gr)
export function inGramRange(g, min = 5, max = 30) {
  return g != null && g >= min && g <= max;
}

export const nowIso = () => new Date().toISOString();
