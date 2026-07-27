export interface ShippingRate {
  id: string;
  country: string;
  city: string | null;
  fee: number;
}

export interface ShippingRateInput {
  country: string;
  city?: string;
  fee: number;
}
