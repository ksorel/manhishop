"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { MAX_COMPARE, readCompareIds, writeCompareIds } from "@/lib/compare/storage";

interface CompareContextValue {
  ids: string[];
  isSelected: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within a CompareProvider");
  return ctx;
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  // Hydraté après montage seulement (localStorage indisponible côté serveur).
  useEffect(() => {
    Promise.resolve().then(() => setIds(readCompareIds()));
  }, []);

  function toggle(productId: string) {
    setIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, productId];
      writeCompareIds(next);
      return next;
    });
  }

  function remove(productId: string) {
    setIds((prev) => {
      const next = prev.filter((id) => id !== productId);
      writeCompareIds(next);
      return next;
    });
  }

  function clear() {
    setIds([]);
    writeCompareIds([]);
  }

  return (
    <CompareContext.Provider
      value={{
        ids,
        isSelected: (productId) => ids.includes(productId),
        toggle,
        remove,
        clear,
        isFull: ids.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}
