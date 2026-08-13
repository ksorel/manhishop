export interface NewAddressInput {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  country: string;
  phone: string;
}

export interface SavedAddressInput {
  addressId: string;
}

export type CheckoutAddressInput = SavedAddressInput | NewAddressInput;

export interface CheckoutItemInput {
  productId: string;
  sizeId?: string | null;
  quantity: number;
}

export interface CheckoutInput {
  items: CheckoutItemInput[];
  address: CheckoutAddressInput;
  contactEmail: string;
  contactPhone: string;
  promoCode?: string;
}

export interface PreparedOrderLine {
  productId: string;
  name: string;
  sizeLabel: string | null;
  unitPrice: number;
  quantity: number;
}

export interface PreparedOrder {
  orderId: string;
  accessToken: string;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  contactEmail: string;
  locale: "fr" | "en";
  lines: PreparedOrderLine[];
}
