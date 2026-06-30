import { useCallback, useEffect, useRef, useState } from "react";
import type { Fetcher } from "../fetch";
import type { ParsedProduct, Product } from "../types";
import { STORAGE_KEYS } from "../config";
import { load, save } from "../storage/storage";
import { newId } from "../lib/id";
import { sortByTlGram } from "../lib/calc";

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
  const [urunler, setUrunler] = useState<Product[]>(() =>
    sortByTlGram(load<Product[]>(STORAGE_KEYS.urunler, [])),
  );
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
    const parsed = await fetcherRef.current.fetchProduct(rawUrl);
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
