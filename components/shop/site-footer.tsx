"use client";

import { useTranslations } from "next-intl";
import { Mail, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { FooterContent } from "@/lib/content/types";

const PAYMENT_METHODS = ["Visa", "Mastercard", "Orange Money", "MTN Mobile Money", "Wave"];

export function SiteFooter({ content }: { content: FooterContent }) {
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");

  const socialLinks = [
    { href: content.socialInstagram, label: "Instagram" },
    { href: content.socialFacebook, label: "Facebook" },
    { href: content.socialTiktok, label: "TikTok" },
    { href: content.socialWhatsapp, label: "WhatsApp" },
  ].filter((link) => link.href);

  return (
    <footer className="mt-12 flex flex-col items-center gap-4 border-t border-border px-4 py-6 text-center text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {PAYMENT_METHODS.map((method) => (
          <span
            key={method}
            className="rounded border border-border px-2 py-1 text-xs font-medium text-muted-foreground"
          >
            {method}
          </span>
        ))}
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
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </footer>
  );
}
