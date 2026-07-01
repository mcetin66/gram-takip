import { useCallback, useEffect, useRef, useState } from "react";
import type { Fetcher } from "../fetch";
import type { ParsedProduct, Product } from "../types";
import { STORAGE_KEYS } from "../config";
import { load, save } from "../storage/storage";
import { newId } from "../lib/id";
import { sortByTlGram } from "../lib/calc";
import { normalizeUrl } from "../lib/url";

export class DuplicateUrunHatasi extends Error {
  constructor(public readonly mevcut: Product) {
    super(`Bu ürün zaten listende: "${mevcut.urunAdi}".`);
    this.name = "DuplicateUrunHatasi";
  }
}

const now = () => new Date().toISOString();

function toProduct(p: ParsedProduct): Product {
  return {
    ...p,
    id: newId(),
    prevFiyat: null,
    sonGuncelleme: now(),
    eklenmeTarihi: now(),
  };
}

export interface UseProducts {
  urunler: Product[];
  ekle: (rawUrl: string) => Promise<Product>;
  sil: (id: string) => void;
  hepsiniGuncelle: () => Promise<void>;
  guncelleniyor: boolean;
}

export function useProducts(fetcher: Fetcher): UseProducts {
  const [urunler, setUrunler] = useState<Product[]>(() => {
    // Geriye dönük temizlik: önceki sürümde Altınkaynak yanlışlıkla listeye eklenmişse çıkar.
    const kayitli = load<Product[]>(STORAGE_KEYS.urunler, []);
    const temiz = kayitli.filter((u) => u.site !== "altinkaynak");
    return sortByTlGram(temiz);
  });
  const [guncelleniyor, setGuncelleniyor] = useState(false);

  // Güncel referanslar (closure tuzaklarını önlemek için).
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const urunlerRef = useRef(urunler);
  urunlerRef.current = urunler;

  useEffect(() => {
    save(STORAGE_KEYS.urunler, urunler);
  }, [urunler]);

  const ekle = useCallback(async (rawUrl: string): Promise<Product> => {
    // Mükerrer kontrol: aynı ürün (normalize URL) zaten listede mi?
    const key = normalizeUrl(rawUrl);
    const mevcut = urunlerRef.current.find((u) => normalizeUrl(u.url) === key);
    if (mevcut) throw new DuplicateUrunHatasi(mevcut);

    const parsed = await fetcherRef.current.fetchProduct(rawUrl);

    // Ağ çağrısı sırasında aynı ürün paralel eklenmiş olabilir — bir daha kontrol.
    const parsedKey = normalizeUrl(parsed.url);
    const mevcut2 = urunlerRef.current.find(
      (u) => normalizeUrl(u.url) === key || normalizeUrl(u.url) === parsedKey,
    );
    if (mevcut2) throw new DuplicateUrunHatasi(mevcut2);

    const urun = toProduct(parsed);
    setUrunler((prev) => sortByTlGram([...prev, urun]));
    return urun;
  }, []);

  const sil = useCallback((id: string) => {
    setUrunler((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const hepsiniGuncelle = useCallback(async () => {
    const mevcut = urunlerRef.current;
    if (mevcut.length === 0) return;
    setGuncelleniyor(true);
    try {
      const sonuclar = await Promise.allSettled(
        mevcut.map((u) => fetcherRef.current.fetchProduct(u.url)),
      );
      setUrunler((prev) => {
        const byId = new Map(prev.map((u) => [u.id, u]));
        mevcut.forEach((u, i) => {
          const r = sonuclar[i];
          const eski = byId.get(u.id);
          if (!eski || !r || r.status !== "fulfilled") return;
          byId.set(u.id, {
            ...eski,
            fiyat: r.value.fiyat,
            kargo: r.value.kargo,
            prevFiyat: eski.fiyat,
            sonGuncelleme: now(),
            urunAdi: r.value.urunAdi || eski.urunAdi,
            satici: r.value.satici || eski.satici,
            gram: r.value.gram || eski.gram,
            ayar: r.value.ayar || eski.ayar,
            simulated: r.value.simulated,
          });
        });
        return sortByTlGram([...byId.values()]);
      });
    } finally {
      setGuncelleniyor(false);
    }
  }, []);

  return { urunler, ekle, sil, hepsiniGuncelle, guncelleniyor };
}
