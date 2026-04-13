import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

type ToastType = "success" | "error" | "info";

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
      <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-soft ${
              toast.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                : toast.type === "error"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-100"
                  : "border-border bg-panel text-text"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-xs text-subtext">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs text-subtext hover:bg-muted"
                onClick={() => remove(toast.id)}
              >
                Kapat
              </button>
            </div>
          </div>
        ))}
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
