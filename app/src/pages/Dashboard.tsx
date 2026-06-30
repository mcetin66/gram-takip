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
  const enUcuz = useMemo(
    () => (urunler.length ? tlPerGram(urunler[0]!) : null),
    [urunler],
  );

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
            <span className="stat__k">Takipteki ürün</span>
            <span className="stat__v">{urunler.length}</span>
          </div>
          <div className="stat">
            <span className="stat__k">En düşük TL/gram</span>
            <span className="stat__v stat__v--accent">
              {enUcuz != null ? formatTL2(enUcuz) : "—"}
            </span>
          </div>
          <div className="stat">
            <span className="stat__k">Sonraki güncelleme</span>
            <span className="stat__v">{kalanSn} sn</span>
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
