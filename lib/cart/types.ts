import type { ProductSummary } from "@/lib/catalogue/types";

export interface CartLine {
  productId: string;
  sizeId: string | null;
  sizeLabel: string | null;
  sizeStock: number | null;
  quantity: number;
  product: ProductSummary;
}

export interface GuestCartEntry {
  productId: string;
  sizeId: string | null;
  sizeLabel: string | null;
  sizeStock: number | null;
  quantity: number;
}
