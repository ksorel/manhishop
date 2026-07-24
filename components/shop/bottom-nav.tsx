import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CartBadge } from "@/components/cart/cart-badge";
import { Home, LayoutGrid, Search, ShoppingCart, User } from "lucide-react";

export function BottomNav() {
  const t = useTranslations("nav");

  const items = [
    { href: "/" as const, label: t("home"), icon: Home },
    { href: "/catalogue" as const, label: t("catalogue"), icon: LayoutGrid },
    { href: "/recherche" as const, label: t("search"), icon: Search },
    { href: "/panier" as const, label: t("cart"), icon: ShoppingCart, showCartBadge: true },
    { href: "/compte" as const, label: t("account"), icon: User },
  ];

  return (
    <nav
      aria-label={t("home")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background sm:hidden"
    >
      <ul className="flex items-stretch justify-between">
        {items.map(({ href, label, icon: Icon, showCartBadge }) => (
          <li key={href} className="flex-1">
            <Link
              href={href}
              className="flex min-h-11 flex-col items-center justify-center gap-0.5 py-2 text-xs text-foreground"
            >
              <span className="relative">
                <Icon className="size-5" aria-hidden="true" />
                {showCartBadge && <CartBadge />}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
