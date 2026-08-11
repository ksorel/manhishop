"use client";

import { useTranslations } from "next-intl";
import { Mail, Phone } from "lucide-react";
import { FaCcVisa, FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import { SiOrange } from "react-icons/si";
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

/** Aucune librairie d'icônes gratuite ne couvre Mastercard (bicolore),
 * MTN Mobile Money ou Wave (marques ouest-africaines) — reproduits ici
 * à la main à partir de leurs couleurs de marque officielles. */
function MastercardMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" className={className} aria-hidden="true">
      <circle cx="12" cy="10" r="10" fill="#EB001B" />
      <circle cx="20" cy="10" r="10" fill="#F79E1B" fillOpacity="0.85" />
    </svg>
  );
}

function MtnMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#FFCC00" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fontFamily="sans-serif"
        fill="#000000"
      >
        MTN
      </text>
    </svg>
  );
}

function WaveMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1DC8F2" />
      <path
        d="M5 13c1.2-2.5 2.4-2.5 3.6 0s2.4 2.5 3.6 0 2.4-2.5 3.6 0 2.4 2.5 3.6 0"
        stroke="#ffffff"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
        <span className="inline-flex items-center gap-1.5">
          <FaCcVisa className="size-6 text-[#1A1F71]" aria-hidden="true" />
          Visa
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MastercardMark className="h-5 w-8" />
          Mastercard
        </span>
        <span className="inline-flex items-center gap-1.5">
          <SiOrange className="size-4 text-[#FF7900]" aria-hidden="true" />
          Orange Money
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MtnMark className="size-5" />
          MTN Mobile Money
        </span>
        <span className="inline-flex items-center gap-1.5">
          <WaveMark className="size-5" />
          Wave
        </span>
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
