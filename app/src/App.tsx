import { useMemo, useState } from "react";
import { TabBar, type Sayfa } from "./components/TabBar";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Discover } from "./pages/Discover";
import { useSettings } from "./hooks/useSettings";
import { useProducts } from "./hooks/useProducts";
import { useAutoRefresh } from "./hooks/useAutoRefresh";
import { useHurdaReference } from "./hooks/useHurdaReference";
import { useDiscover } from "./hooks/useDiscover";
import { createFetcher } from "./fetch";
import type { KesifUrun } from "./types";

export default function App() {
  const [sayfa, setSayfa] = useState<Sayfa>("dashboard");
  const { ayarlar, guncelle } = useSettings();

  const fetcher = useMemo(
    () => createFetcher(ayarlar),
    [ayarlar.kaynak, ayarlar.backendUrl],
  );

  const { urunler, ekle, sil, hepsiniGuncelle, guncelleniyor } = useProducts(fetcher);
  const { kalanSn, simdiCalistir } = useAutoRefresh(ayarlar.otomatikGuncellemeSn, hepsiniGuncelle);
  const hurda = useHurdaReference(ayarlar, ayarlar.otomatikGuncellemeSn);
  const kesif = useDiscover(ayarlar);

  const sonGuncelleme = useMemo<string | null>(() => {
    if (urunler.length === 0) return null;
    return urunler.reduce(
      (en, u) => (u.sonGuncelleme > en ? u.sonGuncelleme : en),
      urunler[0]!.sonGuncelleme,
    );
  }, [urunler]);

  // Keşif ürününü listeye ekle (backend'e /parse ile normalize edip alır).
  async function keşiftenEkle(u: KesifUrun) {
    try { await ekle(u.link); } catch { /* Duplicate hatası vs sessiz */ }
  }

  return (
    <div className="app">
      <main className="app__main">
        {sayfa === "dashboard" ? (
          <Dashboard
            urunler={urunler}
            guncelleniyor={guncelleniyor}
            kalanSn={kalanSn}
            intervalSn={ayarlar.otomatikGuncellemeSn}
            sonGuncelleme={sonGuncelleme}
            hurdaFiyat={hurda.fiyat}
            onSimdiGuncelle={() => {
              simdiCalistir();
              hurda.simdiCalistir();
            }}
            onSil={sil}
          />
        ) : sayfa === "discover" ? (
          <Discover
            rapor={kesif.rapor}
            yukleniyor={kesif.yukleniyor}
            taraniyor={kesif.taraniyor}
            hata={kesif.hata}
            sonTarama={kesif.sonTarama}
            onTara={kesif.taramayiBaslat}
            onEkle={keşiftenEkle}
          />
        ) : (
          <Settings
            ayarlar={ayarlar}
            onAyarGuncelle={guncelle}
            onEkle={async (raw) => {
              await ekle(raw);
            }}
          />
        )}
      </main>
      <TabBar aktif={sayfa} onChange={setSayfa} />
    </div>
  );
}
