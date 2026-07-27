import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function AdminNav() {
  const t = useTranslations("admin.nav");

  const items = [
    { href: "/admin" as const, label: t("dashboard") },
    { href: "/admin/produits" as const, label: t("products") },
    { href: "/admin/categories" as const, label: t("categories") },
    { href: "/admin/commandes" as const, label: t("orders") },
  ];

  return (
    <nav className="flex shrink-0 gap-2 overflow-x-auto sm:w-48 sm:flex-col">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="min-h-11 whitespace-nowrap rounded px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
