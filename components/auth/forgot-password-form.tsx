"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { requestPasswordReset } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/catalogue/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale() as Locale;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    await requestPasswordReset({ email, locale });
    setPending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold text-foreground">
          {t("forgotPassword.title")}
        </h1>
        <p className="text-sm text-foreground">{t("forgotPassword.sent")}</p>
        <Link href="/connexion" className="text-sm text-primary hover:underline">
          {t("forgotPassword.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-foreground">
        {t("forgotPassword.title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("forgotPassword.instructions")}</p>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("login.email")}</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>

      <Button type="submit" loading={pending}>
        {t("forgotPassword.submit")}
      </Button>

      <Link href="/connexion" className="text-sm text-primary hover:underline">
        {t("forgotPassword.backToLogin")}
      </Link>
    </form>
  );
}
