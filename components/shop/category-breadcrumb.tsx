import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/lib/catalogue/types";

export function CategoryBreadcrumb({
  ancestors,
  current,
}: {
  ancestors: Category[];
  current: Category;
}) {
  if (ancestors.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      {ancestors.map((category) => (
        <span key={category.id} className="flex items-center gap-1">
          <Link href={`/catalogue/${category.slug}`} className="hover:text-foreground hover:underline">
            {category.name}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </span>
      ))}
      <span className="text-foreground">{current.name}</span>
    </nav>
  );
}
