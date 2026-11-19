import { useEffect, useRef, useState } from "react";
import type { Product } from "../types";
import { tlPerGram } from "../lib/calc";
import { displaySite, formatTL, formatTL2, formatGram, goreliZaman } from "../lib/format";
import { IconExternal, IconTrash } from "./Icons";

interface Props {
  urun: Product;
  sira: number;
  onSil: (id: string) => void;
  hurdaFiyat?: number | null;
}

type Flash = "up" | "down" | null;

export function ProductRow({ urun, sira, onSil, hurdaFiyat }: Props) {
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
  // Akakçe'den gelen "24 satıcı içinde kargo dahil en ucuz fiyat seçeneği" → "24 satıcı"
  const saticiKisa = satici
    ? satici.replace(/\s*içinde.*$/i, "").replace(/\s*kargo.*$/i, "").trim()
    : null;
  const adTemiz = urun.urunAdi.replace(/^en ucuz\s+/i, "").trim();
  const saticiFarkli = !!saticiKisa
    && saticiKisa.toLocaleLowerCase("tr") !== (marka ?? "").toLocaleLowerCase("tr")
    && displaySite(saticiKisa).toLocaleLowerCase("tr") !== pazaryeri.toLocaleLowerCase("tr");

  return (
    <div className={`row ${flash ? `row--${flash}` : ""} ${enUcuz ? "row--best" : ""}`}>
      <div className="row__rank">{enUcuz ? "★" : sira}</div>

      <div className="row__main" title={adTemiz}>
        <div className="row__title">{adTemiz}</div>
        <div className="row__chips">
          <span className="chip chip--site">{pazaryeri}</span>
          {marka && <span className="chip chip--brand">{marka}</span>}
          {saticiFarkli && <span className="chip chip--seller" title={saticiKisa ?? ""}>{saticiKisa}</span>}
          {!new RegExp(`\\b${urun.ayar}\\s*(ayar|k)\\b`, "i").test(adTemiz) && (
            <span className="chip">{urun.ayar} ayar</span>
          )}
          {!new RegExp(`\\b${urun.gram}\\s*(gr|gram)\\b`, "i").test(adTemiz) && (
            <span className="chip">{formatGram(urun.gram)}</span>
          )}
          {urun.simulated && <span className="chip chip--sim">simüle</span>}
        </div>
      </div>

      <div className="row__metrics">
        <div className="row__tlg">{formatTL2(tlg)}<small>/gr</small></div>
        <div className="row__price">{formatTL(urun.fiyat)}</div>
        {hurdaFiyat ? (
          <div className="row__delta">
            {((tlg / hurdaFiyat - 1) * 100 >= 0 ? "+" : "") + ((tlg / hurdaFiyat - 1) * 100).toFixed(1) + "% hurda"}
          </div>
        ) : null}
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
