import type { ProductSummary } from "@/lib/catalogue/types";

export interface CartLine {
  productId: string;
  quantity: number;
  product: ProductSummary;
}

export interface GuestCartEntry {
  productId: string;
  quantity: number;
}
