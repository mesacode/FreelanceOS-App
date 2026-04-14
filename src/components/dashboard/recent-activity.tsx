import type { ActivityItem } from "../../../shared/dashboard";
import EmptyState from "../ui/empty-state";

function formatDate(value: string) {
  return new Date(value).toLocaleString("tr-TR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

type RecentActivityProps = {
  items: ActivityItem[];
  loading?: boolean;
};

function normalizeActivityText(text: string) {
  return text
    .replace(/Musteri/g, "Müşteri")
    .replace(/musteri/g, "müşteri")
    .replace(/guncellendi/g, "güncellendi")
    .replace(/kaydi/g, "kaydı")
    .replace(/Hatirlatma/g, "Hatırlatma")
    .replace(/hatirlatma/g, "hatırlatma")
    .replace(/sablonu/g, "şablonu")
    .replace(/Ayar guncellendi/g, "Ayar güncellendi");
}

function iconForEntity(entityType: string | undefined | null) {
  const type = (entityType ?? "").toUpperCase();
  if (type.includes("INCOME") || type.includes("EXPENSE") || type.includes("PAYMENT")) return "\u25C8";
  if (type.includes("REMINDER")) return "\u25D0";
  if (type.includes("CUSTOMER")) return "\u25C9";
  if (type.includes("WHATSAPP") || type.includes("MESSAGE")) return "\u25CE";
  return "\u25CA";
}

function statusStyleForEntity(entityType: string | undefined | null) {
  const type = (entityType ?? "").toUpperCase();
  if (type.includes("INCOME") || type.includes("CUSTOMER")) {
    return {
      bg: "rgba(16, 185, 129, 0.15)",
      border: "var(--success)",
      glow: "var(--success-glow)"
    };
  }
  if (type.includes("EXPENSE") || type.includes("REMINDER")) {
    return {
      bg: "rgba(245, 158, 11, 0.15)",
      border: "var(--warning)",
      glow: "var(--warning-glow)"
    };
  }
  return {
    bg: "rgba(99, 102, 241, 0.15)",
    border: "var(--accent-from)",
    glow: "var(--primary-glow)"
  };
}

export default function RecentActivity({ items, loading = false }: RecentActivityProps) {
  if (loading) {
    return <EmptyState title="Yükleniyor..." description="Aktiviteler getiriliyor." />;
  }

  if (items.length === 0) {
    return <EmptyState title="Henüz aktivite yok" description="İşlem yaptıkça burada görünecek." />;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const statusColor = statusStyleForEntity(item.entityType);

        return (
          <div
            key={item.id}
            className="group relative flex cursor-pointer gap-4 rounded-xl p-4 transition-all duration-200 hover:-translate-x-1"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)"
            }}
          >
            {index < items.length - 1 ? (
              <div
                className="absolute left-8 top-16 h-8 w-px"
                style={{
                  background: "linear-gradient(180deg, var(--border-strong) 0%, transparent 100%)"
                }}
              />
            ) : null}

            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg transition-transform duration-200 group-hover:scale-110"
              style={{
                background: statusColor.bg,
                border: `1px solid ${statusColor.border}`,
                boxShadow: `0 0 16px ${statusColor.glow}`,
                color: statusColor.border
              }}
            >
              {iconForEntity(item.entityType)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-start justify-between gap-2">
                <div className="font-medium" style={{ color: "var(--foreground)" }}>
                  {normalizeActivityText(item.title)}
                </div>
                <div className="whitespace-nowrap text-xs" style={{ color: "var(--foreground-tertiary)" }}>
                  {formatDate(item.createdAt)}
                </div>
              </div>
              {item.description ? (
                <p className="text-sm" style={{ color: "var(--foreground-secondary)" }}>
                  {normalizeActivityText(item.description)}
                </p>
              ) : null}
            </div>

            <div
              className="pointer-events-none absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background: "linear-gradient(180deg, var(--accent-from) 0%, var(--accent-to) 100%)",
                boxShadow: "0 0 12px var(--primary-glow)"
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
