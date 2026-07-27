"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signUp } from "@/lib/auth/actions";
import { finishLoginAndRedirect } from "@/components/auth/finish-login";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/lib/catalogue/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function SignupForm() {
  const t = useTranslations("auth");
  const locale = useLocale() as Locale;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await signUp({ email, password, fullName });

    if (result.code) {
      setError(t(`errors.${result.code}`));
      setPending(false);
      return;
    }

    if (result.needsEmailConfirmation) {
      setNeedsConfirmation(true);
      setPending(false);
      return;
    }

    await finishLoginAndRedirect(locale, `/${locale}/compte`);
  }

  if (needsConfirmation) {
    return <p className="text-foreground">{t("signup.confirmEmail")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-foreground">{t("signup.title")}</h1>

      {error && <p className="text-sm font-medium text-error">{error}</p>}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("signup.fullName")}</span>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("signup.email")}</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("signup.password")}</span>
        <input
          type="password"
          required
          minLength={6}
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
        {t("signup.submit")}
      </button>

      <p className="text-sm text-muted-foreground">
        {t("signup.hasAccount")}{" "}
        <Link href="/connexion" className="text-primary hover:underline">
          {t("signup.login")}
        </Link>
      </p>
    </form>
  );
}
