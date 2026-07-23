import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded bg-surface p-8 text-center sm:p-16">
        <h1 className="text-2xl font-semibold text-foreground sm:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("hero.subtitle")}</p>
        <Link href="/catalogue" className={buttonVariants({ variant: "primary", className: "mt-6" })}>
          {t("hero.cta")}
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">
          {t("categories.title")}
        </h2>
        <Card className="mt-4 p-6 text-muted-foreground">
          {t("comingSoon")}
        </Card>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">
          {t("featured.title")}
        </h2>
        <Card className="mt-4 p-6 text-muted-foreground">
          {t("comingSoon")}
        </Card>
      </section>
    </div>
  );
}
