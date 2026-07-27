import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function AdminNav() {
  const t = useTranslations("admin.nav");

  const items = [
    { href: "/admin" as const, label: t("dashboard") },
    { href: "/admin/produits" as const, label: t("products") },
    { href: "/admin/categories" as const, label: t("categories") },
    { href: "/admin/commandes" as const, label: t("orders") },
    { href: "/admin/utilisateurs" as const, label: t("users") },
  ];

  return (
    <nav className="flex shrink-0 flex-col gap-2 sm:w-48">
      <div className="flex gap-2 overflow-x-auto sm:flex-col">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="min-h-11 whitespace-nowrap rounded px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <SignOutButton />
    </nav>
  );
}
