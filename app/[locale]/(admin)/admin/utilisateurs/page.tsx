import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminUsers } from "@/lib/admin/users";
import { Card } from "@/components/ui/card";
import { UserRoleToggle } from "@/components/admin/user-role-toggle";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.users");

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const users = await getAdminUsers();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>

      <ul className="mt-6 flex flex-col gap-2">
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
                disabled={user.id === currentUser?.id}
              />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
