import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-surface via-background to-background px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex flex-col items-center gap-2 text-center">
          <Image
            src="/logo/manhishop.jpeg"
            alt="Manhishop"
            width={56}
            height={56}
            className="rounded-full shadow-sm"
            priority
          />
          <span className="text-lg font-semibold text-foreground">Manhishop</span>
        </Link>

        <div className="rounded-2xl border border-border bg-background p-6 shadow-lg shadow-black/[0.03] sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
