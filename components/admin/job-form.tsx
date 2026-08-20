"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AdminJob, AdminJobInput } from "@/lib/admin/jobs";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function JobForm({
  initialJob,
  onSubmit,
  onCancel,
}: {
  initialJob?: AdminJob;
  onSubmit: (input: AdminJobInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const t = useTranslations("admin.jobs.form");
  const tStatus = useTranslations("admin.jobs");
  const [titleFr, setTitleFr] = useState(initialJob?.titleFr ?? "");
  const [titleEn, setTitleEn] = useState(initialJob?.titleEn ?? "");
  const [descriptionFr, setDescriptionFr] = useState(initialJob?.descriptionFr ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initialJob?.descriptionEn ?? "");
  const [location, setLocation] = useState(initialJob?.location ?? "");
  const [status, setStatus] = useState<"active" | "draft">(initialJob?.status ?? "draft");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);

    const input: AdminJobInput = { titleFr, titleEn, descriptionFr, descriptionEn, location, status };

    try {
      await onSubmit(input);
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
          <span className="text-foreground">{t("descriptionFr")}</span>
          <textarea
            required
            rows={6}
            value={descriptionFr}
            onChange={(e) => setDescriptionFr(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("descriptionEn")}</span>
          <textarea
            required
            rows={6}
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("location")}</span>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
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
