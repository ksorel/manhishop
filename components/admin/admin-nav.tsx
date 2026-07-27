"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  LayoutDashboard,
  Package,
  Store,
  Tags,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin" as const, key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/admin/produits" as const, key: "products" as const, icon: Package },
  { href: "/admin/categories" as const, key: "categories" as const, icon: Tags },
  { href: "/admin/commandes" as const, key: "orders" as const, icon: ClipboardList },
  { href: "/admin/utilisateurs" as const, key: "users" as const, icon: Users },
];

export function AdminNav() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 flex-col gap-6 sm:sticky sm:top-6 sm:w-60 sm:self-start">
      <Link href="/" className="flex items-center gap-2 px-1">
        <Image
          src="/logo/manhishop.jpeg"
          alt="Manhishop"
          width={32}
          height={32}
          className="rounded-full"
        />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">Manhishop</p>
          <p className="text-xs text-muted-foreground">{t("title")}</p>
        </div>
      </Link>

      <div className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-surface",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {t(`nav.${key}`)}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground hover:bg-surface"
        >
          <Store className="size-4 shrink-0" aria-hidden="true" />
          {t("backToShop")}
        </Link>
        <SignOutButton className="w-full justify-start gap-3 bg-transparent text-foreground hover:bg-surface hover:opacity-100" />
      </div>
    </nav>
  );
}
