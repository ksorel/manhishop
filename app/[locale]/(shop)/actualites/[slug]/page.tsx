import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getArticleBySlug } from "@/lib/news/queries";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, locale as Locale);
  return { title: article ? `${article.title} — Manhishop` : "Manhishop" };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");

  const article = await getArticleBySlug(slug, locale as Locale);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/actualites" className="text-sm text-primary hover:underline">
        ← {t("backToList")}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-foreground">{article.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {new Date(article.createdAt).toLocaleDateString(locale)}
      </p>

      {article.imageUrl && (
        <Image
          src={article.imageUrl}
          alt=""
          width={640}
          height={360}
          className="mt-6 h-auto w-full rounded-lg object-cover"
        />
      )}

      <p className="mt-6 whitespace-pre-line text-foreground">{article.body}</p>
    </div>
  );
}
