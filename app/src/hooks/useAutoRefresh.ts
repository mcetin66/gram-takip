import { useEffect, useRef, useState } from "react";

/**
 * Belirli aralıkla callback'i çağırır ve sonraki tetiklemeye kalan saniyeyi (geri sayım)
 * verir. İlk tetikleme hemen yapılır.
 */
export function useAutoRefresh(
  intervalSn: number,
  onTick: () => void | Promise<void>,
): { kalanSn: number; simdiCalistir: () => void } {
  const [kalanSn, setKalanSn] = useState(intervalSn);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;
  const tetikleRef = useRef<() => void>(() => {});

  useEffect(() => {
    let kalan = intervalSn;
    setKalanSn(kalan);

    const calistir = () => {
      kalan = intervalSn;
      setKalanSn(kalan);
      void onTickRef.current();
    };
    tetikleRef.current = calistir;

    // Açılışta hemen güncelle
    void onTickRef.current();

    const id = window.setInterval(() => {
      kalan -= 1;
      if (kalan <= 0) {
        calistir();
      } else {
        setKalanSn(kalan);
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [intervalSn]);

  return { kalanSn, simdiCalistir: () => tetikleRef.current() };
}
