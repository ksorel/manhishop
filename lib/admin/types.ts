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
}

export interface AdminCategory extends AdminCategoryInput {
  id: string;
}
