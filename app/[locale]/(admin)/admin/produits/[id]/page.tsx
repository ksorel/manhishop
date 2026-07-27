import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getAdminCategories } from "@/lib/admin/categories";
import { getAdminProductById } from "@/lib/admin/products";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [categories, product] = await Promise.all([
    getAdminCategories(),
    getAdminProductById(id),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">{product.nameFr}</h1>
        <DeleteProductButton productId={product.id} />
      </div>
      <div className="mt-6">
        <ProductForm categories={categories} initialProduct={product} />
      </div>
    </div>
  );
}
