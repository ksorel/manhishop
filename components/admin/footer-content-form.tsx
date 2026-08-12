"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { updateFooterContent } from "@/lib/admin/content";
import type { FooterContent } from "@/lib/content/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function FooterContentForm({ initialContent }: { initialContent: FooterContent }) {
  const t = useTranslations("admin.content");
  const [contactEmail, setContactEmail] = useState(initialContent.contactEmail);
  const [contactPhone, setContactPhone] = useState(initialContent.contactPhone);
  const [socialInstagram, setSocialInstagram] = useState(initialContent.socialInstagram);
  const [socialFacebook, setSocialFacebook] = useState(initialContent.socialFacebook);
  const [socialTiktok, setSocialTiktok] = useState(initialContent.socialTiktok);
  const [socialWhatsapp, setSocialWhatsapp] = useState(initialContent.socialWhatsapp);
  const [cgvFr, setCgvFr] = useState(initialContent.cgvFr);
  const [cgvEn, setCgvEn] = useState(initialContent.cgvEn);
  const [privacyPolicyFr, setPrivacyPolicyFr] = useState(initialContent.privacyPolicyFr);
  const [privacyPolicyEn, setPrivacyPolicyEn] = useState(initialContent.privacyPolicyEn);
  const [legalNoticeFr, setLegalNoticeFr] = useState(initialContent.legalNoticeFr);
  const [legalNoticeEn, setLegalNoticeEn] = useState(initialContent.legalNoticeEn);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      await updateFooterContent({
        contactEmail,
        contactPhone,
        socialInstagram,
        socialFacebook,
        socialTiktok,
        socialWhatsapp,
        cgvFr,
        cgvEn,
        privacyPolicyFr,
        privacyPolicyEn,
        legalNoticeFr,
        legalNoticeEn,
      });
      setMessage(t("saved"));
    } catch {
      setMessage(t("saveError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {message && <p className="text-sm text-foreground">{message}</p>}

      <p className="text-xs text-muted-foreground">{t("footerHint")}</p>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">{t("contactSection")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">{t("contactEmail")}</span>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">{t("contactPhone")}</span>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">{t("socialSection")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">Instagram</span>
            <input
              type="url"
              value={socialInstagram}
              onChange={(e) => setSocialInstagram(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">Facebook</span>
            <input
              type="url"
              value={socialFacebook}
              onChange={(e) => setSocialFacebook(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">TikTok</span>
            <input
              type="url"
              value={socialTiktok}
              onChange={(e) => setSocialTiktok(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">WhatsApp</span>
            <input
              type="url"
              value={socialWhatsapp}
              onChange={(e) => setSocialWhatsapp(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">{t("cgvSection")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">{t("cgvFr")}</span>
            <textarea
              rows={4}
              value={cgvFr}
              onChange={(e) => setCgvFr(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">{t("cgvEn")}</span>
            <textarea
              rows={4}
              value={cgvEn}
              onChange={(e) => setCgvEn(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">{t("privacySection")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">{t("privacyFr")}</span>
            <textarea
              rows={4}
              value={privacyPolicyFr}
              onChange={(e) => setPrivacyPolicyFr(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">{t("privacyEn")}</span>
            <textarea
              rows={4}
              value={privacyPolicyEn}
              onChange={(e) => setPrivacyPolicyEn(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">{t("legalSection")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">{t("legalFr")}</span>
            <textarea
              rows={4}
              value={legalNoticeFr}
              onChange={(e) => setLegalNoticeFr(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">{t("legalEn")}</span>
            <textarea
              rows={4}
              value={legalNoticeEn}
              onChange={(e) => setLegalNoticeEn(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <Button type="submit" loading={pending} className="self-start">
        {t("save")}
      </Button>
    </form>
  );
}
