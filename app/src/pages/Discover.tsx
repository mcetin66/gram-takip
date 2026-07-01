import { useMemo, useState } from "react";
import type { KesifRapor, KesifUrun } from "../types";
import { IconExternal, IconPlus, IconRefresh } from "../components/Icons";
import { displaySite, formatTL, formatTL2, formatGram, saat } from "../lib/format";

interface Props {
  rapor: KesifRapor | null;
  yukleniyor: boolean;
  taraniyor: boolean;
  hata: string | null;
  sonTarama: string | null;
  onTara: () => Promise<void>;
  onEkle: (u: KesifUrun) => Promise<void>;
}

function tlPerGram(u: KesifUrun): number {
  const eff = u.fiyat + (u.kargo || 0);
  return eff / u.gram;
}

export function Discover({ rapor, yukleniyor, taraniyor, hata, sonTarama, onTara, onEkle }: Props) {
  const [ekleniyor, setEkleniyor] = useState<string | null>(null);

  const gramSonuclari = rapor?.gramSonuclari ?? [];
  const doluGramlar = useMemo(() => gramSonuclari.filter((g) => g.urun), [gramSonuclari]);
  const bosGramlar = useMemo(() => gramSonuclari.filter((g) => !g.urun).map((g) => g.gram), [gramSonuclari]);

  async function hepsiniEkle() {
    for (const g of doluGramlar) {
      if (!g.urun) continue;
      setEkleniyor(g.urun.link);
      try { await onEkle(g.urun); } catch {}
    }
    setEkleniyor(null);
  }

  return (
    <div className="page">
      <header className="dash-head">
        <div className="dash-head__top">
          <div>
            <h1 className="dash-title"><span className="dash-title__dot" /> Keşif</h1>
            <p className="dash-sub">
              {sonTarama ? `Son tarama ${saat(sonTarama)}` : "Henüz tarama yapılmadı"}
              {rapor && rapor.toplamUrun > 0 && ` · ${rapor.toplamUrun} ürün incelendi`}
            </p>
          </div>
          <button
            className={`refresh ${taraniyor ? "refresh--busy" : ""}`}
            onClick={onTara}
            disabled={taraniyor || yukleniyor}
          >
            <IconRefresh />
            <span>{taraniyor ? "Taranıyor…" : "Şimdi Tara"}</span>
          </button>
        </div>

        {hata && <p className="msg msg--err" style={{ marginTop: 12 }}>{hata}</p>}

        {doluGramlar.length > 0 && (
          <div className="dash-stats dash-stats--3" style={{ marginTop: 16 }}>
            <div className="stat">
              <span className="stat__k">Kategori (5–30 gr)</span>
              <span className="stat__v">{doluGramlar.length}/26</span>
            </div>
            <div className="stat">
              <span className="stat__k">En ucuz TL/gr</span>
              <span className="stat__v stat__v--accent">
                {formatTL2(Math.min(...doluGramlar.map((g) => tlPerGram(g.urun!))))}
              </span>
            </div>
            <div className="stat">
              <span className="stat__k">Süre</span>
              <span className="stat__v">{taraniyor ? "…" : (sonTarama ? saat(sonTarama) : "—")}</span>
            </div>
          </div>
        )}
      </header>

      {doluGramlar.length > 0 && (
        <div style={{ padding: "0 16px 8px" }}>
          <button className="btn btn--primary" onClick={hepsiniEkle} disabled={taraniyor}>
            <IconPlus /> Hepsini Listeye Ekle ({doluGramlar.length})
          </button>
        </div>
      )}

      {yukleniyor && !rapor ? (
        <div className="empty"><div className="empty__icon">⏳</div><h3>Yükleniyor…</h3></div>
      ) : !rapor || doluGramlar.length === 0 ? (
        <div className="empty">
          <div className="empty__icon">🔎</div>
          <h3>Henüz keşif sonucu yok</h3>
          <p>“Şimdi Tara” ile başlat. İlk tarama birkaç dakika sürer, sonuçlar cache'lenir.</p>
        </div>
      ) : (
        <div className="list" style={{ padding: "0 16px" }}>
          {doluGramlar.map((g) => {
            const u = g.urun!;
            const tlg = tlPerGram(u);
            const pazaryeri = displaySite(u.pazaryeri);
            return (
              <div key={u.link} className="row">
                <div className="row__rank">{g.gram}</div>
                <div className="row__main" title={u.urunAdi}>
                  <div className="row__chips">
                    <span className="chip chip--site">{pazaryeri}</span>
                    {u.satici && <span className="chip chip--seller">{u.satici}</span>}
                    <span className="chip">{u.ayar} ayar</span>
                    <span className="chip">{formatGram(u.gram)}</span>
                  </div>
                </div>
                <div className="row__metrics">
                  <div className="row__tlg">{formatTL2(tlg)}<small>/gr</small></div>
                  <div className="row__price">{formatTL(u.fiyat)}</div>
                </div>
                <div className="row__actions">
                  <a className="iconbtn" href={u.link} target="_blank" rel="noopener noreferrer" aria-label="Aç">
                    <IconExternal />
                  </a>
                  <button
                    className="iconbtn"
                    onClick={async () => { setEkleniyor(u.link); try { await onEkle(u); } finally { setEkleniyor(null); } }}
                    disabled={ekleniyor === u.link}
                    aria-label="Listeme ekle"
                    title="Listeme ekle"
                  >
                    <IconPlus size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {bosGramlar.length > 0 && (
        <p className="hint" style={{ padding: "8px 20px 24px", textAlign: "center" }}>
          Bu gramlarda uygun ürün bulunamadı: {bosGramlar.join(", ")} gr
        </p>
      )}
    </div>
  );
}
