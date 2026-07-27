"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { createUserAccount, type UserRole } from "@/lib/admin/users";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const t = useTranslations("admin.users");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await createUserAccount({ email, password, fullName, role });

    if (result.code) {
      setError(t(`createErrors.${result.code}`));
      setPending(false);
      return;
    }

    setFullName("");
    setEmail("");
    setPassword("");
    setRole("admin");
    setPending(false);
    onCreated();
  }

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-foreground">{t("create")}</h2>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        {error && <p className="text-sm font-medium text-error">{error}</p>}

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("fullName")}</span>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("email")}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("password")}</span>
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
          <span className="text-foreground">{t("roleLabel")}</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className={inputClass}
          >
            <option value="admin">{t("role.admin")}</option>
            <option value="customer">{t("role.customer")}</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={pending}
          className={buttonVariants({ variant: "primary", className: "self-start" })}
        >
          {t("create")}
        </button>
      </form>
    </Card>
  );
}
