"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  deleteJobApplication,
  getJobApplicationCvUrl,
  type AdminJobApplication,
} from "@/lib/admin/job-applications";

export function JobApplicationList({
  initialApplications,
}: {
  initialApplications: AdminJobApplication[];
}) {
  const t = useTranslations("admin.applications");
  const confirm = useConfirm();
  const [applications, setApplications] = useState(initialApplications);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(id: string) {
    setDownloadingId(id);
    try {
      const url = await getJobApplicationCvUrl(id);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!(await confirm({ message: t("confirmDelete"), danger: true }))) return;
    await deleteJobApplication(id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  if (applications.length === 0) {
    return <Card className="p-6 text-muted-foreground">{t("empty")}</Card>;
  }

  return (
    <div className="flex flex-col gap-4">
      {applications.map((application) => (
        <Card key={application.id} className="flex flex-col gap-3 p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-foreground">{application.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {application.jobTitle} · {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => handleDownload(application.id)}
                disabled={downloadingId === application.id}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {t("downloadCv")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(application.id)}
                className="text-error hover:underline"
              >
                {t("delete")}
              </button>
            </div>
          </div>
          <p className="text-muted-foreground">
            {application.email} · {application.phone}
          </p>
          <p className="whitespace-pre-line text-foreground">{application.message}</p>
        </Card>
      ))}
    </div>
  );
}
