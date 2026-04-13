import type { ActivityItem } from "../../../shared/dashboard";

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

export default function RecentActivity({ items, loading = false }: RecentActivityProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-subtext">
        Yukleniyor...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-subtext">
        Henuz aktivite yok.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium text-text">{item.title}</p>
          <p className="mt-1 text-xs text-subtext">{item.description}</p>
          <p className="mt-1 text-xs text-subtext">{formatDate(item.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}
