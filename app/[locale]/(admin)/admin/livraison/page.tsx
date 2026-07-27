import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminShippingRates } from "@/lib/admin/shipping";
import { ShippingRateManager } from "@/components/admin/shipping-rate-manager";

export default async function AdminShippingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.shipping");

  const rates = await getAdminShippingRates();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        <ShippingRateManager initialRates={rates} />
      </div>
    </div>
  );
}
