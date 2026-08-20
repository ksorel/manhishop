"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { JobForm } from "@/components/admin/job-form";
import {
  createJob,
  deleteJob,
  updateJob,
  type AdminJob,
  type AdminJobInput,
} from "@/lib/admin/jobs";

export function JobManager({ initialJobs }: { initialJobs: AdminJob[] }) {
  const t = useTranslations("admin.jobs");
  const confirm = useConfirm();
  const [jobs, setJobs] = useState(initialJobs);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(input: AdminJobInput) {
    const created = await createJob(input);
    setJobs((prev) => [created, ...prev]);
    setAdding(false);
  }

  async function handleUpdate(id: string, input: AdminJobInput) {
    const updated = await updateJob(id, input);
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!(await confirm({ message: t("confirmDelete"), danger: true }))) return;
    await deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      {jobs.length === 0 && !adding && (
        <Card className="p-6 text-muted-foreground">{t("empty")}</Card>
      )}

      {jobs.map((job) =>
        editingId === job.id ? (
          <Card key={job.id} className="p-4">
            <JobForm
              initialJob={job}
              onSubmit={(input) => handleUpdate(job.id, input)}
              onCancel={() => setEditingId(null)}
            />
          </Card>
        ) : (
          <Card key={job.id} className="flex items-center justify-between gap-3 p-4 text-sm">
            <div>
              <p className="font-medium text-foreground">
                {job.titleFr}
                {job.location && <span className="text-muted-foreground"> · {job.location}</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {job.status === "active" ? t("active") : t("draft")}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setEditingId(job.id)}
                className="text-primary hover:underline"
              >
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(job.id)}
                className="text-error hover:underline"
              >
                {t("delete")}
              </button>
            </div>
          </Card>
        ),
      )}

      {adding ? (
        <Card className="p-4">
          <JobForm onSubmit={handleAdd} onCancel={() => setAdding(false)} />
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={buttonVariants({ variant: "secondary", className: "self-start" })}
        >
          {t("add")}
        </button>
      )}
    </div>
  );
}
