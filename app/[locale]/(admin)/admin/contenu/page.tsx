import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminHomeContent } from "@/lib/admin/content";
import { HomeContentForm } from "@/components/admin/home-content-form";

export default async function AdminContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.content");

  const content = await getAdminHomeContent();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        <HomeContentForm initialContent={content} />
      </div>
    </div>
  );
}
