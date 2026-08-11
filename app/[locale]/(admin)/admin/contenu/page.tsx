import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminFooterContent, getAdminHomeContent } from "@/lib/admin/content";
import { HomeContentForm } from "@/components/admin/home-content-form";
import { FooterContentForm } from "@/components/admin/footer-content-form";

export default async function AdminContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.content");

  const [homeContent, footerContent] = await Promise.all([
    getAdminHomeContent(),
    getAdminFooterContent(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>

      <h2 className="mt-8 text-lg font-semibold text-foreground">{t("heroSection")}</h2>
      <div className="mt-4">
        <HomeContentForm initialContent={homeContent} />
      </div>

      <h2 className="mt-10 border-t border-border pt-8 text-lg font-semibold text-foreground">
        {t("footerSection")}
      </h2>
      <div className="mt-4">
        <FooterContentForm initialContent={footerContent} />
      </div>
    </div>
  );
}
