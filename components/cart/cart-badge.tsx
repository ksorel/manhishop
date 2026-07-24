"use client";

import { useCart } from "@/components/cart/cart-provider";

export function CartBadge() {
  const { totalCount } = useCart();

  if (totalCount === 0) return null;

  return (
    <span className="absolute -right-2 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-medium leading-[18px] text-primary-foreground">
      {totalCount > 99 ? "99+" : totalCount}
    </span>
  );
}
