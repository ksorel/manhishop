import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminOrders } from "@/lib/admin/orders";
import { OrderList } from "@/components/admin/order-list";

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
      <OrderList initialOrders={orders} locale={locale} />
    </div>
  );
}
