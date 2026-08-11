"use client";

import { useTranslations } from "next-intl";
import { Mail, Phone } from "lucide-react";
import { FaCcMastercard, FaCcVisa, FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import { SiOrange } from "react-icons/si";
import { Link } from "@/i18n/navigation";
import type { FooterContent } from "@/lib/content/types";

const SOCIAL_ICONS = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
} as const;

export function SiteFooter({ content }: { content: FooterContent }) {
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");

  const socialLinks = [
    { key: "instagram" as const, href: content.socialInstagram, label: "Instagram" },
    { key: "facebook" as const, href: content.socialFacebook, label: "Facebook" },
    { key: "tiktok" as const, href: content.socialTiktok, label: "TikTok" },
    { key: "whatsapp" as const, href: content.socialWhatsapp, label: "WhatsApp" },
  ].filter((link) => link.href);

  return (
    <footer className="mt-12 flex flex-col items-center gap-5 border-t border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <span className="inline-flex items-center gap-1.5">
          <FaCcVisa className="size-6" aria-hidden="true" />
          Visa
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FaCcMastercard className="size-6" aria-hidden="true" />
          Mastercard
        </span>
        <span className="inline-flex items-center gap-1.5">
          <SiOrange className="size-4" aria-hidden="true" />
          Orange Money
        </span>
        <span>MTN Mobile Money</span>
        <span>Wave</span>
      </div>

      <nav aria-label={tFooter("linksLabel")} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link href="/guide-tailles" className="hover:text-foreground hover:underline">
          {t("sizeGuide")}
        </Link>
        {content.cgvFr && (
          <Link href="/cgv" className="hover:text-foreground hover:underline">
            {tFooter("cgv")}
          </Link>
        )}
        {content.privacyPolicyFr && (
          <Link href="/confidentialite" className="hover:text-foreground hover:underline">
            {tFooter("privacy")}
          </Link>
        )}
      </nav>

      {(content.contactEmail || content.contactPhone) && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {content.contactEmail && (
            <a
              href={`mailto:${content.contactEmail}`}
              className="inline-flex items-center gap-1.5 hover:text-foreground hover:underline"
            >
              <Mail className="size-3.5" aria-hidden="true" />
              {content.contactEmail}
            </a>
          )}
          {content.contactPhone && (
            <a
              href={`tel:${content.contactPhone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 hover:text-foreground hover:underline"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              {content.contactPhone}
            </a>
          )}
        </div>
      )}

      {socialLinks.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          {socialLinks.map((link) => {
            const Icon = SOCIAL_ICONS[link.key];
            return (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="flex size-9 items-center justify-center rounded-full hover:bg-surface hover:text-foreground"
              >
                <Icon className="size-4" aria-hidden="true" />
              </a>
            );
          })}
        </div>
      )}
    </footer>
  );
}
