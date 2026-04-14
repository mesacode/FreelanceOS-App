import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/customers": "Müşteriler",
  "/finances": "Finans",
  "/reminders": "Hatırlatıcılar",
  "/whatsapp": "WhatsApp Şablonları",
  "/settings": "Ayarlar"
};

function WindowControls() {
  const controls = window.desktopAPI?.windowControls;
  const isMac = window.desktopAPI?.platform === "darwin";
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!controls) return;

    void controls.isMaximized().then(setIsMaximized).catch(() => {
      setIsMaximized(false);
    });

    const unsubscribe = controls.onMaximizedChanged((value) => {
      setIsMaximized(value);
    });

    return () => {
      unsubscribe();
    };
  }, [controls]);

  if (!controls || isMac) return null;

  return (
    <div className="app-no-drag flex items-center rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <button
        type="button"
        onClick={() => void controls.minimize()}
        className="grid h-9 w-10 place-items-center text-sm transition-colors hover:bg-white/5"
        style={{ color: "var(--foreground-secondary)" }}
        aria-label="Küçült"
      >
        <span className="block h-px w-3 bg-current" />
      </button>
      <button
        type="button"
        onClick={() => void controls.toggleMaximize()}
        className="grid h-9 w-10 place-items-center text-sm transition-colors hover:bg-white/5"
        style={{ color: "var(--foreground-secondary)" }}
        aria-label={isMaximized ? "Önceki boyut" : "Büyüt"}
      >
        {isMaximized ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4H8V10H2V4ZM4 2H10V8" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="2" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        )}
      </button>
      <button
        type="button"
        onClick={() => void controls.close()}
        className="grid h-9 w-10 place-items-center rounded-r-lg text-sm transition-colors hover:bg-rose-500/85 hover:text-white"
        style={{ color: "var(--foreground-secondary)" }}
        aria-label="Kapat"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
    </div>
  );
}

export default function Header() {
  const location = useLocation();
  const title = location.pathname.startsWith("/customers/")
    ? "Müşteri Detayı"
    : titles[location.pathname] ?? "FreelanceOS";

  return (
    <header
      className="app-drag sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b px-4 lg:px-6"
      style={{ background: "var(--background-elevated)", borderColor: "var(--border)" }}
    >
      <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="app-no-drag relative hidden xl:block">
          <input
            type="text"
            placeholder="Hızlı arama..."
            className="h-10 w-64 rounded-lg px-4 pr-16 outline-none transition-all duration-200 focus:ring-2 2xl:w-80"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              backdropFilter: "blur(10px)"
            }}
          />
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-xs"
            style={{ background: "var(--surface)", color: "var(--foreground-tertiary)" }}
          >
            Ctrl+K
          </div>
        </div>

        <button
          type="button"
          className="app-no-drag hidden rounded-lg p-2.5 transition-all duration-200 hover:scale-105 lg:block"
          style={{
            background: "linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%)",
            boxShadow: "0 4px 16px var(--primary-glow)",
            color: "#ffffff"
          }}
          aria-label="Hızlı eylem"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          className="app-no-drag relative hidden rounded-lg p-2.5 transition-all duration-200 lg:block"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--foreground-secondary)"
          }}
          aria-label="Bildirimler"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 5C8.067 5 6.5 6.567 6.5 8.5V11.5L5 13.5H15L13.5 11.5V8.5C13.5 6.567 11.933 5 10 5Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M8.5 13.5V14C8.5 14.828 9.172 15.5 10 15.5C10.828 15.5 11.5 14.828 11.5 14V13.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <div
            className="absolute right-1 top-1 h-2 w-2 rounded-full"
            style={{ background: "var(--error)", boxShadow: "0 0 8px var(--error-glow)" }}
          />
        </button>

        <div
          className="app-no-drag hidden items-center gap-2 rounded-lg px-3 py-2 xl:flex"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{
              background: "var(--success)",
              boxShadow: "0 0 8px var(--success-glow)",
              animation: "glow 2s ease-in-out infinite"
            }}
          />
          <span className="text-xs" style={{ color: "var(--foreground-secondary)" }}>
            Tüm Sistemler Aktif
          </span>
        </div>

        <WindowControls />
      </div>
    </header>
  );
}
