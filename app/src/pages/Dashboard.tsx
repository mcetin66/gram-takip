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
  onSimdiGuncelle: () => void;
  onSil: (id: string) => void;
}

export function Dashboard({
  urunler,
  guncelleniyor,
  kalanSn,
  intervalSn,
  sonGuncelleme,
  onSimdiGuncelle,
  onSil,
}: Props) {
  const { enUcuz, hurdaAltin, oran } = useMemo(() => {
    // Normal ürünler (hurda olmayanlar)
    const normalUrunler = urunler.filter(u => u.site !== 'altinkaynak');
    // Altınkaynak'tan gelen 22 ayar hurda fiyatı
    const hurda = urunler.find(u => u.site === 'altinkaynak');
    
    const cheapest = normalUrunler.length ? tlPerGram(normalUrunler[0]!) : null;
    const hurdaFiyat = hurda ? hurda.fiyat : null;
    
    let ratio = null;
    if (cheapest && hurdaFiyat) {
      // (En Düşük TL/gr / Hurda Alış) - 1
      ratio = ((cheapest / hurdaFiyat) - 1) * 100;
    }
    
    return { 
      enUcuz: cheapest, 
      hurdaAltin: hurdaFiyat, 
      oran: ratio 
    };
  }, [urunler]);

  return (
    <div className="page">
      <header className="dash-head">
        <div className="dash-head__top">
          <div>
            <h1 className="dash-title">
              <span className="dash-title__dot" /> Altın Takip
            </h1>
            <p className="dash-sub">
              {sonGuncelleme ? `Son güncelleme ${saat(sonGuncelleme)}` : "Henüz güncellenmedi"}
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

        <div className="dash-stats">
          <div className="stat">
            <span className="stat__k">En düşük TL/gram</span>
            <span className="stat__v stat__v--accent">
              {enUcuz != null ? formatTL2(enUcuz) : "—"}
            </span>
          </div>
          <div className="stat">
            <span className="stat__k">22k Hurda Alış</span>
            <span className="stat__v">
              {hurdaAltin != null ? formatTL2(hurdaAltin) : "—"}
            </span>
          </div>
          <div className="stat">
            <span className="stat__k">Makas Oranı</span>
            <span className="stat__v" style={{ color: oran && oran > 10 ? '#ff4d4f' : '#52c41a' }}>
              {oran != null ? `%${oran.toFixed(2)}` : "—"}
            </span>
          </div>
          <div className="stat">
            <span className="stat__k">Güncelleme</span>
            <span className="stat__v">{kalanSn}s</span>
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
