import { Download } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminOrders } from "@/lib/admin/orders";
import { buttonVariants } from "@/components/ui/button";
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
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
        {orders.length > 0 && (
          <a
            href={`/api/admin/orders/export?locale=${locale}`}
            className={buttonVariants({ variant: "secondary", className: "gap-1.5" })}
          >
            <Download className="size-4" aria-hidden="true" />
            {t("exportCsv")}
          </a>
        )}
      </div>

      <OrderList initialOrders={orders} locale={locale} />
    </div>
  );
}
