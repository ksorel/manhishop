import { z } from "zod";

const newAddressSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().min(1),
});

const savedAddressSchema = z.object({
  addressId: z.string().uuid(),
});

export const checkoutSchema = z.object({
  locale: z.enum(["fr", "en"]),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        sizeId: z.string().uuid().nullable().optional(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  address: z.union([savedAddressSchema, newAddressSchema]),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  promoCode: z.string().trim().min(1).optional(),
  redeemPoints: z.number().int().nonnegative().optional(),
});
