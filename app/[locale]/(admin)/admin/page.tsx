import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/catalogue/types";
import { AlertTriangle, Clock, TrendingUp, Wallet } from "lucide-react";

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
    {
      label: t("dashboard.salesToday"),
      value: formatPrice(stats.salesToday, locale as Locale),
      icon: Wallet,
      accent: "text-success",
    },
    {
      label: t("dashboard.salesWeek"),
      value: formatPrice(stats.salesThisWeek, locale as Locale),
      icon: TrendingUp,
      accent: "text-success",
    },
    {
      label: t("dashboard.outOfStock"),
      value: String(stats.outOfStockCount),
      icon: AlertTriangle,
      accent: stats.outOfStockCount > 0 ? "text-error" : "text-muted-foreground",
    },
    {
      label: t("dashboard.pendingOrders"),
      value: String(stats.pendingOrdersCount),
      icon: Clock,
      accent: stats.pendingOrdersCount > 0 ? "text-warning" : "text-muted-foreground",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tiles.map((tile) => (
          <Card key={tile.label} className="flex items-start gap-4 p-5">
            <div className={cn("rounded-full bg-surface p-2.5", tile.accent)}>
              <tile.icon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{tile.label}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{tile.value}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
