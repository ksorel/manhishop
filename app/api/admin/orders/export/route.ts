import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrdersForExport } from "@/lib/admin/orders";
import type { Locale } from "@/lib/catalogue/types";

// RFC 4180 : une valeur contenant une virgule, un guillemet ou un saut de
// ligne doit être entourée de guillemets, avec les guillemets internes
// doublés.
function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function csvRow(values: string[]): string {
  return values.map(csvEscape).join(",") + "\r\n";
}

const UTF8_BOM = "\uFEFF";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get("locale") === "en" ? "en" : "fr") as Locale;

  const [t, tStatus] = await Promise.all([
    getTranslations({ locale, namespace: "admin.ordersExport" }),
    getTranslations({ locale, namespace: "orders.status" }),
  ]);

  const orders = await getAdminOrdersForExport();

  const paymentLabels: Record<string, string> = {
    card: t("paymentCard"),
    mobile_money: t("paymentMobileMoney"),
  };

  // BOM UTF-8 : sans lui, Excel sur Windows interprète les accents comme
  // du Latin-1 et affiche des caractères corrompus à l'ouverture du CSV.
  let csv = UTF8_BOM;
  csv += csvRow([
    t("orderId"),
    t("date"),
    t("status"),
    t("email"),
    t("phone"),
    t("address"),
    t("subtotal"),
    t("deliveryFee"),
    t("total"),
    t("paymentMethod"),
    t("items"),
  ]);

  for (const order of orders) {
    const addressText = order.address
      ? [order.address.line1, order.address.line2, order.address.city, order.address.country]
          .filter(Boolean)
          .join(", ")
      : "";
    const itemsText = order.items
      .map(
        (item) =>
          `${item.productName}${item.sizeLabel ? ` (${item.sizeLabel})` : ""} x${item.quantity}`,
      )
      .join("; ");

    csv += csvRow([
      order.id,
      new Date(order.createdAt).toLocaleString(locale),
      tStatus(order.status),
      order.contactEmail,
      order.contactPhone,
      addressText,
      order.subtotal.toString(),
      order.deliveryFee.toString(),
      order.total.toString(),
      order.paymentMethod ? (paymentLabels[order.paymentMethod] ?? order.paymentMethod) : "",
      itemsText,
    ]);
  }

  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes-manhishop-${date}.csv"`,
    },
  });
}
