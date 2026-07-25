import { z } from "zod";

export const checkoutSchema = z.object({
  locale: z.enum(["fr", "en"]),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  address: z.object({
    fullName: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().min(1),
  }),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
});
