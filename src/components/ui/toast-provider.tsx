import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

type ToastType = "success" | "error" | "info" | "warning";

type ToastInput = {
  title: string;
  description?: string;
  type?: ToastType;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: string;
  type: ToastType;
};

type ToastContextValue = {
  show: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string; iconColor: string }> = {
  success: {
    bg: "rgba(16, 185, 129, 0.15)",
    border: "var(--success)",
    icon: "✓",
    iconColor: "var(--success)"
  },
  error: {
    bg: "rgba(239, 68, 68, 0.15)",
    border: "var(--error)",
    icon: "✕",
    iconColor: "var(--error)"
  },
  warning: {
    bg: "rgba(245, 158, 11, 0.15)",
    border: "var(--warning)",
    icon: "!",
    iconColor: "var(--warning)"
  },
  info: {
    bg: "rgba(99, 102, 241, 0.15)",
    border: "var(--accent-from)",
    icon: "i",
    iconColor: "var(--accent-from)"
  }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutMap = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
    const timeoutId = timeoutMap.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timeoutMap.current[id];
    }
  }, []);

  const show = useCallback(
    (toast: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const durationMs = toast.durationMs ?? 3200;
      const nextToast: ToastItem = {
        ...toast,
        id,
        type: toast.type ?? "info"
      };

      setToasts((prev) => [...prev.slice(-3), nextToast]);
      timeoutMap.current[id] = window.setTimeout(() => remove(id), durationMs);
    },
    [remove]
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type];
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-4 rounded-xl p-4 animate-fadeIn"
              style={{
                background: "var(--background-elevated)",
                border: `1px solid ${style.border}`,
                boxShadow: "0 12px 48px rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)"
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  color: style.iconColor,
                  fontWeight: 700
                }}
              >
                {style.icon}
              </div>
              <div className="flex-1">
                <div
                  className="font-display mb-1"
                  style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}
                >
                  {toast.title}
                </div>
                {toast.description ? (
                  <p className="text-sm" style={{ color: "var(--foreground-secondary)" }}>
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded-lg p-1 transition-all hover:rotate-90"
                style={{ color: "var(--foreground-tertiary)" }}
                onClick={() => remove(toast.id)}
                aria-label="Kapat"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return context;
}
