import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

const ORDER_COLUMNS =
  "id, status, total, order_items(product_name, size_label, quantity, unit_price)";

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale, orderId } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("confirmation");
  const tCart = await getTranslations("cart");

  const supabase = await createClient();
  const { data: ownOrder } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", orderId)
    .maybeSingle();

  let order = ownOrder;

  if (!order && token) {
    const admin = createAdminClient();
    const { data: guestOrder } = await admin
      .from("orders")
      .select(ORDER_COLUMNS)
      .eq("id", orderId)
      .eq("access_token", token)
      .maybeSingle();
    order = guestOrder;
  }

  if (!order) notFound();

  const statusMessage =
    order.status === "paid"
      ? t("paid")
      : order.status === "cancelled"
        ? t("cancelled")
        : t("pending");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("orderNumber")}: {order.id}
      </p>

      <Card className="mt-6 p-4 text-foreground">{statusMessage}</Card>

      <Card className="mt-6 flex flex-col gap-2 p-4 text-sm">
        {(order.order_items ?? []).map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-foreground">
              {item.product_name}
              {item.size_label && ` (${item.size_label})`} × {item.quantity}
            </span>
            <span className="text-muted-foreground">
              {formatPrice(Number(item.unit_price) * item.quantity, locale as Locale)}
            </span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
          <span className="text-foreground">{tCart("total")}</span>
          <span className="text-foreground">
            {formatPrice(Number(order.total), locale as Locale)}
          </span>
        </div>
      </Card>

      <Link href="/" className={buttonVariants({ variant: "primary", className: "mt-6 w-full" })}>
        {t("backHome")}
      </Link>
    </div>
  );
}
