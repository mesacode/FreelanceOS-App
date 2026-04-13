<<<<<<< ours
<<<<<<< ours
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export default function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-panel p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-1 text-sm text-subtext hover:bg-muted hover:text-text"
          >
            Kapat
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
=======
export function Modal() {
  return <div>Modal</div>;
}
>>>>>>> theirs
=======
export function Modal() {
  return <div>Modal</div>;
}
>>>>>>> theirs
