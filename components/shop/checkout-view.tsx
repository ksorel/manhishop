"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/components/cart/cart-provider";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";
import type { Address } from "@/lib/addresses/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const COUNTRIES = ["ci", "sn", "ml", "bf", "tg", "bj"] as const;
const DELIVERY_FEE_XOF = 1000;

export function CheckoutView({
  initialEmail,
  savedAddresses,
}: {
  initialEmail: string;
  savedAddresses: Address[];
}) {
  const t = useTranslations("checkout");
  const locale = useLocale() as Locale;
  const { items, totalPrice, clearCart } = useCart();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses[0]?.id ?? null,
  );
  const [usingNewAddress, setUsingNewAddress] = useState(savedAddresses.length === 0);

  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (items.length === 0) {
    return <Card className="p-6 text-muted-foreground">{t("emptyCart")}</Card>;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const reusingAddress = !usingNewAddress && selectedAddressId;
    const contactPhone = reusingAddress
      ? (savedAddresses.find((a) => a.id === selectedAddressId)?.phone ?? phone)
      : phone;

    const payload = {
      locale,
      items: items.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      address: reusingAddress
        ? { addressId: selectedAddressId }
        : { fullName, line1, line2: line2 || undefined, city, country, phone },
      contactEmail: email,
      contactPhone,
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error ?? "checkout_failed");

      // La commande est créée à ce stade (statut pending) : le panier est
      // vidé maintenant, comme côté serveur pour un client connecté —
      // avant même la confirmation du paiement.
      clearCart();
      window.location.href = result.url;
    } catch {
      setError(t("error"));
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {error && <p className="text-sm font-medium text-error">{error}</p>}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">{t("contactTitle")}</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("email")}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">{t("addressTitle")}</h2>

        {savedAddresses.length > 0 && !usingNewAddress && (
          <>
            <div className="flex flex-col gap-2">
              {savedAddresses.map((address) => (
                <label
                  key={address.id}
                  className="flex items-start gap-2 rounded border border-border p-3 text-sm text-foreground"
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                    className="mt-1"
                  />
                  <span>
                    {address.fullName}
                    <br />
                    {address.line1}
                    {address.line2 && <>, {address.line2}</>}
                    <br />
                    {address.city}, {t(`countries.${address.country}`)}
                    <br />
                    {address.phone}
                  </span>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setUsingNewAddress(true)}
              className="self-start text-sm text-primary hover:underline"
            >
              {t("useNewAddress")}
            </button>
          </>
        )}

        {(savedAddresses.length === 0 || usingNewAddress) && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground">{t("fullName")}</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground">{t("phone")}</span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground">{t("line1")}</span>
              <input
                type="text"
                required
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground">{t("line2")}</span>
              <input
                type="text"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground">{t("city")}</span>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground">{t("country")}</span>
              <select
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  {t("countrySelect")}
                </option>
                {COUNTRIES.map((code) => (
                  <option key={code} value={code}>
                    {t(`countries.${code}`)}
                  </option>
                ))}
              </select>
            </label>

            {savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => setUsingNewAddress(false)}
                className="self-start text-sm text-primary hover:underline"
              >
                {t("savedAddresses")}
              </button>
            )}
          </>
        )}
      </section>

      <Card className="flex flex-col gap-2 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("subtotal")}</span>
          <span className="text-foreground">{formatPrice(totalPrice, locale)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("delivery")}</span>
          <span className="text-foreground">{formatPrice(DELIVERY_FEE_XOF, locale)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span className="text-foreground">{t("total")}</span>
          <span className="text-foreground">
            {formatPrice(totalPrice + DELIVERY_FEE_XOF, locale)}
          </span>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">{t("paymentNote")}</p>

      <button
        type="submit"
        disabled={pending}
        className={buttonVariants({ variant: "primary", className: "w-full" })}
      >
        {pending ? t("processing") : t("submit")}
      </button>
    </form>
  );
}
