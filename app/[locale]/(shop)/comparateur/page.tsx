import { getTranslations, setRequestLocale } from "next-intl/server";
import { CompareView } from "@/components/shop/compare-view";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("compare");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        <CompareView />
      </div>
    </div>
  );
}
