"use client";

import { useLocale, useTranslations } from "next-intl";
import { signOut } from "@/lib/auth/actions";
import { buttonVariants } from "@/components/ui/button";

export function SignOutButton() {
  const t = useTranslations("auth");
  const locale = useLocale();

  async function handleClick() {
    await signOut();
    window.location.href = `/${locale}`;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={buttonVariants({ variant: "secondary" })}
    >
      {t("signOut")}
    </button>
  );
}
