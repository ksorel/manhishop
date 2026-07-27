import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const stats = await getDashboardStats();

  const tiles = [
    { label: t("dashboard.salesToday"), value: formatPrice(stats.salesToday, locale as Locale) },
    { label: t("dashboard.salesWeek"), value: formatPrice(stats.salesThisWeek, locale as Locale) },
    { label: t("dashboard.outOfStock"), value: String(stats.outOfStockCount) },
    { label: t("dashboard.pendingOrders"), value: String(stats.pendingOrdersCount) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tiles.map((tile) => (
          <Card key={tile.label} className="p-4">
            <p className="text-sm text-muted-foreground">{tile.label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{tile.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
