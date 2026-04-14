import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base"
};

function variantStyle(variant: ButtonVariant): CSSProperties {
  switch (variant) {
    case "primary":
      return {
        background: "linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%)",
        color: "#ffffff",
        border: "none",
        boxShadow: "0 4px 16px var(--primary-glow)"
      };
    case "secondary":
      return {
        background: "var(--surface)",
        color: "var(--foreground)",
        border: "1px solid var(--border)"
      };
    case "danger":
      return {
        background: "var(--error)",
        color: "#ffffff",
        border: "none",
        boxShadow: "0 4px 16px var(--error-glow)"
      };
    case "ghost":
    default:
      return {
        background: "transparent",
        color: "var(--foreground-secondary)",
        border: "1px solid transparent"
      };
  }
}

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        {
          "hover:scale-[1.02]": variant === "primary" || variant === "danger",
          "hover:-translate-y-px": variant === "secondary",
          "hover:bg-[var(--surface)]/70 hover:text-[var(--foreground)]": variant === "ghost"
        },
        className
      )}
      style={{ ...variantStyle(variant), ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
