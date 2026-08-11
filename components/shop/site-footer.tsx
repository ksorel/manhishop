"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("nav");

  return (
    <footer className="mt-12 border-t border-border px-4 py-6 text-center text-sm text-muted-foreground">
      <Link href="/guide-tailles" className="hover:text-foreground hover:underline">
        {t("sizeGuide")}
      </Link>
    </footer>
  );
}
