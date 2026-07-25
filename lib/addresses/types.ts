export interface Address {
  id: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  country: string;
  phone: string;
}

export interface AddressInput {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  country: string;
  phone: string;
}
