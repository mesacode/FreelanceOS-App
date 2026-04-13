<<<<<<< ours
<<<<<<< ours
import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-2xl px-4 py-2 text-sm font-medium transition",
        {
          "bg-accent text-white hover:opacity-90": variant === "primary",
          "bg-muted text-text hover:bg-border": variant === "secondary",
          "text-subtext hover:bg-muted hover:text-text": variant === "ghost"
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
=======
export function Button() {
  return <div>Button</div>;
}
>>>>>>> theirs
=======
export function Button() {
  return <div>Button</div>;
}
>>>>>>> theirs
