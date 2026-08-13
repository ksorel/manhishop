import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getMyOrderById } from "@/lib/orders/queries";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("orders");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/connexion`);

  const order = await getMyOrderById(orderId);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/commandes" className="text-sm text-primary hover:underline">
        ← {t("backToList")}
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("orderNumber")} {order.id.slice(0, 8)}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {new Date(order.createdAt).toLocaleDateString(locale)}
      </p>

      <Card className="mt-6 flex flex-col gap-2 p-4">
        <h2 className="text-sm font-semibold text-foreground">{t("items")}</h2>
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-foreground">
              {item.productName}
              {item.sizeLabel && ` (${item.sizeLabel})`} × {item.quantity}
            </span>
            <span className="text-muted-foreground">
              {formatPrice(item.unitPrice * item.quantity, locale as Locale)}
            </span>
          </div>
        ))}
        <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("discount")}</span>
              <span className="text-foreground">
                -{formatPrice(order.discountAmount, locale as Locale)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-foreground">{t("total")}</span>
            <span className="text-foreground">{formatPrice(order.total, locale as Locale)}</span>
          </div>
        </div>
      </Card>

      {order.address && (
        <Card className="mt-4 p-4 text-sm">
          <h2 className="text-sm font-semibold text-foreground">{t("shippingAddress")}</h2>
          <p className="mt-2 text-muted-foreground">
            {order.address.fullName}
            <br />
            {order.address.line1}
            {order.address.line2 && (
              <>
                <br />
                {order.address.line2}
              </>
            )}
            <br />
            {order.address.city}, {order.address.country}
            <br />
            {order.address.phone}
          </p>
        </Card>
      )}
    </div>
  );
}
