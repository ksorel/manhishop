"use server";

import { createClient } from "@/lib/supabase/server";
import { getProductsByIds } from "@/lib/catalogue/queries";
import type { Locale } from "@/lib/catalogue/types";
import type { CartLine, GuestCartEntry } from "./types";

async function getOrCreateCartId(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

async function buildCartLines(cartId: string, locale: Locale): Promise<CartLine[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("cart_id", cartId);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const products = await getProductsByIds(
    data.map((row) => row.product_id),
    locale,
  );

  return data
    .map((row) => {
      const product = products.find((p) => p.id === row.product_id);
      return product
        ? { productId: row.product_id, quantity: row.quantity, product }
        : null;
    })
    .filter((line): line is CartLine => line !== null);
}

/** Wrapper serveur (panier invité) — le client ne peut pas appeler
 * getProductsByIds directement, celle-ci n'étant pas une Server Action. */
export async function getProductsForGuestCart(ids: string[], locale: Locale) {
  return getProductsByIds(ids, locale);
}

export async function getCartItems(locale: Locale): Promise<CartLine[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cart) return [];
  return buildCartLines(cart.id, locale);
}

export async function addCartItem(
  productId: string,
  quantity: number,
  locale: Locale,
): Promise<CartLine[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const cartId = await getOrCreateCartId(user.id);

  const { data: existing } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("cart_id", cartId)
      .eq("product_id", productId);
  } else {
    await supabase
      .from("cart_items")
      .insert({ cart_id: cartId, product_id: productId, quantity });
  }

  return buildCartLines(cartId, locale);
}

export async function updateCartItemQuantity(
  productId: string,
  quantity: number,
  locale: Locale,
): Promise<CartLine[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const cartId = await getOrCreateCartId(user.id);

  if (quantity <= 0) {
    await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId)
      .eq("product_id", productId);
  } else {
    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("cart_id", cartId)
      .eq("product_id", productId);
  }

  return buildCartLines(cartId, locale);
}

export async function removeCartItem(
  productId: string,
  locale: Locale,
): Promise<CartLine[]> {
  return updateCartItemQuantity(productId, 0, locale);
}

export async function mergeGuestCart(
  entries: GuestCartEntry[],
  locale: Locale,
): Promise<CartLine[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const cartId = await getOrCreateCartId(user.id);
  if (entries.length === 0) return buildCartLines(cartId, locale);

  const { data: existingRows } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("cart_id", cartId);

  const existingMap = new Map(
    (existingRows ?? []).map((row) => [row.product_id, row.quantity]),
  );

  for (const entry of entries) {
    const nextQuantity = (existingMap.get(entry.productId) ?? 0) + entry.quantity;

    if (existingMap.has(entry.productId)) {
      await supabase
        .from("cart_items")
        .update({ quantity: nextQuantity })
        .eq("cart_id", cartId)
        .eq("product_id", entry.productId);
    } else {
      await supabase
        .from("cart_items")
        .insert({ cart_id: cartId, product_id: entry.productId, quantity: entry.quantity });
    }
  }

  return buildCartLines(cartId, locale);
}
