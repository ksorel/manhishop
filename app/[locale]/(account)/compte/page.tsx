import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { ProfileForm } from "@/components/auth/profile-form";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/connexion`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>

      <div className="mt-6">
        <ProfileForm
          email={user.email ?? ""}
          initialFullName={profile?.full_name ?? ""}
          initialPhone={profile?.phone ?? ""}
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 text-sm">
        <Link href="/commandes" className="text-primary hover:underline">
          {t("orders")}
        </Link>
        <Link href="/adresses" className="text-primary hover:underline">
          {t("addresses")}
        </Link>
        <Link href="/favoris" className="text-primary hover:underline">
          {t("wishlist")}
        </Link>
      </div>

      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  );
}
