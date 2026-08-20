"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendJobApplicationAlert } from "@/lib/email/send-job-application-alert";

export type JobApplicationErrorCode =
  | "job_not_found"
  | "cv_required"
  | "cv_invalid_type"
  | "cv_too_large"
  | "invalid_input"
  | "unknown";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;

const applicationSchema = z.object({
  jobId: z.string().uuid(),
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  message: z.string().trim().min(10),
});

/**
 * Action publique, accessible sans compte — toute l'écriture passe par le
 * client service-role (comme createPendingOrder) : aucune policy RLS
 * d'insert n'est nécessaire sur job_applications. Le fichier n'est jamais
 * fait confiance côté client : type et taille revérifiés ici, jamais
 * seulement via l'attribut `accept` du `<input>`.
 */
export async function submitJobApplication(
  formData: FormData,
): Promise<{ code: JobApplicationErrorCode | null }> {
  const parsed = applicationSchema.safeParse({
    jobId: formData.get("jobId"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { code: "invalid_input" };

  const cv = formData.get("cv") as File | null;
  if (!cv || cv.size === 0) return { code: "cv_required" };
  if (cv.type !== "application/pdf") return { code: "cv_invalid_type" };
  if (cv.size > MAX_CV_SIZE_BYTES) return { code: "cv_too_large" };

  const admin = createAdminClient();

  const { data: job, error: jobError } = await admin
    .from("jobs")
    .select("id, title_fr")
    .eq("id", parsed.data.jobId)
    .eq("status", "active")
    .maybeSingle();
  if (jobError) throw jobError;
  if (!job) return { code: "job_not_found" };

  try {
    const safeName = cv.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${job.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await admin.storage
      .from("job-application-cvs")
      .upload(path, cv, { contentType: "application/pdf" });
    if (uploadError) throw uploadError;

    const { error: insertError } = await admin.from("job_applications").insert({
      job_id: job.id,
      job_title_fr: job.title_fr,
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      cv_path: path,
      cv_original_filename: cv.name,
    });
    if (insertError) throw insertError;
  } catch (error) {
    console.error("Échec de la soumission de candidature:", error);
    return { code: "unknown" };
  }

  try {
    await sendJobApplicationAlert(admin, {
      jobTitle: job.title_fr,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
    });
  } catch (alertError) {
    console.error("Échec de l'alerte email candidature:", alertError);
  }

  return { code: null };
}
