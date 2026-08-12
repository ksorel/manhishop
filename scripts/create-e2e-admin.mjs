// Crée (ou met à jour le mot de passe d') un compte admin dédié aux tests
// e2e Playwright — distinct du vrai compte admin, jamais utilisé pour de
// vraies données. Nécessite E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD ainsi que
// SUPABASE_SERVICE_ROLE_KEY dans .env.local.
//
// Usage : node scripts/create-e2e-admin.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    }),
);

const email = env.E2E_ADMIN_EMAIL;
const password = env.E2E_ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD manquants dans .env.local");
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list, error: listError } = await supabase.auth.admin.listUsers();
if (listError) throw listError;
let user = list.users.find((u) => u.email === email);

if (user) {
  console.log("Utilisateur existant, mise à jour du mot de passe :", user.id);
  const { error } = await supabase.auth.admin.updateUserById(user.id, { password });
  if (error) throw error;
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "E2E Admin (test)" },
  });
  if (error) throw error;
  user = data.user;
  console.log("Utilisateur créé :", user.id);
}

const { error: profileError } = await supabase
  .from("profiles")
  .update({ role: "admin" })
  .eq("id", user.id);
if (profileError) throw profileError;

console.log("Rôle admin confirmé pour", email);
