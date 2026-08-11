import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSizeGuides } from "@/lib/catalogue/queries";
import { Card } from "@/components/ui/card";
import { SizeGuideTable } from "@/components/shop/size-guide-table";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sizeGuidePage" });

  return { title: `${t("title")} — Manhishop` };
}

export default async function SizeGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sizeGuidePage");

  const guides = await getSizeGuides(locale as Locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>

      <div className="mt-6 flex flex-col gap-6">
        {guides.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          guides.map((guide) => (
            <Card key={guide.id} className="p-4">
              <h2 className="text-lg font-semibold text-foreground">{guide.title}</h2>
              <div className="mt-4">
                <SizeGuideTable content={guide.content} />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
