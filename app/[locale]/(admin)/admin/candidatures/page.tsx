import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminJobApplications } from "@/lib/admin/job-applications";
import { JobApplicationList } from "@/components/admin/job-application-list";

export default async function AdminJobApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.applications");
  const applications = await getAdminJobApplications();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        <JobApplicationList initialApplications={applications} />
      </div>
    </div>
  );
}
