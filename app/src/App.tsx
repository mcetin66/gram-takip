import { useMemo, useState } from "react";
import { TabBar, type Sayfa } from "./components/TabBar";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { useSettings } from "./hooks/useSettings";
import { useProducts } from "./hooks/useProducts";
import { useAutoRefresh } from "./hooks/useAutoRefresh";
import { createFetcher } from "./fetch";

export default function App() {
  const [sayfa, setSayfa] = useState<Sayfa>("dashboard");
  const { ayarlar, guncelle } = useSettings();

  const fetcher = useMemo(
    () => createFetcher(ayarlar),
    [ayarlar.kaynak, ayarlar.backendUrl],
  );

  const { urunler, ekle, sil, hepsiniGuncelle, guncelleniyor } = useProducts(fetcher);
  const { kalanSn, simdiCalistir } = useAutoRefresh(ayarlar.otomatikGuncellemeSn, hepsiniGuncelle);

  const sonGuncelleme = useMemo<string | null>(() => {
    if (urunler.length === 0) return null;
    return urunler.reduce(
      (en, u) => (u.sonGuncelleme > en ? u.sonGuncelleme : en),
      urunler[0]!.sonGuncelleme,
    );
  }, [urunler]);

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
            onSimdiGuncelle={simdiCalistir}
            onSil={sil}
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
