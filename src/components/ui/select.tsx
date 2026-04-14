import clsx from "clsx";
import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className, children, style, ...props }: SelectProps) {
  return (
    <select
      className={clsx(
        "w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2",
        className
      )}
      style={{
        background: "var(--input-background)",
        border: "1px solid var(--border)",
        color: "var(--foreground)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        ...style
      }}
      {...props}
    >
      {children}
    </select>
  );
}
