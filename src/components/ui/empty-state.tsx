type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: string;
};

export default function EmptyState({ title, description, icon = "◇" }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-12 text-center"
      style={{ borderColor: "var(--border-strong)", background: "rgba(26, 31, 46, 0.35)" }}
    >
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-xl"
        style={{
          background: "linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%)",
          color: "#ffffff",
          boxShadow: "0 0 20px var(--primary-glow)"
        }}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
        {title}
      </p>
      {description ? (
        <p className="mt-2 text-xs" style={{ color: "var(--foreground-tertiary)" }}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
