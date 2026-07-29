import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CartBadge } from "@/components/cart/cart-badge";
import { InstallAppButton } from "@/components/shop/install-app-button";

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/manhishop.jpeg"
            alt="Manhishop"
            width={60}
            height={60}
            className="rounded-full"
            priority
          />
        </Link>

        <nav
          aria-label={t("home")}
          className="hidden items-center gap-6 text-sm font-medium text-foreground sm:flex"
        >
          <Link href="/">{t("home")}</Link>
          <Link href="/catalogue">{t("catalogue")}</Link>
          <Link href="/panier" className="relative">
            {t("cart")}
            <CartBadge />
          </Link>
          <Link href="/compte">{t("account")}</Link>
        </nav>

        <div className="flex items-center gap-2">
          <InstallAppButton />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
