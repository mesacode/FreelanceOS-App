<<<<<<< ours
<<<<<<< ours
import { NavLink } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  MessageCircleMore,
  Settings,
  Users,
  Wallet
} from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Musteriler", icon: Users },
  { to: "/finances", label: "Finans", icon: Wallet },
  { to: "/reminders", label: "Hatirlaticilar", icon: Bell },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircleMore },
  { to: "/settings", label: "Ayarlar", icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="w-72 border-r border-border bg-panel/80 p-4">
      <div className="mb-8 px-3 pt-3">
        <h1 className="text-2xl font-semibold tracking-tight">FreelanceOS</h1>
        <p className="mt-1 text-sm text-subtext">Freelancer kontrol paneli</p>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                  isActive
                    ? "bg-accent text-white shadow-soft"
                    : "text-subtext hover:bg-muted hover:text-text"
                }`
              }
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
=======
export function Sidebar() {
  return <div>Sidebar</div>;
>>>>>>> theirs
=======
export function Sidebar() {
  return <div>Sidebar</div>;
>>>>>>> theirs
}
