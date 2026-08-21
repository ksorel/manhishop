import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMyOrders } from "@/lib/orders/queries";
import { Card } from "@/components/ui/card";
import { OrderList } from "@/components/account/order-list";

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
        <OrderList orders={orders} locale={locale} />
      )}
    </div>
  );
}
