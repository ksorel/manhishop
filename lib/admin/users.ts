"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserRole = "customer" | "admin";
export type CreateUserErrorCode = "unauthorized" | "user_exists" | "weak_password" | "unknown";

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  createdAt: string;
}

export async function getAdminUsers(): Promise<AdminUserSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) throw error;

  return (data ?? []).map(
    (row: {
      id: string;
      email: string;
      full_name: string | null;
      role: UserRole;
      created_at: string;
    }) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      createdAt: row.created_at,
    }),
  );
}

export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_user_role", {
    target_user_id: userId,
    new_role: role,
  });
  if (error) throw error;
}

/**
 * Crée directement un compte (email + mot de passe) sans passer par
 * l'inscription publique — utile pour donner l'accès admin à quelqu'un
 * sans qu'il ait besoin de créer d'abord un compte client. Utilise la
 * clé service_role (nécessaire pour définir un mot de passe et
 * confirmer l'email directement), donc on vérifie nous-mêmes que
 * l'appelant est bien admin avant de continuer.
 */
export async function createUserAccount(input: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}): Promise<{ code: CreateUserErrorCode | null }> {
  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();
  if (!caller) return { code: "unauthorized" };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .maybeSingle();

  if (callerProfile?.role !== "admin") return { code: "unauthorized" };

  if (input.password.length < 6) return { code: "weak_password" };

  const admin = createAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      return { code: "user_exists" };
    }
    return { code: "unknown" };
  }

  if (input.role === "admin") {
    const { error: roleError } = await admin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", created.user.id);
    if (roleError) return { code: "unknown" };
  }

  return { code: null };
}
