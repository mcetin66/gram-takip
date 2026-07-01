import { IconChart, IconSettings } from "./Icons";

export type Sayfa = "dashboard" | "discover" | "settings";

interface Props {
  aktif: Sayfa;
  onChange: (s: Sayfa) => void;
}

// Kompakt keşif ikonu — bağımlılık eklemeden inline SVG
function IconSearch({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
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
        className={`tab ${aktif === "discover" ? "tab--active" : ""}`}
        onClick={() => onChange("discover")}
        aria-current={aktif === "discover"}
      >
        <IconSearch />
        <span>Keşif</span>
      </button>
      <button
        className={`tab ${aktif === "settings" ? "tab--active" : ""}`}
        onClick={() => onChange("settings")}
        aria-current={aktif === "settings"}
      >
        <IconSettings />
        <span>Ayarlar</span>
      </button>
    </nav>
  );
}
