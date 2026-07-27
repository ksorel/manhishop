"use server";

import { createClient } from "@/lib/supabase/server";
import type { AdminProduct, AdminProductImage, AdminProductInput, AdminProductSummary } from "./types";

function toAdminProduct(row: {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  price: number;
  promo_price: number | null;
  category_id: string | null;
  stock: number;
  status: "active" | "draft";
  featured: boolean;
  product_images: { id: string; url: string; display_order: number }[] | null;
}): AdminProduct {
  return {
    id: row.id,
    slug: row.slug,
    nameFr: row.name_fr,
    nameEn: row.name_en,
    descriptionFr: row.description_fr,
    descriptionEn: row.description_en,
    price: Number(row.price),
    promoPrice: row.promo_price === null ? null : Number(row.promo_price),
    categoryId: row.category_id,
    stock: row.stock,
    status: row.status,
    featured: row.featured,
    images: (row.product_images ?? [])
      .slice()
      .sort((a, b) => a.display_order - b.display_order)
      .map((img) => ({ id: img.id, url: img.url, displayOrder: img.display_order })),
  };
}

export async function getAdminProducts(): Promise<AdminProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name_fr, price, stock, status, category:categories(name_fr), product_images(url, display_order)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const category = Array.isArray(row.category) ? row.category[0] : row.category;
    const images = (row.product_images ?? []).slice().sort((a, b) => a.display_order - b.display_order);
    return {
      id: row.id,
      slug: row.slug,
      nameFr: row.name_fr,
      price: Number(row.price),
      stock: row.stock,
      status: row.status,
      categoryName: category?.name_fr ?? null,
      image: images[0]?.url ?? null,
    };
  });
}

export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name_fr, name_en, description_fr, description_en, price, promo_price, category_id, stock, status, featured, product_images(id, url, display_order)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return toAdminProduct(data);
}

export async function createProduct(input: AdminProductInput): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      slug: input.slug,
      name_fr: input.nameFr,
      name_en: input.nameEn,
      description_fr: input.descriptionFr,
      description_en: input.descriptionEn,
      price: input.price,
      promo_price: input.promoPrice,
      category_id: input.categoryId,
      stock: input.stock,
      status: input.status,
      featured: input.featured,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id };
}

export async function updateProduct(id: string, input: AdminProductInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      slug: input.slug,
      name_fr: input.nameFr,
      name_en: input.nameEn,
      description_fr: input.descriptionFr,
      description_en: input.descriptionEn,
      price: input.price,
      promo_price: input.promoPrice,
      category_id: input.categoryId,
      stock: input.stock,
      status: input.status,
      featured: input.featured,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(
  productId: string,
  formData: FormData,
): Promise<AdminProductImage> {
  const supabase = await createClient();
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("no_file");

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${productId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file);

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);

  const { data: existing } = await supabase
    .from("product_images")
    .select("display_order")
    .eq("product_id", productId)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.display_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, url: publicUrlData.publicUrl, display_order: nextOrder })
    .select("id, url, display_order")
    .single();

  if (error) throw error;
  return { id: data.id, url: data.url, displayOrder: data.display_order };
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw error;
}
