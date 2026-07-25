import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMyOrders } from "@/lib/orders/queries";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("orders");

  const orders = await getMyOrders();
  if (orders === null) redirect(`/${locale}/connexion`);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>

      {orders.length === 0 ? (
        <Card className="mt-6 p-6 text-muted-foreground">{t("empty")}</Card>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/commandes/${order.id}`}>
                <Card className="flex items-center justify-between gap-3 p-4 hover:bg-surface">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("orderNumber")} {order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(order.total, locale as Locale)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
