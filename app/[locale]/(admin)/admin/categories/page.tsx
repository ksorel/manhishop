import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminCategories } from "@/lib/admin/categories";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.categories");
  const categories = await getAdminCategories();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        <CategoryManager initialCategories={categories} />
      </div>
    </div>
  );
}
