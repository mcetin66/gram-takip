import { useEffect, useRef, useState } from "react";
import type { Product } from "../types";
import { tlPerGram } from "../lib/calc";
import { displaySite, formatTL, formatTL2, formatGram, goreliZaman } from "../lib/format";
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
  const pazaryeri = displaySite(urun.siteLabel);
  const marka = urun.marka?.trim() || null;
  const satici = urun.satici?.trim() || null;
  // Satıcı, marka ile ve pazaryeri ile aynı değilse ayrı chip olarak göster.
  const saticiFarkli = !!satici
    && satici.toLocaleLowerCase("tr") !== (marka ?? "").toLocaleLowerCase("tr")
    && displaySite(satici).toLocaleLowerCase("tr") !== pazaryeri.toLocaleLowerCase("tr");

  return (
    <div className={`row ${flash ? `row--${flash}` : ""} ${enUcuz ? "row--best" : ""}`}>
      <div className="row__rank">{enUcuz ? "★" : sira}</div>

      <div className="row__main" title={urun.urunAdi}>
        <div className="row__chips">
          <span className="chip chip--site">{pazaryeri}</span>
          {marka && <span className="chip chip--brand">{marka}</span>}
          {saticiFarkli && <span className="chip chip--seller">{satici}</span>}
          <span className="chip">{urun.ayar} ayar</span>
          <span className="chip">{formatGram(urun.gram)}</span>
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
