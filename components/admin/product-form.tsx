"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ImagePlus, Plus, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn, slugify } from "@/lib/utils";
import { flattenCategoriesWithDepth } from "@/lib/admin/category-tree";
import {
  createProduct,
  deleteProductImage,
  updateProduct,
  uploadProductImage,
} from "@/lib/admin/products";
import type {
  AdminCategory,
  AdminProduct,
  AdminProductImage,
  AdminProductInput,
  AdminProductSize,
  AdminSizeGuide,
} from "@/lib/admin/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function ProductForm({
  categories,
  sizeGuides,
  initialProduct,
}: {
  categories: AdminCategory[];
  sizeGuides: AdminSizeGuide[];
  initialProduct?: AdminProduct;
}) {
  const t = useTranslations("admin.products.form");
  const tStatus = useTranslations("admin.products");
  const router = useRouter();

  const [nameFr, setNameFr] = useState(initialProduct?.nameFr ?? "");
  const [nameEn, setNameEn] = useState(initialProduct?.nameEn ?? "");
  const [descriptionFr, setDescriptionFr] = useState(initialProduct?.descriptionFr ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initialProduct?.descriptionEn ?? "");
  const [price, setPrice] = useState(initialProduct?.price?.toString() ?? "");
  const [promoPrice, setPromoPrice] = useState(initialProduct?.promoPrice?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId ?? "");
  const [sizeGuideId, setSizeGuideId] = useState(initialProduct?.sizeGuideId ?? "");
  const [sizes, setSizes] = useState<AdminProductSize[]>(initialProduct?.sizes ?? []);
  const [stock, setStock] = useState(initialProduct?.stock?.toString() ?? "0");
  const [status, setStatus] = useState<"active" | "draft">(initialProduct?.status ?? "draft");
  const [featured, setFeatured] = useState(initialProduct?.featured ?? false);
  const [images, setImages] = useState<AdminProductImage[]>(initialProduct?.images ?? []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const categoryOptions = useMemo(() => flattenCategoriesWithDepth(categories), [categories]);
  const selectedSizeGuide = useMemo(
    () => sizeGuides.find((guide) => guide.id === sizeGuideId) ?? null,
    [sizeGuides, sizeGuideId],
  );

  const pendingPreviews = useMemo(
    () => pendingFiles.map((file) => URL.createObjectURL(file)),
    [pendingFiles],
  );
  useEffect(() => {
    return () => pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [pendingPreviews]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);

    const input: AdminProductInput = {
      // Dérivé du nom par le système ; figé après création pour ne pas
      // casser un lien produit déjà partagé si le nom est modifié.
      slug: initialProduct ? initialProduct.slug : slugify(nameFr),
      nameFr,
      nameEn,
      descriptionFr,
      descriptionEn,
      price: Number(price),
      promoPrice: promoPrice ? Number(promoPrice) : null,
      categoryId: categoryId || null,
      stock: Number(stock),
      status,
      featured,
      sizeGuideId: sizeGuideId || null,
      sizes: sizes
        .filter((size) => size.label.trim() !== "")
        .map((size) => ({ label: size.label.trim(), stock: size.stock })),
    };

    try {
      if (initialProduct) {
        await updateProduct(initialProduct.id, input);
      } else {
        const created = await createProduct(input);
        for (const file of pendingFiles) {
          try {
            const formData = new FormData();
            formData.append("file", file);
            await uploadProductImage(created.id, formData);
          } catch {
            // Le produit est créé ; les images en échec pourront être
            // rajoutées depuis la page d'édition (accessible via la liste).
          }
        }
      }
      router.push("/admin/produits");
    } catch {
      setFormError(t("saveError"));
      setPending(false);
    }
  }

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    setUploadError(null);

    if (!initialProduct) {
      setPendingFiles((prev) => [...prev, ...files]);
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const image = await uploadProductImage(initialProduct.id, formData);
        setImages((prev) => [...prev, image]);
      }
    } catch {
      setUploadError(t("uploadError"));
    } finally {
      setUploading(false);
    }
  }

  function handleFillFromGuide() {
    if (!selectedSizeGuide) return;
    const existingStockByLabel = new Map(sizes.map((size) => [size.label, size.stock]));
    setSizes(
      selectedSizeGuide.rows
        .map((row) => row[0]?.trim())
        .filter((label): label is string => !!label)
        .map((label) => ({ label, stock: existingStockByLabel.get(label) ?? 0 })),
    );
  }

  function handleAddSize() {
    setSizes((prev) => [...prev, { label: "", stock: 0 }]);
  }

  function handleSizeLabelChange(index: number, label: string) {
    setSizes((prev) => prev.map((size, i) => (i === index ? { ...size, label } : size)));
  }

  function handleSizeStockChange(index: number, stock: number) {
    setSizes((prev) => prev.map((size, i) => (i === index ? { ...size, stock } : size)));
  }

  function handleRemoveSize(index: number) {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  }

  function handleRemovePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDeleteImage(imageId: string) {
    setUploadError(null);
    try {
      await deleteProductImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      setUploadError(t("uploadError"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("nameFr")}</span>
          <input
            type="text"
            required
            value={nameFr}
            onChange={(e) => setNameFr(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("nameEn")}</span>
          <input
            type="text"
            required
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("descriptionFr")}</span>
          <textarea
            rows={3}
            value={descriptionFr}
            onChange={(e) => setDescriptionFr(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("descriptionEn")}</span>
          <textarea
            rows={3}
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("price")}</span>
          <input
            type="number"
            min={0}
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("promoPrice")}</span>
          <input
            type="number"
            min={0}
            value={promoPrice}
            onChange={(e) => setPromoPrice(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("stock")}</span>
          <input
            type="number"
            min={0}
            required
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("category")}</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            <option value="">{t("noCategory")}</option>
            {categoryOptions.map(({ category, depth }) => (
              <option key={category.id} value={category.id}>
                {"— ".repeat(depth - 1)}
                {category.nameFr}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("status")}</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "draft")}
            className={inputClass}
          >
            <option value="draft">{tStatus("draft")}</option>
            <option value="active">{tStatus("active")}</option>
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">{t("sizes")}</span>
        <p className="text-xs text-muted-foreground">{t("sizesHint")}</p>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("sizeGuide")}</span>
          <select
            value={sizeGuideId}
            onChange={(e) => setSizeGuideId(e.target.value)}
            className={inputClass}
          >
            <option value="">{t("noSizeGuide")}</option>
            {sizeGuides.map((guide) => (
              <option key={guide.id} value={guide.id}>
                {guide.titleFr}
              </option>
            ))}
          </select>
        </label>

        {selectedSizeGuide && selectedSizeGuide.rows.length > 0 && (
          <button
            type="button"
            onClick={handleFillFromGuide}
            className="self-start text-sm text-primary hover:underline"
          >
            {t("fillFromGuide")}
          </button>
        )}

        {sizes.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {sizes.map((size, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t("sizeLabel")}
                  value={size.label}
                  onChange={(e) => handleSizeLabelChange(index, e.target.value)}
                  className={cn(inputClass, "flex-1")}
                />
                <input
                  type="number"
                  min={0}
                  placeholder={t("sizeStock")}
                  value={size.stock}
                  onChange={(e) => handleSizeStockChange(index, Number(e.target.value))}
                  className={cn(inputClass, "w-24")}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSize(index)}
                  aria-label={t("removeSize")}
                  className="flex size-11 shrink-0 items-center justify-center rounded text-error hover:bg-surface"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddSize}
          className={buttonVariants({
            variant: "secondary",
            className: "self-start px-3 text-xs",
          })}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          {t("addSize")}
        </button>
      </div>

      <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="size-5"
        />
        {t("featured")}
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">{t("images")}</span>

        {uploadError && <p className="text-sm font-medium text-error">{uploadError}</p>}

        <div className="flex flex-wrap gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative size-20 overflow-hidden rounded-lg border border-border shadow-sm"
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              <button
                type="button"
                onClick={() => handleDeleteImage(image.id)}
                aria-label={t("removeImage")}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-error"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
          {pendingFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="group relative size-20 overflow-hidden rounded-lg border border-border shadow-sm"
            >
              {/* Aperçu local avant création du produit : pas encore une URL Supabase, next/image (optimisation distante) ne s'applique pas. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingPreviews[index]} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemovePendingFile(index)}
                aria-label={t("removeImage")}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-error"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}

          <label
            className={cn(
              "flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
              uploading && "pointer-events-none opacity-50",
            )}
          >
            <ImagePlus className="size-5" aria-hidden="true" />
            <span className="text-[11px] font-medium">{t("addImage")}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              disabled={uploading}
              className="sr-only"
            />
          </label>
        </div>

        {uploading && <p className="text-sm text-muted-foreground">{t("uploading")}</p>}
      </div>

      {formError && <p className="text-sm font-medium text-error">{formError}</p>}

      <Button type="submit" loading={pending} className="self-start">
        {t("save")}
      </Button>
    </form>
  );
}
