import { useMemo } from "react";
import type { Product } from "../types";
import { ProductList } from "../components/ProductList";
import { IconRefresh } from "../components/Icons";
import { tlPerGram } from "../lib/calc";
import { formatTL2, saat } from "../lib/format";

interface Props {
  urunler: Product[];
  guncelleniyor: boolean;
  kalanSn: number;
  intervalSn: number;
  sonGuncelleme: string | null;
  hurdaFiyat: number | null;
  onSimdiGuncelle: () => void;
  onSil: (id: string) => void;
}

export function Dashboard({
  urunler,
  guncelleniyor,
  kalanSn,
  intervalSn,
  sonGuncelleme,
  hurdaFiyat,
  onSimdiGuncelle,
  onSil,
}: Props) {
  const { enUcuz, oran } = useMemo(() => {
    const cheapest = urunler.length ? tlPerGram(urunler[0]!) : null;
    let ratio: number | null = null;
    if (cheapest != null && hurdaFiyat != null && hurdaFiyat > 0) {
      // Makas: pazaryerinden aldığın gram ile aynısını hurda satarsan aradaki fark.
      ratio = ((cheapest / hurdaFiyat) - 1) * 100;
    }
    return { enUcuz: cheapest, oran: ratio };
  }, [urunler, hurdaFiyat]);

  return (
    <div className="page">
      <header className="dash-head">
        <div className="dash-head__top">
          <div>
            <h1 className="dash-title">
              <span className="dash-title__dot" /> Altın Takip
            </h1>
            <p className="dash-sub">
              {sonGuncelleme
                ? `Son güncelleme ${saat(sonGuncelleme)} · Sonraki ${kalanSn}s`
                : `İlk güncelleme ${kalanSn}s içinde`}
            </p>
          </div>
          <button
            className={`refresh ${guncelleniyor ? "refresh--busy" : ""}`}
            onClick={onSimdiGuncelle}
            disabled={guncelleniyor}
            aria-label="Şimdi güncelle"
          >
            <IconRefresh />
            <span>{guncelleniyor ? "Güncelleniyor…" : "Şimdi Güncelle"}</span>
          </button>
        </div>

        <div className="dash-stats dash-stats--3">
          <div className="stat">
            <span className="stat__k">En düşük TL/gram</span>
            <span className="stat__v stat__v--accent">
              {enUcuz != null ? formatTL2(enUcuz) : "—"}
            </span>
          </div>
          <div className="stat">
            <span className="stat__k">22k Hurda Alış</span>
            <span className="stat__v">
              {hurdaFiyat != null ? formatTL2(hurdaFiyat) : "—"}
            </span>
          </div>
          <div className="stat">
            <span className="stat__k">Makas Oranı</span>
            <span
              className={`stat__v ${oran == null ? "" : oran > 10 ? "stat__v--warn" : "stat__v--good"}`}
            >
              {oran != null ? `%${oran.toFixed(2)}` : "—"}
            </span>
          </div>
        </div>
        <div className="countdown">
          <div
            className="countdown__bar"
            style={{ width: `${Math.max(0, Math.min(100, (kalanSn / intervalSn) * 100))}%` }}
          />
        </div>
      </header>

      <ProductList urunler={urunler} onSil={onSil} />
    </div>
  );
}
