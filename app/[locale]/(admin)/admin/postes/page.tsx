import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminJobs } from "@/lib/admin/jobs";
import { JobManager } from "@/components/admin/job-manager";

export default async function AdminJobsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.jobs");
  const jobs = await getAdminJobs();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        <JobManager initialJobs={jobs} />
      </div>
    </div>
  );
}
