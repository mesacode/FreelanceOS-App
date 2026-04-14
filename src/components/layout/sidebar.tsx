import { NavLink } from "react-router-dom";
import Logo from "../ui/logo";

type NavItemConfig = {
  to: string;
  label: string;
  icon: string;
  badge?: number;
  end?: boolean;
};

const navItems: NavItemConfig[] = [
  { to: "/", label: "Dashboard", icon: "◊", end: true },
  { to: "/customers", label: "Müşteriler", icon: "◉" },
  { to: "/finances", label: "Finans", icon: "◈" },
  { to: "/reminders", label: "Hatırlatıcılar", icon: "◐" },
  { to: "/whatsapp", label: "WhatsApp", icon: "◎" },
  { to: "/settings", label: "Ayarlar", icon: "◇" }
];

export default function Sidebar() {
  return (
    <aside
      className="relative hidden h-screen shrink-0 flex-col border-r md:sticky md:top-0 md:flex md:w-20 xl:w-64"
      style={{ background: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}
    >
      <div className="border-b p-4 xl:p-6" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center justify-center gap-3 xl:justify-start">
          <Logo size={36} />
          <div className="hidden xl:block">
            <div className="font-display text-xl font-semibold tracking-tight">FreelanceOS</div>
            <div className="text-xs" style={{ color: "var(--foreground-tertiary)" }}>
              v2.4.1
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-2 xl:p-4">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="group relative block w-full">
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span
                    className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full"
                    style={{
                      background: "linear-gradient(180deg, var(--accent-from) 0%, var(--accent-to) 100%)",
                      boxShadow: "0 0 12px var(--primary-glow)"
                    }}
                  />
                ) : null}

                <div
                  className="flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 xl:justify-start xl:px-4"
                  style={{
                    background: isActive ? "var(--sidebar-accent)" : "transparent",
                    color: isActive ? "var(--sidebar-accent-foreground)" : "var(--sidebar-foreground)"
                  }}
                >
                  <span className="text-lg transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
                  <span className="hidden flex-1 text-left text-sm font-medium xl:block">{item.label}</span>
                  {item.badge ? (
                    <span
                      className="hidden rounded-full px-2 py-0.5 text-xs xl:block"
                      style={{
                        background: isActive
                          ? "linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%)"
                          : "var(--surface)",
                        color: "#ffffff",
                        fontSize: "0.7rem",
                        fontWeight: 600
                      }}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>

                <div
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background: "rgba(124, 58, 237, 0.05)",
                    border: "1px solid rgba(124, 58, 237, 0.1)"
                  }}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3 xl:p-4" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="rounded-lg px-3 py-3 xl:px-4" style={{ background: "var(--surface)" }}>
          <div className="flex items-center justify-center gap-3 xl:justify-start">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%)" }}
            >
              <span className="text-sm">JD</span>
            </div>
            <div className="hidden min-w-0 flex-1 xl:block">
              <div className="truncate text-sm" style={{ color: "var(--foreground)" }}>
                John Doe
              </div>
              <div className="truncate text-xs" style={{ color: "var(--foreground-tertiary)" }}>
                john@example.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
