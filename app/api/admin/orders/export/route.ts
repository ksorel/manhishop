import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrdersForExport, type AdminOrderExportRow } from "@/lib/admin/orders";
import type { Locale } from "@/lib/catalogue/types";
import type { OrderStatus } from "@/lib/orders/queries";

const ALL_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

/**
 * Même prédicat que le filtre côté client (components/admin/order-list.tsx)
 * — l'export doit refléter exactement ce que l'admin voit filtré/recherché
 * à l'écran, pas systématiquement toutes les commandes.
 */
function matchesFilter(order: AdminOrderExportRow, search: string, status: string): boolean {
  if (status !== "all" && order.status !== status) return false;
  if (!search) return true;
  const query = search.toLowerCase();
  return (
    order.id.toLowerCase().includes(query) ||
    order.contactEmail.toLowerCase().includes(query) ||
    order.contactPhone.toLowerCase().includes(query)
  );
}

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
  const search = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status") ?? "all";
  const status = statusParam === "all" || ALL_STATUSES.includes(statusParam as OrderStatus) ? statusParam : "all";

  const [t, tStatus] = await Promise.all([
    getTranslations({ locale, namespace: "admin.ordersExport" }),
    getTranslations({ locale, namespace: "orders.status" }),
  ]);

  const allOrders = await getAdminOrdersForExport();
  const orders = allOrders.filter((order) => matchesFilter(order, search, status));

  const paymentLabels: Record<string, string> = {
    card: t("paymentCard"),
    mobile_money: t("paymentMobileMoney"),
  };

  const headerRow = [
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
  ];

  const rows = orders.map((order) => {
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

    return [
      order.id,
      new Date(order.createdAt).toLocaleString(locale),
      tStatus(order.status),
      order.contactEmail,
      order.contactPhone,
      addressText,
      order.subtotal,
      order.deliveryFee,
      order.total,
      order.paymentMethod ? (paymentLabels[order.paymentMethod] ?? order.paymentMethod) : "",
      itemsText,
    ];
  });

  const sheet = XLSX.utils.aoa_to_sheet([headerRow, ...rows]);
  sheet["!cols"] = [
    { wch: 38 }, // n° commande (uuid)
    { wch: 18 }, // date
    { wch: 14 }, // statut
    { wch: 26 }, // email
    { wch: 16 }, // téléphone
    { wch: 40 }, // adresse
    { wch: 12 }, // sous-total
    { wch: 12 }, // livraison
    { wch: 12 }, // total
    { wch: 14 }, // moyen de paiement
    { wch: 50 }, // articles
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Commandes");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="commandes-manhishop-${date}.xlsx"`,
    },
  });
}
