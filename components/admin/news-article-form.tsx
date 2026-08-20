"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  createNewsArticle,
  updateNewsArticle,
  uploadArticleImage,
  type AdminNewsArticle,
  type AdminNewsArticleInput,
} from "@/lib/admin/news-articles";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function NewsArticleForm({
  initialArticle,
  onDone,
  onCancel,
}: {
  initialArticle?: AdminNewsArticle;
  onDone: (article: AdminNewsArticle) => void;
  onCancel?: () => void;
}) {
  const t = useTranslations("admin.articles.form");
  const tStatus = useTranslations("admin.articles");
  const [titleFr, setTitleFr] = useState(initialArticle?.titleFr ?? "");
  const [titleEn, setTitleEn] = useState(initialArticle?.titleEn ?? "");
  const [bodyFr, setBodyFr] = useState(initialArticle?.bodyFr ?? "");
  const [bodyEn, setBodyEn] = useState(initialArticle?.bodyEn ?? "");
  const [status, setStatus] = useState<"active" | "draft">(initialArticle?.status ?? "draft");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);

    const input: AdminNewsArticleInput = { titleFr, titleEn, bodyFr, bodyEn, status };

    try {
      let article = initialArticle
        ? await updateNewsArticle(initialArticle.id, input)
        : await createNewsArticle(input);

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const imageUrl = await uploadArticleImage(article.id, formData);
        article = { ...article, imageUrl };
      }

      onDone(article);
    } catch {
      setFormError(t("saveError"));
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("titleFr")}</span>
          <input
            type="text"
            required
            value={titleFr}
            onChange={(e) => setTitleFr(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("titleEn")}</span>
          <input
            type="text"
            required
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("bodyFr")}</span>
          <textarea
            required
            rows={6}
            value={bodyFr}
            onChange={(e) => setBodyFr(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("bodyEn")}</span>
          <textarea
            required
            rows={6}
            value={bodyEn}
            onChange={(e) => setBodyEn(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("image")}</span>
        {(imagePreview ?? initialArticle?.imageUrl) && (
          <Image
            src={imagePreview ?? initialArticle?.imageUrl ?? ""}
            alt=""
            width={160}
            height={90}
            unoptimized={!!imagePreview}
            className="h-24 w-auto rounded object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className={inputClass}
        />
      </label>

      <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={status === "active"}
          onChange={(e) => setStatus(e.target.checked ? "active" : "draft")}
          className="size-5"
        />
        {tStatus("active")}
      </label>

      {formError && <p className="text-sm font-medium text-error">{formError}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={pending}>
          {t("save")}
        </Button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonVariants({ variant: "text" })}>
            {t("cancel")}
          </button>
        )}
      </div>
    </form>
  );
}
