"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { toggleWishlistItem } from "@/lib/wishlist/actions";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initialInWishlist = false,
  className,
}: {
  productId: string;
  initialInWishlist?: boolean;
  className?: string;
}) {
  const t = useTranslations("wishlist");
  const locale = useLocale();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await toggleWishlistItem(productId);
    setPending(false);

    if (result.status === "unauthenticated") {
      window.location.href = `/${locale}/connexion`;
      return;
    }

    setInWishlist(result.inWishlist);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={inWishlist ? t("remove") : t("add")}
      aria-pressed={inWishlist}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full bg-background/80 text-foreground hover:opacity-90",
        className,
      )}
    >
      <Heart
        className="size-5"
        fill={inWishlist ? "currentColor" : "none"}
        aria-hidden="true"
      />
    </button>
  );
}
