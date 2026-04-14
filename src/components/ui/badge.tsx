import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantStyles: Record<BadgeVariant, { background: string; color: string }> = {
  default: {
    background: "rgba(100, 116, 139, 0.15)",
    color: "var(--foreground-tertiary)"
  },
  success: {
    background: "rgba(16, 185, 129, 0.15)",
    color: "var(--success)"
  },
  warning: {
    background: "rgba(245, 158, 11, 0.15)",
    color: "var(--warning)"
  },
  error: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "var(--error)"
  },
  info: {
    background: "rgba(99, 102, 241, 0.15)",
    color: "var(--accent-from)"
  }
};

export default function Badge({ children, variant = "default" }: BadgeProps) {
  const style = variantStyles[variant];
  return (
    <span
      className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs uppercase tracking-wider"
      style={{
        background: style.background,
        color: style.color,
        fontWeight: 600
      }}
    >
      {children}
    </span>
  );
}
