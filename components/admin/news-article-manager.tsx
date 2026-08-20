"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { NewsArticleForm } from "@/components/admin/news-article-form";
import { deleteNewsArticle, type AdminNewsArticle } from "@/lib/admin/news-articles";

export function NewsArticleManager({
  initialArticles,
}: {
  initialArticles: AdminNewsArticle[];
}) {
  const t = useTranslations("admin.articles");
  const confirm = useConfirm();
  const [articles, setArticles] = useState(initialArticles);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleCreated(article: AdminNewsArticle) {
    setArticles((prev) => [article, ...prev]);
    setAdding(false);
  }

  function handleUpdated(article: AdminNewsArticle) {
    setArticles((prev) => prev.map((a) => (a.id === article.id ? article : a)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!(await confirm({ message: t("confirmDelete"), danger: true }))) return;
    await deleteNewsArticle(id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      {articles.length === 0 && !adding && (
        <Card className="p-6 text-muted-foreground">{t("empty")}</Card>
      )}

      {articles.map((article) =>
        editingId === article.id ? (
          <Card key={article.id} className="p-4">
            <NewsArticleForm
              initialArticle={article}
              onDone={handleUpdated}
              onCancel={() => setEditingId(null)}
            />
          </Card>
        ) : (
          <Card key={article.id} className="flex items-center justify-between gap-3 p-4 text-sm">
            <div>
              <p className="font-medium text-foreground">{article.titleFr}</p>
              <p className="text-xs text-muted-foreground">
                {article.status === "active" ? t("active") : t("draft")}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setEditingId(article.id)}
                className="text-primary hover:underline"
              >
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(article.id)}
                className="text-error hover:underline"
              >
                {t("delete")}
              </button>
            </div>
          </Card>
        ),
      )}

      {adding ? (
        <Card className="p-4">
          <NewsArticleForm onDone={handleCreated} onCancel={() => setAdding(false)} />
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={buttonVariants({ variant: "secondary", className: "self-start" })}
        >
          {t("add")}
        </button>
      )}
    </div>
  );
}
