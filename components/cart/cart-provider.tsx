"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { CartLine } from "@/lib/cart/types";
import type { Locale, ProductSummary } from "@/lib/catalogue/types";
import {
  addCartItem,
  getProductsForGuestCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/cart/actions";
import { clearGuestCart, readGuestCart, writeGuestCart } from "@/lib/cart/storage";
import { computeCartTotals } from "@/lib/cart/totals";

interface CartContextValue {
  items: CartLine[];
  isLoading: boolean;
  totalCount: number;
  totalPrice: number;
  addItem: (product: ProductSummary, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function persistGuestLines(lines: CartLine[]) {
  writeGuestCart(lines.map((l) => ({ productId: l.productId, quantity: l.quantity })));
}

export function CartProvider({
  userId,
  initialItems,
  locale,
  children,
}: {
  userId: string | null;
  initialItems: CartLine[];
  locale: Locale;
  children: React.ReactNode;
}) {
  const isAuthenticated = !!userId;
  const [items, setItems] = useState<CartLine[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const hydratedGuestCart = useRef(false);

  useEffect(() => {
    if (isAuthenticated || hydratedGuestCart.current) return;
    hydratedGuestCart.current = true;

    const entries = readGuestCart();
    if (entries.length === 0) return;

    getProductsForGuestCart(
      entries.map((entry) => entry.productId),
      locale,
    ).then((products) => {
      const lines = entries
        .map((entry) => {
          const product = products.find((p) => p.id === entry.productId);
          return product
            ? { productId: entry.productId, quantity: entry.quantity, product }
            : null;
        })
        .filter((line): line is CartLine => line !== null);
      setItems(lines);
      persistGuestLines(lines);
    });
  }, [isAuthenticated, locale]);

  async function addItem(product: ProductSummary, quantity = 1) {
    if (isAuthenticated) {
      setIsLoading(true);
      setItems(await addCartItem(product.id, quantity, locale));
      setIsLoading(false);
      return;
    }

    setItems((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      const next = existing
        ? prev.map((line) =>
            line.productId === product.id
              ? { ...line, quantity: line.quantity + quantity }
              : line,
          )
        : [...prev, { productId: product.id, quantity, product }];

      persistGuestLines(next);
      return next;
    });
  }

  async function updateQuantity(productId: string, quantity: number) {
    if (isAuthenticated) {
      setIsLoading(true);
      setItems(await updateCartItemQuantity(productId, quantity, locale));
      setIsLoading(false);
      return;
    }

    setItems((prev) => {
      const next =
        quantity <= 0
          ? prev.filter((line) => line.productId !== productId)
          : prev.map((line) => (line.productId === productId ? { ...line, quantity } : line));

      persistGuestLines(next);
      return next;
    });
  }

  async function removeItem(productId: string) {
    if (isAuthenticated) {
      setIsLoading(true);
      setItems(await removeCartItem(productId, locale));
      setIsLoading(false);
      return;
    }

    setItems((prev) => {
      const next = prev.filter((line) => line.productId !== productId);
      persistGuestLines(next);
      return next;
    });
  }

  function clearCart() {
    setItems([]);
    clearGuestCart();
  }

  const { totalCount, totalPrice } = computeCartTotals(items);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        totalCount,
        totalPrice,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
