import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/catalogue/types";

export function CategoryPills({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  const t = useTranslations("catalogue");

  const pillClass = (active: boolean) =>
    cn(
      "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-foreground hover:bg-surface",
    );

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Link href="/catalogue" className={pillClass(!activeSlug)}>
        {t("allCategories")}
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/catalogue/${category.slug}`}
          className={pillClass(activeSlug === category.slug)}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
