"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthErrorCode =
  | "invalid_credentials"
  | "user_exists"
  | "weak_password"
  | "unknown";

function mapAuthError(message: string): AuthErrorCode {
  if (message.includes("Invalid login credentials")) return "invalid_credentials";
  if (message.includes("already registered")) return "user_exists";
  if (message.includes("Password should be at least")) return "weak_password";
  return "unknown";
}

export async function signUp(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<{ code: AuthErrorCode | null; needsEmailConfirmation: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.fullName } },
  });

  if (error) {
    return { code: mapAuthError(error.message), needsEmailConfirmation: false };
  }

  return { code: null, needsEmailConfirmation: !data.session };
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<{ code: AuthErrorCode | null; isAdmin: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(input);

  if (error) return { code: mapAuthError(error.message), isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  return { code: null, isAdmin: profile?.role === "admin" };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function requestPasswordReset(input: {
  email: string;
  locale: string;
}): Promise<{ code: AuthErrorCode | null }> {
  const supabase = await createClient();
  const requestHeaders = await headers();
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const origin = `${protocol}://${requestHeaders.get("host")}`;

  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${origin}/${input.locale}/reinitialiser-mot-de-passe`,
  });

  // Supabase ne signale jamais si l'email existe ou non (anti-énumération
  // de comptes) : on ne remonte donc qu'une erreur générique éventuelle,
  // jamais "email introuvable".
  return { code: error ? "unknown" : null };
}

export async function updatePassword(input: {
  password: string;
}): Promise<{ code: AuthErrorCode | null }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: input.password });

  return { code: error ? mapAuthError(error.message) : null };
}

export async function updateProfile(input: {
  fullName: string;
  phone: string;
}): Promise<{ code: AuthErrorCode | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { code: "unknown" };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: input.fullName, phone: input.phone })
    .eq("id", user.id);

  return { code: error ? "unknown" : null };
}
