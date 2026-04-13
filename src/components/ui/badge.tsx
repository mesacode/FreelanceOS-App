<<<<<<< ours
<<<<<<< ours
import clsx from "clsx";
import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant?: "default" | "success" | "warning";
};

export default function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={clsx("inline-flex rounded-full px-3 py-1 text-xs font-medium", {
        "bg-muted text-subtext": variant === "default",
        "bg-emerald-500/15 text-emerald-400": variant === "success",
        "bg-amber-500/15 text-amber-400": variant === "warning"
      })}
    >
      {children}
    </span>
  );
}
=======
export function Badge() {
  return <div>Badge</div>;
}
>>>>>>> theirs
=======
export function Badge() {
  return <div>Badge</div>;
}
>>>>>>> theirs
