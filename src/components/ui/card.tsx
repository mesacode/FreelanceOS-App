<<<<<<< ours
<<<<<<< ours
import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export default function Card({ title, description, children }: CardProps) {
  return (
    <div className="rounded-3xl border border-border bg-panel p-5 shadow-soft">
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          {description && <p className="mt-1 text-sm text-subtext">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
=======
export function Card() {
  return <div>Card</div>;
}
>>>>>>> theirs
=======
export function Card() {
  return <div>Card</div>;
}
>>>>>>> theirs
