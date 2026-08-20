import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getPublishedArticles } from "@/lib/news/queries";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");

  const articles = await getPublishedArticles(locale as Locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6 flex flex-col gap-4">
        {articles.length === 0 && <p className="text-muted-foreground">{t("empty")}</p>}
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/actualites/${article.slug}`}
            className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-surface"
          >
            {article.imageUrl && (
              <Image
                src={article.imageUrl}
                alt=""
                width={96}
                height={96}
                className="size-24 shrink-0 rounded-md object-cover"
              />
            )}
            <div>
              <p className="font-medium text-foreground">{article.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(article.createdAt).toLocaleDateString(locale)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
