import type { ReactNode } from "react";
import clsx from "clsx";

type CardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export default function Card({ title, description, children, action, className }: CardProps) {
  return (
    <div
      className={clsx("rounded-2xl p-6", className)}
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
      }}
    >
      {(title || description || action) && (
        <div
          className="mb-4 flex items-start justify-between gap-4 border-b pb-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            {title ? (
              <h3
                className="font-display tracking-tight"
                style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)" }}
              >
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm" style={{ color: "var(--foreground-tertiary)" }}>
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
}
