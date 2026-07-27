"use server";

import { createClient } from "@/lib/supabase/server";

export type UserRole = "customer" | "admin";

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
