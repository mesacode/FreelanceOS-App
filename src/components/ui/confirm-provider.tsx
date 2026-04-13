import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import Button from "./button";
import Modal from "./modal";

type ConfirmInput = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ConfirmContextValue = {
  confirm: (input: ConfirmInput) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

type PendingConfirm = ConfirmInput & {
  resolve: (value: boolean) => void;
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((input: ConfirmInput) => {
    return new Promise<boolean>((resolve) => {
      setPending({
        ...input,
        resolve
      });
    });
  }, []);

  const closeWith = useCallback((value: boolean) => {
    setPending((current) => {
      if (current) {
        current.resolve(value);
      }
      return null;
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        open={Boolean(pending)}
        title={pending?.title ?? "Onay"}
        onClose={() => closeWith(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-subtext">{pending?.description}</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => closeWith(false)}>
              {pending?.cancelLabel ?? "Vazgec"}
            </Button>
            <Button onClick={() => closeWith(true)}>
              {pending?.confirmLabel ?? "Onayla"}
            </Button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used inside ConfirmProvider.");
  }
  return context;
}
