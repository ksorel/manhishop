"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CartBadge } from "@/components/cart/cart-badge";
import { InstallAppButton } from "@/components/shop/install-app-button";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const navItems = [
    { href: "/" as const, label: t("home") },
    { href: "/catalogue" as const, label: t("catalogue") },
    { href: "/panier" as const, label: t("cart") },
    { href: "/compte" as const, label: t("account") },
    { href: "/guide-tailles" as const, label: t("sizeGuide") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/manhishop.jpeg"
            alt="Manhishop"
            width={85}
            height={85}
            className="rounded-full"
            priority
          />
        </Link>

        <nav
          aria-label={t("home")}
          className="hidden items-center gap-6 text-sm font-medium sm:flex"
        >
          {navItems.map(({ href, label }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative",
                  active ? "text-primary" : "text-foreground",
                )}
              >
                {label}
                {href === "/panier" && <CartBadge />}
              </Link>
            );
          })}
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
