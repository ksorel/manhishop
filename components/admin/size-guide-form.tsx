"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { SIZE_GUIDE_TEMPLATES } from "@/lib/admin/size-guide-templates";
import type { AdminSizeGuide, AdminSizeGuideInput, SizeGuideHeader } from "@/lib/admin/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
const cellClass =
  "min-h-11 w-full rounded border border-border bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

function emptyHeader(): SizeGuideHeader {
  return { fr: "", en: "" };
}

export function SizeGuideForm({
  initialGuide,
  onSubmit,
  onCancel,
}: {
  initialGuide?: AdminSizeGuide;
  onSubmit: (input: AdminSizeGuideInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const t = useTranslations("admin.sizeGuides");
  const [slug, setSlug] = useState(initialGuide?.slug ?? "");
  const [titleFr, setTitleFr] = useState(initialGuide?.titleFr ?? "");
  const [titleEn, setTitleEn] = useState(initialGuide?.titleEn ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    initialGuide?.displayOrder?.toString() ?? "0",
  );
  const [headers, setHeaders] = useState<SizeGuideHeader[]>(
    initialGuide?.headers.length ? initialGuide.headers : [emptyHeader()],
  );
  const [rows, setRows] = useState<string[][]>(
    initialGuide?.rows.length ? initialGuide.rows : [headers.map(() => "")],
  );
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function applyTemplate(template: (typeof SIZE_GUIDE_TEMPLATES)[number]) {
    setTitleFr(template.titleFr);
    setTitleEn(template.titleEn);
    setHeaders(template.headers);
    setRows(template.rows);
    if (!slug) setSlug(slugify(template.titleFr));
  }

  function addColumn() {
    setHeaders((prev) => [...prev, emptyHeader()]);
    setRows((prev) => prev.map((row) => [...row, ""]));
  }

  function removeColumn(index: number) {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
    setRows((prev) => prev.map((row) => row.filter((_, i) => i !== index)));
  }

  function updateHeader(index: number, lang: "fr" | "en", value: string) {
    setHeaders((prev) => prev.map((h, i) => (i === index ? { ...h, [lang]: value } : h)));
  }

  function addRow() {
    setRows((prev) => [...prev, headers.map(() => "")]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    setRows((prev) =>
      prev.map((row, r) => (r === rowIndex ? row.map((cell, c) => (c === colIndex ? value : cell)) : row)),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    try {
      await onSubmit({
        slug: slugify(slug),
        titleFr,
        titleEn,
        displayOrder: Number(displayOrder),
        headers,
        rows,
      });
    } catch {
      setFormError(t("saveError"));
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!initialGuide && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">{t("startFromTemplate")}</span>
          <div className="flex flex-wrap gap-2">
            {SIZE_GUIDE_TEMPLATES.map((template) => (
              <button
                key={template.key}
                type="button"
                onClick={() => applyTemplate(template)}
                className={buttonVariants({ variant: "secondary", className: "px-3 text-xs" })}
              >
                {template.labelFr}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("slug")}</span>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("displayOrder")}</span>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className={inputClass}
          />
        </label>
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

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">{t("table")}</span>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-separate border-spacing-2">
            <thead>
              <tr>
                {headers.map((header, colIndex) => (
                  <th key={colIndex} className="text-left align-top">
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        placeholder={t("columnFr")}
                        value={header.fr}
                        onChange={(e) => updateHeader(colIndex, "fr", e.target.value)}
                        className={cellClass}
                      />
                      <input
                        type="text"
                        placeholder={t("columnEn")}
                        value={header.en}
                        onChange={(e) => updateHeader(colIndex, "en", e.target.value)}
                        className={cellClass}
                      />
                      <button
                        type="button"
                        onClick={() => removeColumn(colIndex)}
                        disabled={headers.length <= 1}
                        className="self-start text-xs text-error hover:underline disabled:opacity-40"
                      >
                        {t("removeColumn")}
                      </button>
                    </div>
                  </th>
                ))}
                <th className="align-top">
                  <button
                    type="button"
                    onClick={addColumn}
                    className={buttonVariants({ variant: "secondary", className: "px-3 text-xs" })}
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                    {t("addColumn")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex}>
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        className={cellClass}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      aria-label={t("removeRow")}
                      className="flex size-9 items-center justify-center rounded text-error hover:bg-surface"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={addRow}
          className={buttonVariants({ variant: "secondary", className: "self-start px-3 text-xs" })}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          {t("addRow")}
        </button>
      </div>

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
