import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function AuthShell({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-y-auto bg-gradient-to-b from-surface via-background to-background px-4 py-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-4 flex flex-col items-center gap-1 text-center">
          <Image
            src="/logo/manhishop.jpeg"
            alt="Manhishop"
            width={44}
            height={44}
            className="rounded-full shadow-sm"
            priority
          />
          <span className="text-base font-semibold text-foreground">Manhishop</span>
          {subtitle && (
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {subtitle}
            </span>
          )}
        </Link>

        <div className="rounded-2xl border border-border bg-background p-5 shadow-lg shadow-black/[0.03] sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
