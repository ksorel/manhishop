import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getJobBySlug } from "@/lib/jobs/queries";
import { JobApplicationForm } from "@/components/shop/job-application-form";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const job = await getJobBySlug(slug, locale as Locale);
  return { title: job ? `${job.title} — Manhishop` : "Manhishop" };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");

  const job = await getJobBySlug(slug, locale as Locale);
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/carrieres" className="text-sm text-primary hover:underline">
        ← {t("backToList")}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-foreground">{job.title}</h1>
      {job.location && <p className="mt-1 text-sm text-muted-foreground">{job.location}</p>}

      <p className="mt-6 whitespace-pre-line text-foreground">{job.description}</p>

      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-lg font-semibold text-foreground">{t("apply")}</h2>
        <div className="mt-4">
          <JobApplicationForm jobId={job.id} />
        </div>
      </div>
    </div>
  );
}
