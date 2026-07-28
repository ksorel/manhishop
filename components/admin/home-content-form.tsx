"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { updateHomeContent } from "@/lib/admin/content";
import type { HomeContent } from "@/lib/content/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function HomeContentForm({ initialContent }: { initialContent: HomeContent }) {
  const t = useTranslations("admin.content");
  const [heroTitleFr, setHeroTitleFr] = useState(initialContent.heroTitleFr);
  const [heroTitleEn, setHeroTitleEn] = useState(initialContent.heroTitleEn);
  const [heroSubtitleFr, setHeroSubtitleFr] = useState(initialContent.heroSubtitleFr);
  const [heroSubtitleEn, setHeroSubtitleEn] = useState(initialContent.heroSubtitleEn);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      await updateHomeContent({ heroTitleFr, heroTitleEn, heroSubtitleFr, heroSubtitleEn });
      setMessage(t("saved"));
    } catch {
      setMessage(t("saveError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {message && <p className="text-sm text-foreground">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("heroTitleFr")}</span>
          <input
            type="text"
            required
            value={heroTitleFr}
            onChange={(e) => setHeroTitleFr(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("heroTitleEn")}</span>
          <input
            type="text"
            required
            value={heroTitleEn}
            onChange={(e) => setHeroTitleEn(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("heroSubtitleFr")}</span>
          <textarea
            rows={2}
            required
            value={heroSubtitleFr}
            onChange={(e) => setHeroSubtitleFr(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("heroSubtitleEn")}</span>
          <textarea
            rows={2}
            required
            value={heroSubtitleEn}
            onChange={(e) => setHeroSubtitleEn(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <Button type="submit" loading={pending} className="self-start">
        {t("save")}
      </Button>
    </form>
  );
}
