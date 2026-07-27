import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminCategories } from "@/lib/admin/categories";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.products");
  const categories = await getAdminCategories();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("add")}</h1>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
