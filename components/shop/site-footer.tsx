"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import type { FooterContent } from "@/lib/content/types";

const SOCIAL_ICONS = {
  instagram: { Icon: FaInstagram, colorClass: "text-[#E4405F]" },
  facebook: { Icon: FaFacebook, colorClass: "text-[#1877F2]" },
  // Un seul ton (plutôt qu'un bascule noir/blanc par thème) pour garantir
  // un contraste correct sur fond clair ET sombre sans dépendre du thème.
  tiktok: { Icon: FaTiktok, colorClass: "text-[#FE2C55]" },
  whatsapp: { Icon: FaWhatsapp, colorClass: "text-[#25D366]" },
} as const;

const PAYMENT_BADGES = [
  { src: "/logo/payments/visa.png", alt: "Visa", width: 154, height: 148 },
  { src: "/logo/payments/mastercard.png", alt: "Mastercard", width: 149, height: 148 },
  { src: "/logo/payments/mtn-momo.png", alt: "MTN MoMo", width: 270, height: 148 },
  { src: "/logo/payments/orange-money.png", alt: "Orange Money", width: 148, height: 148 },
  { src: "/logo/payments/wave.png", alt: "Wave", width: 264, height: 148 },
] as const;

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
    <footer className="mt-12 flex flex-col items-center gap-5 border-t border-border bg-black/[0.05] px-4 py-8 text-center text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {PAYMENT_BADGES.map((badge) => (
          <Image
            key={badge.src}
            src={badge.src}
            alt={badge.alt}
            width={badge.width}
            height={badge.height}
            className="h-7 w-auto rounded-md"
          />
        ))}
      </div>

      <nav aria-label={tFooter("linksLabel")} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link href="/guide-tailles" className="hover:text-foreground hover:underline">
          {t("sizeGuide")}
        </Link>
        <Link href="/actualites" className="hover:text-foreground hover:underline">
          {tFooter("news")}
        </Link>
        <Link href="/carrieres" className="hover:text-foreground hover:underline">
          {tFooter("careers")}
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
        {content.legalNoticeFr && (
          <Link href="/mentions-legales" className="hover:text-foreground hover:underline">
            {tFooter("legalNotice")}
          </Link>
        )}
      </nav>

      {(content.contactEmail || content.contactPhone || content.contactPhone2) && (
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
          {content.contactPhone2 && (
            <a
              href={`tel:${content.contactPhone2.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 hover:text-foreground hover:underline"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              {content.contactPhone2}
            </a>
          )}
        </div>
      )}

      {socialLinks.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          {socialLinks.map((link) => {
            const { Icon, colorClass } = SOCIAL_ICONS[link.key];
            return (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="flex size-9 items-center justify-center rounded-full hover:bg-surface"
              >
                <Icon className={`size-4 ${colorClass}`} aria-hidden="true" />
              </a>
            );
          })}
        </div>
      )}
    </footer>
  );
}
