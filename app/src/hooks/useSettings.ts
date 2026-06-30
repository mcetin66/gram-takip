import { useCallback, useEffect, useState } from "react";
import type { Ayarlar } from "../types";
import { STORAGE_KEYS, VARSAYILAN_AYARLAR } from "../config";
import { load, save } from "../storage/storage";

export function useSettings() {
  const [ayarlar, setAyarlar] = useState<Ayarlar>(() =>
    load<Ayarlar>(STORAGE_KEYS.ayarlar, VARSAYILAN_AYARLAR),
  );

  useEffect(() => {
    save(STORAGE_KEYS.ayarlar, ayarlar);
  }, [ayarlar]);

  const guncelle = useCallback((kismi: Partial<Ayarlar>) => {
    setAyarlar((prev) => ({ ...prev, ...kismi }));
  }, []);

  return { ayarlar, guncelle };
}
