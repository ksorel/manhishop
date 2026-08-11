export interface AdminProductSize {
  label: string;
  stock: number;
}

export interface AdminProductInput {
  slug: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  price: number;
  promoPrice: number | null;
  categoryId: string | null;
  stock: number;
  status: "active" | "draft";
  featured: boolean;
  sizeGuideId: string | null;
  sizes: AdminProductSize[];
}

export interface AdminProductImage {
  id: string;
  url: string;
  displayOrder: number;
}

export interface AdminProduct extends AdminProductInput {
  id: string;
  images: AdminProductImage[];
}

export interface AdminProductSummary {
  id: string;
  slug: string;
  nameFr: string;
  price: number;
  stock: number;
  status: "active" | "draft";
  categoryName: string | null;
  image: string | null;
}

export interface AdminCategoryInput {
  slug: string;
  nameFr: string;
  nameEn: string;
  displayOrder: number;
  parentId: string | null;
}

export interface AdminCategory extends AdminCategoryInput {
  id: string;
}

export interface SizeGuideHeader {
  fr: string;
  en: string;
}

export interface AdminSizeGuideInput {
  slug: string;
  titleFr: string;
  titleEn: string;
  displayOrder: number;
  headers: SizeGuideHeader[];
  rows: string[][];
}

export interface AdminSizeGuide extends AdminSizeGuideInput {
  id: string;
}
