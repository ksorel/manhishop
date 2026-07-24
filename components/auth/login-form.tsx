"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signIn } from "@/lib/auth/actions";
import { finishLoginAndRedirect } from "@/components/auth/finish-login";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/lib/catalogue/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale() as Locale;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await signIn({ email, password });

    if (result.code) {
      setError(t(`errors.${result.code}`));
      setPending(false);
      return;
    }

    await finishLoginAndRedirect(locale, `/${locale}/compte`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">{t("login.title")}</h1>

      {error && <p className="text-sm font-medium text-error">{error}</p>}

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

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("login.password")}</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className={buttonVariants({ variant: "primary" })}
      >
        {t("login.submit")}
      </button>

      <p className="text-sm text-muted-foreground">
        {t("login.noAccount")}{" "}
        <Link href="/inscription" className="text-primary hover:underline">
          {t("login.createAccount")}
        </Link>
      </p>
    </form>
  );
}
