import { useCallback, useEffect, useRef, useState } from "react";
import type { Ayarlar } from "../types";
import { load, save } from "../storage/storage";

/**
 * Altınkaynak "22 ayar hurda alış" fiyatını arka planda REFERANS olarak çeker.
 *
 * ÜRÜN LİSTESİNE EKLENMEZ — sadece Dashboard'daki "22k Hurda Alış" ve
 * "Makas Oranı" kartlarını besler.
 *
 * - Yalnız backend modu (kaynak='backend') aktifken çalışır.
 * - Son bilinen değer LocalStorage'da tutulur; ağ hatalarında sessiz kalır,
 *   önceki değer görünmeye devam eder.
 */

const KEY = "altin-takip:hurda:v1";
const HURDA_URL = "https://www.altinkaynak.com/canli-kurlar/";

interface Saved {
  fiyat: number | null;
  sonGuncelleme: string | null;
}

export interface HurdaReferance {
  fiyat: number | null;
  sonGuncelleme: string | null;
  guncelleniyor: boolean;
  simdiCalistir: () => void;
}

export function useHurdaReference(ayarlar: Ayarlar, intervalSn: number): HurdaReferance {
  const [state, setState] = useState<Saved>(() =>
    load<Saved>(KEY, { fiyat: null, sonGuncelleme: null }),
  );
  const [guncelleniyor, setGuncelleniyor] = useState(false);

  const ayarRef = useRef(ayarlar);
  ayarRef.current = ayarlar;

  useEffect(() => {
    save(KEY, state);
  }, [state]);

  const cek = useCallback(async () => {
    if (ayarRef.current.kaynak !== "backend") return;
    setGuncelleniyor(true);
    try {
      const base = ayarRef.current.backendUrl.replace(/\/$/, "");
      const res = await fetch(`${base}/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: HURDA_URL }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (typeof data.fiyat === "number" && data.fiyat > 0) {
        setState({ fiyat: data.fiyat, sonGuncelleme: new Date().toISOString() });
      }
    } catch {
      // sessiz: önceki değer görünmeye devam etsin
    } finally {
      setGuncelleniyor(false);
    }
  }, []);

  useEffect(() => {
    void cek();
    const id = window.setInterval(() => void cek(), Math.max(5, intervalSn) * 1000);
    return () => window.clearInterval(id);
  }, [intervalSn, cek]);

  return {
    fiyat: state.fiyat,
    sonGuncelleme: state.sonGuncelleme,
    guncelleniyor,
    simdiCalistir: () => void cek(),
  };
}
