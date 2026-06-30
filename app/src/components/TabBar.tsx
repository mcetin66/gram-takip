import { IconChart, IconSettings } from "./Icons";

export type Sayfa = "dashboard" | "settings";

interface Props {
  aktif: Sayfa;
  onChange: (s: Sayfa) => void;
}

export function TabBar({ aktif, onChange }: Props) {
  return (
    <nav className="tabbar" aria-label="Ana gezinme">
      <button
        className={`tab ${aktif === "dashboard" ? "tab--active" : ""}`}
        onClick={() => onChange("dashboard")}
        aria-current={aktif === "dashboard"}
      >
        <IconChart />
        <span>İzleme</span>
      </button>
      <button
        className={`tab ${aktif === "settings" ? "tab--active" : ""}`}
        onClick={() => onChange("settings")}
        aria-current={aktif === "settings"}
      >
        <IconSettings />
        <span>Ekle / Ayarlar</span>
      </button>
    </nav>
  );
}
