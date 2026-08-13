import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminPromoCodes } from "@/lib/admin/promo-codes";
import { PromoCodeManager } from "@/components/admin/promo-code-manager";

export default async function AdminPromoCodesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.promoCodes");
  const promoCodes = await getAdminPromoCodes();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        <PromoCodeManager initialPromoCodes={promoCodes} />
      </div>
    </div>
  );
}
