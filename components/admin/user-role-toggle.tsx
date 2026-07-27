"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { setUserRole, type UserRole } from "@/lib/admin/users";
import { buttonVariants } from "@/components/ui/button";

export function UserRoleToggle({
  userId,
  role: initialRole,
  disabled,
}: {
  userId: string;
  role: UserRole;
  disabled: boolean;
}) {
  const t = useTranslations("admin.users");
  const [role, setRole] = useState(initialRole);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    const nextRole: UserRole = role === "admin" ? "customer" : "admin";
    if (!window.confirm(t(nextRole === "admin" ? "confirmPromote" : "confirmDemote"))) return;

    setPending(true);
    await setUserRole(userId, nextRole);
    setRole(nextRole);
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
      className={buttonVariants({
        variant: role === "admin" ? "text" : "secondary",
        className: role === "admin" ? "text-error" : undefined,
      })}
    >
      {role === "admin" ? t("revoke") : t("promote")}
    </button>
  );
}
