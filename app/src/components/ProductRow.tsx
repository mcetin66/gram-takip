import { useEffect, useRef, useState } from "react";
import type { Product } from "../types";
import { tlPerGram } from "../lib/calc";
import { formatTL, formatTL2, formatGram, goreliZaman } from "../lib/format";
import { IconExternal, IconTrash } from "./Icons";

interface Props {
  urun: Product;
  sira: number;
  onSil: (id: string) => void;
}

type Flash = "up" | "down" | null;

export function ProductRow({ urun, sira, onSil }: Props) {
  const [flash, setFlash] = useState<Flash>(null);
  const oncekiRef = useRef<number>(urun.fiyat);

  useEffect(() => {
    const onceki = oncekiRef.current;
    if (urun.fiyat > onceki + 0.001) setFlash("up");
    else if (urun.fiyat < onceki - 0.001) setFlash("down");
    oncekiRef.current = urun.fiyat;

    if (urun.fiyat !== onceki) {
      const t = setTimeout(() => setFlash(null), 2000);
      return () => clearTimeout(t);
    }
    return;
  }, [urun.fiyat]);

  const tlg = tlPerGram(urun);
  const enUcuz = sira === 1;

  return (
    <div className={`row ${flash ? `row--${flash}` : ""} ${enUcuz ? "row--best" : ""}`}>
      <div className="row__rank">{enUcuz ? "★" : sira}</div>

      <div className="row__main">
        <div className="row__title" title={urun.urunAdi}>{urun.urunAdi}</div>
        <div className="row__sub">
          <span className="chip chip--site">{urun.siteLabel}</span>
          <span className="chip">{urun.ayar} ayar</span>
          <span className="chip">{formatGram(urun.gram)}</span>
          {urun.satici && urun.satici !== urun.siteLabel && (
            <span className="row__seller">· {urun.satici}</span>
          )}
          {urun.simulated && <span className="chip chip--sim">simüle</span>}
        </div>
      </div>

      <div className="row__metrics">
        <div className="row__tlg">{formatTL2(tlg)}<small>/gr</small></div>
        <div className="row__price">{formatTL(urun.fiyat)}</div>
        <div className="row__time">{goreliZaman(urun.sonGuncelleme)}</div>
      </div>

      <div className="row__actions">
        <a className="iconbtn" href={urun.url} target="_blank" rel="noopener noreferrer" aria-label="Ürünü aç">
          <IconExternal />
        </a>
        <button className="iconbtn iconbtn--danger" onClick={() => onSil(urun.id)} aria-label="Sil">
          <IconTrash />
        </button>
      </div>
    </div>
  );
}
