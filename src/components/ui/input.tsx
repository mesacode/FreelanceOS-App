import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

export default function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none placeholder:text-subtext focus:border-accent",
        className
      )}
      {...props}
    />
  );
}