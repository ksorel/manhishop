import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminNewsArticles } from "@/lib/admin/news-articles";
import { NewsArticleManager } from "@/components/admin/news-article-manager";

export default async function AdminNewsArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.articles");
  const articles = await getAdminNewsArticles();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        <NewsArticleManager initialArticles={articles} />
      </div>
    </div>
  );
}
