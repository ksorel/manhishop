import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { ProfileForm } from "@/components/auth/profile-form";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ReferralLink } from "@/components/account/referral-link";
import { getMyLoyaltySummary } from "@/lib/loyalty/actions";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const tLoyalty = await getTranslations("account.loyalty");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/connexion`);

  const [{ data: profile }, loyalty] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    getMyLoyaltySummary(),
  ]);

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

      <div className="mt-8 border-t border-border pt-6">
        <ChangePasswordForm />
      </div>

      {loyalty && (
        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground">{tLoyalty("title")}</h2>
          <p className="text-sm text-foreground">
            {tLoyalty("balance", {
              points: loyalty.balance,
              value: formatPrice(loyalty.balanceValueFcfa, locale as Locale),
            })}
          </p>
          <ReferralLink link={loyalty.referralLink} />
          <p className="text-xs text-muted-foreground">
            {tLoyalty("referredCount", { count: loyalty.referredCount })}
          </p>
        </div>
      )}

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
