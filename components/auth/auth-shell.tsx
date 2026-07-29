import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-y-auto bg-gradient-to-b from-surface via-background to-background px-4 py-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-4 flex flex-col items-center gap-1 text-center">
          <Image
            src="/logo/manhishop.jpeg"
            alt="Manhishop"
            width={84}
            height={84}
            className="rounded-full shadow-sm"
            priority
          />
        </Link>

        <div className="rounded-2xl border border-border bg-background p-5 shadow-lg shadow-black/[0.03] sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
