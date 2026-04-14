import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl"
};

export default function Modal({ open, title, children, onClose, size = "md" }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 xl:p-8 animate-fadeIn"
      style={{ background: "rgba(10, 14, 26, 0.8)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className={`w-full ${sizeClasses[size]} max-h-[92vh] overflow-y-auto rounded-2xl`}
        style={{
          background: "var(--background-elevated)",
          border: "1px solid var(--border-strong)",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)"
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4 md:p-6" style={{ borderColor: "var(--border)" }}>
          <h2
            className="font-display tracking-tight"
            style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--foreground)" }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-all hover:rotate-90"
            style={{ background: "var(--surface)", color: "var(--foreground-secondary)" }}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

