"use client";

import { usePathname } from "@/i18n/navigation";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { BottomNav } from "@/components/shop/bottom-nav";
import type { FooterContent } from "@/lib/content/types";

const BARE_PATHS = [
  "/connexion",
  "/inscription",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
];

export function SiteChrome({
  children,
  footerContent,
}: {
  children: React.ReactNode;
  footerContent: FooterContent;
}) {
  const pathname = usePathname();
  const bare = BARE_PATHS.includes(pathname) || pathname.startsWith("/admin");

  if (bare) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-16 sm:pb-0">
        {children}
        <SiteFooter content={footerContent} />
      </main>
      <BottomNav />
    </>
  );
}
