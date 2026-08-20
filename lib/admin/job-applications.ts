"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminJobApplication {
  id: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  cvOriginalFilename: string;
  createdAt: string;
}

const COLUMNS =
  "id, job_title_fr, full_name, email, phone, message, cv_original_filename, created_at";

function toAdminJobApplication(row: {
  id: string;
  job_title_fr: string;
  full_name: string;
  email: string;
  phone: string;
  message: string;
  cv_original_filename: string;
  created_at: string;
}): AdminJobApplication {
  return {
    id: row.id,
    jobTitle: row.job_title_fr,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    cvOriginalFilename: row.cv_original_filename,
    createdAt: row.created_at,
  };
}

export async function getAdminJobApplications(): Promise<AdminJobApplication[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_applications")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toAdminJobApplication);
}

export async function deleteJobApplication(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("job_applications").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Le bucket job-application-cvs n'a aucune policy RLS (privé, jamais
 * accédé directement par un client authentifié) — on relit d'abord la
 * candidature via le client cookie standard : la policy RLS is_admin()
 * sur job_applications prouve déjà les droits avant qu'on génère l'URL
 * signée via le client service-role.
 */
export async function getJobApplicationCvUrl(id: string): Promise<string> {
  const supabase = await createClient();
  const { data: application, error } = await supabase
    .from("job_applications")
    .select("cv_path")
    .eq("id", id)
    .single();

  if (error) throw error;

  const admin = createAdminClient();
  const { data, error: signError } = await admin.storage
    .from("job-application-cvs")
    .createSignedUrl(application.cv_path, 60);

  if (signError) throw signError;
  return data.signedUrl;
}
