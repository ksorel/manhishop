import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminSizeGuides } from "@/lib/admin/size-guides";
import { SizeGuideManager } from "@/components/admin/size-guide-manager";

export default async function AdminSizeGuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.sizeGuides");
  const guides = await getAdminSizeGuides();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        <SizeGuideManager initialGuides={guides} />
      </div>
    </div>
  );
}
