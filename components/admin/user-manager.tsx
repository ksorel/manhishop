"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { UserRoleToggle } from "@/components/admin/user-role-toggle";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { getAdminUsers, type AdminUserSummary } from "@/lib/admin/users";

export function UserManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: AdminUserSummary[];
  currentUserId: string | undefined;
}) {
  const t = useTranslations("admin.users");
  const [users, setUsers] = useState(initialUsers);

  async function refresh() {
    setUsers(await getAdminUsers());
  }

  return (
    <div className="flex flex-col gap-6">
      <CreateUserForm onCreated={refresh} />

      <ul className="flex flex-col gap-2">
        {users.map((user) => (
          <li key={user.id}>
            <Card className="flex items-center justify-between gap-3 p-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.fullName ?? "—"} · {t(`role.${user.role}`)}
                </p>
              </div>
              <UserRoleToggle
                userId={user.id}
                role={user.role}
                disabled={user.id === currentUserId}
              />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
