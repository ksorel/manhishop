"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReferralLink({ link }: { link: string }) {
  const t = useTranslations("account.loyalty");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-foreground">{t("referralLink")}</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={link}
          className="min-h-11 flex-1 truncate rounded border border-border bg-background px-3 text-sm text-muted-foreground"
        />
        <button
          type="button"
          onClick={handleCopy}
          className={cn(buttonVariants({ variant: "secondary" }), "shrink-0 gap-1.5 text-xs")}
        >
          {copied ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copied ? t("copied") : t("copyLink")}
        </button>
      </div>
    </div>
  );
}
