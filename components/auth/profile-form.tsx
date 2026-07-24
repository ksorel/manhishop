"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { updateProfile } from "@/lib/auth/actions";
import { buttonVariants } from "@/components/ui/button";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function ProfileForm({
  email,
  initialFullName,
  initialPhone,
}: {
  email: string;
  initialFullName: string;
  initialPhone: string;
}) {
  const t = useTranslations("account.profile");
  const tErrors = useTranslations("auth.errors");
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const result = await updateProfile({ fullName, phone });
    setMessage(result.code ? tErrors(result.code) : t("saved"));
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {message && <p className="text-sm text-foreground">{message}</p>}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("email")}</span>
        <input type="email" value={email} disabled className={`${inputClass} opacity-60`} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("fullName")}</span>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("phone")}</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className={buttonVariants({ variant: "primary", className: "self-start" })}
      >
        {t("save")}
      </button>
    </form>
  );
}
