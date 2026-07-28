import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteChrome } from "@/components/shop/site-chrome";
import { CartProvider } from "@/components/cart/cart-provider";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import { createClient } from "@/lib/supabase/server";
import { getCartItems } from "@/lib/cart/actions";
import type { Locale } from "@/lib/catalogue/types";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
    manifest: "/manifest.json",
    icons: {
      icon: "/icons/icon-192.png",
      apple: "/icons/icon-192.png",
    },
  };
}

export function generateViewport() {
  return {
    themeColor: "#3f7d33",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const cartItems = user ? await getCartItems(locale as Locale) : null;

  return (
    <html lang={locale} className={`${inter.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <NextIntlClientProvider locale={locale}>
            <ConfirmDialogProvider>
              <CartProvider
                userId={user?.id ?? null}
                initialItems={cartItems ?? []}
                locale={locale as Locale}
              >
                <SiteChrome>{children}</SiteChrome>
              </CartProvider>
            </ConfirmDialogProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
