"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/catalogue/types";

export function CategoryPills({
  categories,
  activeSlug,
  showAllPill = true,
}: {
  categories: Category[];
  activeSlug?: string;
  showAllPill?: boolean;
}) {
  const t = useTranslations("catalogue");
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    // Sur petit écran la liste défile horizontalement : sans ça, la
    // catégorie mise en évidence peut rester hors champ tant qu'on n'a
    // pas fait défiler à la main (sur grand écran tout est déjà visible).
    activeRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeSlug]);

  const pillClass = (active: boolean) =>
    cn(
      "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-foreground hover:bg-surface",
    );

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {showAllPill && (
        <Link
          href="/catalogue"
          ref={(el) => {
            if (!activeSlug) activeRef.current = el;
          }}
          className={pillClass(!activeSlug)}
        >
          {t("allCategories")}
        </Link>
      )}
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/catalogue/${category.slug}`}
          ref={(el) => {
            if (activeSlug === category.slug) activeRef.current = el;
          }}
          className={pillClass(activeSlug === category.slug)}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
