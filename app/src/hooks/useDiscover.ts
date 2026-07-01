import { useCallback, useEffect, useRef, useState } from "react";
import type { Ayarlar, KesifRapor } from "../types";

interface DiscoverState {
  rapor: KesifRapor | null;
  yukleniyor: boolean;
  hata: string | null;
  taraniyor: boolean;
  sonTarama: string | null;
}

export interface UseDiscover extends DiscoverState {
  yenile: () => Promise<void>;
  taramayiBaslat: () => Promise<void>;
}

export function useDiscover(ayarlar: Ayarlar): UseDiscover {
  const [state, setState] = useState<DiscoverState>({
    rapor: null,
    yukleniyor: false,
    hata: null,
    taraniyor: false,
    sonTarama: null,
  });

  const ayarRef = useRef(ayarlar);
  ayarRef.current = ayarlar;

  const base = () => ayarRef.current.backendUrl.replace(/\/$/, "");

  const yenile = useCallback(async () => {
    if (ayarRef.current.kaynak !== "backend") {
      setState((s) => ({ ...s, hata: 'Gerçek (VPS) modu gerekli' }));
      return;
    }
    setState((s) => ({ ...s, yukleniyor: true, hata: null }));
    try {
      const [rRes, sRes] = await Promise.all([
        fetch(`${base()}/discover`),
        fetch(`${base()}/discover/status`),
      ]);
      const rapor = (await rRes.json()) as KesifRapor;
      const durum = await sRes.json();
      setState((s) => ({
        ...s,
        rapor,
        yukleniyor: false,
        taraniyor: !!durum.calisiyor,
        sonTarama: durum.sonBitis || rapor.guncellemeTarihi,
      }));
    } catch (e) {
      setState((s) => ({ ...s, yukleniyor: false, hata: e instanceof Error ? e.message : 'yükleme hatası' }));
    }
  }, []);

  const taramayiBaslat = useCallback(async () => {
    if (ayarRef.current.kaynak !== "backend") {
      setState((s) => ({ ...s, hata: 'Gerçek (VPS) modu gerekli' }));
      return;
    }
    setState((s) => ({ ...s, taraniyor: true, hata: null }));
    try {
      await fetch(`${base()}/discover/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch (e) {
      setState((s) => ({ ...s, taraniyor: false, hata: e instanceof Error ? e.message : 'tarama başlatılamadı' }));
    }
  }, []);

  // İlk açılışta ve tarama sırasında düzenli poll
  useEffect(() => {
    void yenile();
    const id = window.setInterval(() => {
      void yenile();
    }, state.taraniyor ? 5000 : 30000);
    return () => window.clearInterval(id);
  }, [yenile, state.taraniyor]);

  return { ...state, yenile, taramayiBaslat };
}
