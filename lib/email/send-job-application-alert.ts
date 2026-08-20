import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";
import type { createAdminClient } from "@/lib/supabase/admin";

interface NewApplication {
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
}

function renderHtml(application: NewApplication): string {
  return `
    <div>
      <p>Nouvelle candidature reçue pour <strong>${application.jobTitle}</strong> :</p>
      <ul>
        <li>${application.fullName}</li>
        <li>${application.email}</li>
        <li>${application.phone}</li>
      </ul>
      <p><a href="${SITE_URL}/fr/admin/candidatures">Voir la candidature</a></p>
    </div>
  `;
}

/**
 * Best-effort, comme les autres emails transactionnels du site : n'échoue
 * jamais bruyamment (RESEND_API_KEY absente ou erreur Resend) puisque ce
 * n'est qu'une notification, jamais bloquant pour l'enregistrement de la
 * candidature elle-même.
 */
export async function sendJobApplicationAlert(
  admin: ReturnType<typeof createAdminClient>,
  application: NewApplication,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY absente — alerte candidature non envoyée.");
    return;
  }

  const { data: admins, error } = await admin.from("profiles").select("id").eq("role", "admin");
  if (error) throw error;

  const recipients: string[] = [];
  for (const { id } of admins ?? []) {
    const { data } = await admin.auth.admin.getUserById(id);
    if (data.user?.email) recipients.push(data.user.email);
  }
  if (recipients.length === 0) return;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Manhishop <commandes@manhishopci.com>",
      to: recipients,
      subject: `Nouvelle candidature — ${application.jobTitle}`,
      html: renderHtml(application),
    });
  } catch (sendError) {
    console.error("Échec de l'envoi de l'alerte candidature:", sendError);
  }
}
