import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminOrders } from "@/lib/admin/orders";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.orders");

  const orders = await getAdminOrders();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>

      {orders.length === 0 ? (
        <Card className="mt-6 p-6 text-muted-foreground">{t("empty")}</Card>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/admin/commandes/${order.id}`}>
                <Card className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-surface">
                  <div>
                    <p className="font-medium text-foreground">
                      {t("orderNumber")} {order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.contactEmail} · {new Date(order.createdAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">
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
