import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/ui/coming-soon";

export default async function CataloguePage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("catalogue");

  return <ComingSoon title={t("title")} message={t("comingSoon")} />;
}
