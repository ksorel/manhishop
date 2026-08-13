import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogueImportForm } from "@/components/admin/catalogue-import-form";

export default async function CatalogueImportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.catalogueImport");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("intro")}</p>
      <div className="mt-6">
        <CatalogueImportForm />
      </div>
    </div>
  );
}
