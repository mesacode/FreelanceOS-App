type StatTone = "primary" | "success" | "warning" | "error";
type StatChangeType = "positive" | "negative" | "neutral";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: string;
  tone?: StatTone;
  change?: string;
  changeType?: StatChangeType;
};

const toneColors: Record<StatTone, { from: string; to: string; glow: string }> = {
  primary: { from: "var(--accent-from)", to: "var(--accent-to)", glow: "var(--primary-glow)" },
  success: { from: "#10b981", to: "#059669", glow: "var(--success-glow)" },
  warning: { from: "#f59e0b", to: "#d97706", glow: "var(--warning-glow)" },
  error: { from: "#ef4444", to: "#dc2626", glow: "var(--error-glow)" }
};

export default function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "primary",
  change,
  changeType = "neutral"
}: StatCardProps) {
  const colors = toneColors[tone];
  const changeBg =
    changeType === "positive"
      ? "rgba(16, 185, 129, 0.15)"
      : changeType === "negative"
        ? "rgba(239, 68, 68, 0.15)"
        : "rgba(148, 163, 184, 0.15)";
  const changeColor =
    changeType === "positive"
      ? "var(--success)"
      : changeType === "negative"
        ? "var(--error)"
        : "var(--foreground-secondary)";
  const changeSymbol =
    changeType === "positive" ? "\u2191" : changeType === "negative" ? "\u2193" : "\u2192";

  return (
    <div
      className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${colors.from}10 0%, ${colors.to}10 100%)`
        }}
      />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1 text-sm" style={{ color: "var(--foreground-secondary)" }}>
              {label}
            </div>
            <div
              className="font-display leading-none tracking-tight"
              style={{
                fontSize: "clamp(1.75rem, 2.8vw, 2rem)",
                fontWeight: 600,
                color: "var(--foreground)",
                overflowWrap: "anywhere"
              }}
            >
              {value}
            </div>
          </div>

          {icon ? (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                boxShadow: `0 0 24px ${colors.glow}`,
                color: "#ffffff"
              }}
            >
              {icon}
            </div>
          ) : null}
        </div>

        {change ? (
          <div className="flex items-center gap-2">
            <span
              className="rounded-lg px-2 py-1 text-sm"
              style={{ background: changeBg, color: changeColor }}
            >
              {changeSymbol} {change}
            </span>
            {hint ? (
              <span className="text-xs" style={{ color: "var(--foreground-tertiary)" }}>
                {hint}
              </span>
            ) : null}
          </div>
        ) : hint ? (
          <p className="text-xs" style={{ color: "var(--foreground-tertiary)" }}>
            {hint}
          </p>
        ) : null}
      </div>

      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-full rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)"
        }}
      />
    </div>
  );
}
