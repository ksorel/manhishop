import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getOpenJobs } from "@/lib/jobs/queries";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");

  const jobs = await getOpenJobs(locale as Locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6 flex flex-col gap-4">
        {jobs.length === 0 && <p className="text-muted-foreground">{t("empty")}</p>}
        {jobs.map((job) => (
          <Link
            key={job.slug}
            href={`/carrieres/${job.slug}`}
            className="flex flex-col gap-1 rounded-lg border border-border p-4 hover:bg-surface"
          >
            <p className="font-medium text-foreground">{job.title}</p>
            {job.location && <p className="text-sm text-muted-foreground">{job.location}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
