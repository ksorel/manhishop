import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getAddresses } from "@/lib/addresses/actions";
import { getShippingRates } from "@/lib/shipping/queries";
import { getLoyaltyBalance } from "@/lib/loyalty/queries";
import { CheckoutView } from "@/components/shop/checkout-view";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [addresses, shippingRates, loyaltyBalance] = await Promise.all([
    getAddresses().then((a) => a ?? []),
    getShippingRates(),
    user ? getLoyaltyBalance(user.id) : Promise.resolve(0),
  ]);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        <CheckoutView
          initialEmail={user?.email ?? ""}
          savedAddresses={addresses}
          shippingRates={shippingRates}
          loyaltyBalance={loyaltyBalance}
        />
      </div>
    </div>
  );
}
