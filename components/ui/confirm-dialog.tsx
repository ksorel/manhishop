"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmOptions {
  message: string;
  danger?: boolean;
}

type ConfirmFn = (options: string | ConfirmOptions) => Promise<boolean>;

const ConfirmDialogContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  }
  return ctx;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  const [pendingConfirm, setPendingConfirm] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    const normalized = typeof options === "string" ? { message: options } : options;
    return new Promise<boolean>((resolve) => {
      setPendingConfirm({ options: normalized, resolve });
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      pendingConfirm?.resolve(result);
      setPendingConfirm(null);
    },
    [pendingConfirm],
  );

  useEffect(() => {
    if (!pendingConfirm) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pendingConfirm, close]);

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      {pendingConfirm && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-describedby="confirm-dialog-message"
            className="w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p id="confirm-dialog-message" className="text-sm text-foreground">
              {pendingConfirm.options.message}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => close(false)}
                className={buttonVariants({ variant: "text" })}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={cn(
                  buttonVariants({ variant: pendingConfirm.options.danger ? undefined : "primary" }),
                  pendingConfirm.options.danger &&
                    "bg-error text-error-foreground hover:opacity-90 active:opacity-80",
                )}
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}
