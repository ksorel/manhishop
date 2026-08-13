"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface PreviewSubcategory {
  nameFr: string;
  nameEn: string;
  count: number;
}

interface PreviewCategory {
  nameFr: string;
  nameEn: string;
  count: number;
  subcategories: PreviewSubcategory[];
}

interface Preview {
  totalProducts: number;
  priceRangeEur: [number, number];
  categories: PreviewCategory[];
  brands: { name: string; count: number }[];
}

interface ImportResult {
  productsCreated: number;
  categoriesCreated: number;
  sizesCreated: number;
  imagesCreated: number;
  skipped: { code: string; reason: string }[];
}

const DEFAULT_FX_RATE = "655.957";
const DEFAULT_MARGIN = "0";

export function CatalogueImportForm() {
  const t = useTranslations("admin.catalogueImport");

  const [file, setFile] = useState<File | null>(null);
  const [fxRate, setFxRate] = useState(DEFAULT_FX_RATE);
  const [marginPercent, setMarginPercent] = useState(DEFAULT_MARGIN);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setPreview(null);
    setResult(null);
    setError(null);
  }

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "preview");
      formData.append("fxRate", fxRate);
      formData.append("marginPercent", marginPercent);

      const response = await fetch("/api/admin/catalogue-import", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("preview_failed");
      const data: Preview = await response.json();
      setPreview(data);
      setSelectedCategories(new Set());
    } catch {
      setError(t("fileError"));
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleImport() {
    if (!file || selectedCategories.size === 0) return;
    setImporting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "commit");
      formData.append("fxRate", fxRate);
      formData.append("marginPercent", marginPercent);
      formData.append("categories", JSON.stringify([...selectedCategories]));

      const response = await fetch("/api/admin/catalogue-import", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("import_failed");
      const data: ImportResult = await response.json();
      setResult(data);
    } catch {
      setError(t("error"));
    } finally {
      setImporting(false);
    }
  }

  function toggleCategory(nameFr: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(nameFr)) next.delete(nameFr);
      else next.add(nameFr);
      return next;
    });
  }

  if (result) {
    return (
      <Card className="flex flex-col gap-2 p-6">
        <h2 className="text-lg font-semibold text-foreground">{t("resultTitle")}</h2>
        <p className="text-sm text-foreground">{t("resultProducts", { count: result.productsCreated })}</p>
        <p className="text-sm text-foreground">
          {t("resultCategories", { count: result.categoriesCreated })}
        </p>
        <p className="text-sm text-foreground">{t("resultSizes", { count: result.sizesCreated })}</p>
        <p className="text-sm text-foreground">{t("resultImages", { count: result.imagesCreated })}</p>
        {result.skipped.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {t("resultSkipped", { count: result.skipped.length })}
          </p>
        )}
        <Link
          href="/admin/produits"
          className={buttonVariants({ variant: "primary", className: "mt-4 self-start" })}
        >
          {t("backToList")}
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("fileLabel")}</span>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="text-sm text-foreground"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">{t("fxRate")}</span>
            <input
              type="number"
              min={0}
              step="0.001"
              value={fxRate}
              onChange={(e) => setFxRate(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">{t("marginPercent")}</span>
            <input
              type="number"
              step="0.1"
              value={marginPercent}
              onChange={(e) => setMarginPercent(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        {error && <p className="text-sm font-medium text-error">{error}</p>}

        <Button
          type="button"
          onClick={handleAnalyze}
          loading={analyzing}
          disabled={!file}
          className="self-start"
        >
          {analyzing ? t("analyzing") : t("analyze")}
        </Button>
      </Card>

      {preview && (
        <Card className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t("categoriesTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("priceRange", {
                min: preview.priceRangeEur[0],
                max: preview.priceRangeEur[1],
              })}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {preview.categories.map((category) => (
              <label
                key={category.nameFr}
                className="flex min-h-11 items-start gap-3 rounded border border-border p-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.has(category.nameFr)}
                  onChange={() => toggleCategory(category.nameFr)}
                  className="mt-1 size-5"
                />
                <span className="flex-1">
                  <span className="font-medium text-foreground">
                    {category.nameFr} — {t("productsCount", { count: category.count })}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {category.subcategories.map((sub) => `${sub.nameFr} (${sub.count})`).join(", ")}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">{t("draftNotice")}</p>

          {selectedCategories.size === 0 && (
            <p className="text-sm text-muted-foreground">{t("noSelection")}</p>
          )}

          <Button
            type="button"
            onClick={handleImport}
            loading={importing}
            disabled={selectedCategories.size === 0}
            className="self-start"
          >
            {importing ? t("importing") : t("import")}
          </Button>
        </Card>
      )}
    </div>
  );
}
