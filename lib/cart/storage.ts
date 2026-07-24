import type { GuestCartEntry } from "./types";

const STORAGE_KEY = "manhishop_cart_v1";

export function readGuestCart(): GuestCartEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GuestCartEntry[]) : [];
  } catch {
    return [];
  }
}

export function writeGuestCart(entries: GuestCartEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
