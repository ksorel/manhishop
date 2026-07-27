"use client";

import { useLocale, useTranslations } from "next-intl";
import { signOut } from "@/lib/auth/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();

  async function handleClick() {
    await signOut();
    window.location.href = `/${locale}/connexion`;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(buttonVariants({ variant: "secondary" }), className)}
    >
      {t("signOut")}
    </button>
  );
}
