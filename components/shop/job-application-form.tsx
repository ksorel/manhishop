"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { submitJobApplication, type JobApplicationErrorCode } from "@/lib/jobs/actions";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const ERROR_KEYS: Record<JobApplicationErrorCode, string> = {
  job_not_found: "error",
  cv_required: "cvRequired",
  cv_invalid_type: "cvInvalidType",
  cv_too_large: "cvTooLarge",
  invalid_input: "error",
  unknown: "error",
};

export function JobApplicationForm({ jobId }: { jobId: string }) {
  const t = useTranslations("careers.form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cvFile) {
      setError(t("cvRequired"));
      return;
    }
    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("message", message);
    formData.append("cv", cvFile);

    try {
      const result = await submitJobApplication(formData);
      if (result.code) {
        setError(t(ERROR_KEYS[result.code]));
        return;
      }
      setSuccess(true);
    } catch {
      setError(t("error"));
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return <p className="text-sm font-medium text-foreground">{t("success")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("fullName")}</span>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("email")}</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("phone")}</span>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("message")}</span>
        <textarea
          required
          minLength={10}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("cv")}</span>
        <input
          type="file"
          required
          accept="application/pdf"
          onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm font-medium text-error">{error}</p>}

      <Button type="submit" loading={pending}>
        {t("submit")}
      </Button>
    </form>
  );
}
