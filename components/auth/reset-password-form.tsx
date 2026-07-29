"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { updatePassword } from "@/lib/auth/actions";
import { finishLoginAndRedirect } from "@/components/auth/finish-login";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/catalogue/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale() as Locale;
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "ready" : "invalid");
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("resetPassword.mismatch"));
      return;
    }

    setPending(true);
    const result = await updatePassword({ password });

    if (result.code) {
      setError(t(`errors.${result.code}`));
      setPending(false);
      return;
    }

    await finishLoginAndRedirect(locale, `/${locale}/compte`);
  }

  if (status === "checking") {
    return <p className="text-sm text-muted-foreground">{t("resetPassword.checking")}</p>;
  }

  if (status === "invalid") {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold text-foreground">{t("resetPassword.title")}</h1>
        <p className="text-sm text-error">{t("resetPassword.invalidLink")}</p>
        <Link href="/mot-de-passe-oublie" className="text-sm text-primary hover:underline">
          {t("resetPassword.requestNewLink")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-foreground">{t("resetPassword.title")}</h1>

      {error && <p className="text-sm font-medium text-error">{error}</p>}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("resetPassword.newPassword")}</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("resetPassword.confirmPassword")}</span>
        <input
          type="password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
        />
      </label>

      <Button type="submit" loading={pending}>
        {t("resetPassword.submit")}
      </Button>
    </form>
  );
}
