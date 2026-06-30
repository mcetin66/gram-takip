import { useState } from "react";
import type { Ayarlar } from "../types";
import { IconPaste, IconPlus } from "../components/Icons";
import { DESTEKLENEN_SITELER } from "../parsers/registry";

interface Props {
  ayarlar: Ayarlar;
  onAyarGuncelle: (k: Partial<Ayarlar>) => void;
  onEkle: (rawUrl: string) => Promise<void>;
}

type Durum = { tip: "bos" } | { tip: "yukleniyor" } | { tip: "ok"; mesaj: string } | { tip: "hata"; mesaj: string };

export function Settings({ ayarlar, onAyarGuncelle, onEkle }: Props) {
  const [link, setLink] = useState("");
  const [durum, setDurum] = useState<Durum>({ tip: "bos" });

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setLink(text.trim());
    } catch {
      setDurum({ tip: "hata", mesaj: "Pano okunamadı. Linki elle yapıştırabilirsin." });
    }
  }

  async function ekle() {
    const raw = link.trim();
    if (!raw) {
      setDurum({ tip: "hata", mesaj: "Önce bir ürün linki yapıştır." });
      return;
    }
    setDurum({ tip: "yukleniyor" });
    try {
      await onEkle(raw);
      setLink("");
      setDurum({ tip: "ok", mesaj: "Ürün eklendi ve takibe alındı." });
    } catch (e) {
      setDurum({ tip: "hata", mesaj: e instanceof Error ? e.message : "Bilinmeyen hata." });
    }
  }

  return (
    <div className="page">
      <header className="dash-head">
        <h1 className="dash-title">Ürün Ekle</h1>
        <p className="dash-sub">Sadece linki yapıştır — sistem ürünü otomatik analiz eder.</p>
      </header>

      <section className="add-box">
        <textarea
          className="add-input"
          placeholder="https://www.idefix.com/... ürün linkini buraya yapıştır"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          rows={3}
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <div className="add-actions">
          <button className="btn btn--ghost" onClick={paste}>
            <IconPaste /> Paste
          </button>
          <button className="btn btn--primary" onClick={ekle} disabled={durum.tip === "yukleniyor"}>
            <IconPlus /> {durum.tip === "yukleniyor" ? "Analiz ediliyor…" : "Ekle"}
          </button>
        </div>

        {durum.tip === "hata" && <p className="msg msg--err">{durum.mesaj}</p>}
        {durum.tip === "ok" && <p className="msg msg--ok">{durum.mesaj}</p>}

        <p className="hint">
          Desteklenen siteler: {DESTEKLENEN_SITELER.join(" · ")}
        </p>
      </section>

      <section className="settings-block">
        <h2 className="settings-h">Veri Kaynağı</h2>
        <div className="seg">
          <button
            className={`seg__btn ${ayarlar.kaynak === "mock" ? "seg__btn--active" : ""}`}
            onClick={() => onAyarGuncelle({ kaynak: "mock" })}
          >
            Simülasyon
          </button>
          <button
            className={`seg__btn ${ayarlar.kaynak === "backend" ? "seg__btn--active" : ""}`}
            onClick={() => onAyarGuncelle({ kaynak: "backend" })}
          >
            Gerçek (VPS)
          </button>
        </div>
        {ayarlar.kaynak === "mock" ? (
          <p className="hint">
            Fiyatlar <strong>simüledir</strong> — link analizi (site/ürün/gram/ayar) gerçektir.
            Otomatik güncelleme, parlama ve sıralama davranışını test etmek için idealdir.
          </p>
        ) : (
          <>
            <label className="field-label">VPS Backend adresi</label>
            <input
              className="text-input"
              type="url"
              value={ayarlar.backendUrl}
              onChange={(e) => onAyarGuncelle({ backendUrl: e.target.value })}
              placeholder="http://VPS_IP:8787"
            />
            <p className="hint">
              VPS'teki scraper <code>POST /parse</code> uç noktasını sağlamalı. Gerçek fiyat buradan gelir.
            </p>
          </>
        )}
      </section>

      <section className="settings-block">
        <h2 className="settings-h">Otomatik Güncelleme</h2>
        <div className="seg">
          {[15, 30, 60].map((sn) => (
            <button
              key={sn}
              className={`seg__btn ${ayarlar.otomatikGuncellemeSn === sn ? "seg__btn--active" : ""}`}
              onClick={() => onAyarGuncelle({ otomatikGuncellemeSn: sn })}
            >
              {sn} sn
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
