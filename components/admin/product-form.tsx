"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  createProduct,
  deleteProductImage,
  updateProduct,
  uploadProductImage,
} from "@/lib/admin/products";
import type { AdminCategory, AdminProduct, AdminProductImage, AdminProductInput } from "@/lib/admin/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function ProductForm({
  categories,
  initialProduct,
}: {
  categories: AdminCategory[];
  initialProduct?: AdminProduct;
}) {
  const t = useTranslations("admin.products.form");
  const tStatus = useTranslations("admin.products");
  const router = useRouter();

  const [slug, setSlug] = useState(initialProduct?.slug ?? "");
  const [nameFr, setNameFr] = useState(initialProduct?.nameFr ?? "");
  const [nameEn, setNameEn] = useState(initialProduct?.nameEn ?? "");
  const [descriptionFr, setDescriptionFr] = useState(initialProduct?.descriptionFr ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initialProduct?.descriptionEn ?? "");
  const [price, setPrice] = useState(initialProduct?.price?.toString() ?? "");
  const [promoPrice, setPromoPrice] = useState(initialProduct?.promoPrice?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId ?? "");
  const [stock, setStock] = useState(initialProduct?.stock?.toString() ?? "0");
  const [status, setStatus] = useState<"active" | "draft">(initialProduct?.status ?? "draft");
  const [featured, setFeatured] = useState(initialProduct?.featured ?? false);
  const [images, setImages] = useState<AdminProductImage[]>(initialProduct?.images ?? []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
      slug,
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
    };

    try {
      if (initialProduct) {
        await updateProduct(initialProduct.id, input);
        setPending(false);
      } else {
        const created = await createProduct(input);
        for (const file of pendingFiles) {
          try {
            const formData = new FormData();
            formData.append("file", file);
            await uploadProductImage(created.id, formData);
          } catch {
            // Le produit est créé ; les images en échec pourront être
            // rajoutées depuis la page d'édition qui suit.
          }
        }
        router.push(`/admin/produits/${created.id}`);
      }
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
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
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

        <div className="flex flex-wrap gap-2">
          {images.map((image) => (
            <div key={image.id} className="relative size-20 overflow-hidden rounded border border-border">
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              <button
                type="button"
                onClick={() => handleDeleteImage(image.id)}
                className="absolute right-0 top-0 rounded-bl bg-error px-1 text-xs text-error-foreground"
              >
                ×
              </button>
            </div>
          ))}
          {pendingFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative size-20 overflow-hidden rounded border border-border"
            >
              {/* Aperçu local avant création du produit : pas encore une URL Supabase, next/image (optimisation distante) ne s'applique pas. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pendingPreviews[index]}
                alt=""
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemovePendingFile(index)}
                className="absolute right-0 top-0 rounded-bl bg-error px-1 text-xs text-error-foreground"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            disabled={uploading}
            className="text-sm"
          />
          {uploading && (
            <span className="text-sm text-muted-foreground">{t("uploading")}</span>
          )}
        </div>
      </div>

      {formError && <p className="text-sm font-medium text-error">{formError}</p>}

      <button
        type="submit"
        disabled={pending}
        className={buttonVariants({ variant: "primary", className: "self-start" })}
      >
        {t("save")}
      </button>
    </form>
  );
}
