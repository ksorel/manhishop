"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { updatePassword } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function ChangePasswordForm() {
  const t = useTranslations("account.changePassword");
  const tErrors = useTranslations("auth.errors");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError(t("mismatch"));
      return;
    }

    setPending(true);
    const result = await updatePassword({ password });
    setPending(false);

    if (result.code) {
      setError(tErrors(result.code));
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setMessage(t("saved"));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>

      {message && <p className="text-sm text-foreground">{message}</p>}
      {error && <p className="text-sm font-medium text-error">{error}</p>}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("newPassword")}</span>
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
        <span className="text-foreground">{t("confirmPassword")}</span>
        <input
          type="password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
        />
      </label>

      <Button type="submit" loading={pending} className="self-start">
        {t("save")}
      </Button>
    </form>
  );
}
