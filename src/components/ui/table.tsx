import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type TableProps = {
  head: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Table({ head, children, className }: TableProps) {
  return (
    <div
      className={clsx("overflow-hidden rounded-2xl", className)}
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)"
      }}
    >
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="border-b" style={{ borderColor: "var(--border)" }}>
            {head}
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

export function TableHeadRow({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "grid items-center px-6 py-3 text-xs uppercase tracking-wider",
        className
      )}
      style={{ color: "var(--foreground-tertiary)", fontWeight: 600, ...style }}
      {...props}
    />
  );
}

export function TableRow({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "grid items-center px-6 py-4 text-sm transition-colors last:border-b-0 hover:bg-white/[0.02]",
        "border-b",
        className
      )}
      style={{ borderColor: "var(--border)", color: "var(--foreground)", ...style }}
      {...props}
    />
  );
}
