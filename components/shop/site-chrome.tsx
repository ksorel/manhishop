"use client";

import { usePathname } from "@/i18n/navigation";
import { SiteHeader } from "@/components/shop/site-header";
import { BottomNav } from "@/components/shop/bottom-nav";

const BARE_PATHS = ["/connexion", "/inscription"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_PATHS.includes(pathname) || pathname.startsWith("/admin");

  if (bare) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <BottomNav />
    </>
  );
}
