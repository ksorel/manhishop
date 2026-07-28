import { getTranslations } from "next-intl/server";

const PILL_COUNT = 5;
const CARD_COUNT = 8;

export default async function CatalogueLoading() {
  const t = await getTranslations("catalogue");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8" aria-busy="true">
      <span className="sr-only" role="status">
        {t("loading")}
      </span>

      <div className="h-7 w-40 animate-pulse rounded bg-surface" />

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: PILL_COUNT }).map((_, index) => (
          <div key={index} className="h-11 w-24 shrink-0 animate-pulse rounded-full bg-surface" />
        ))}
      </div>

      <div className="mt-4 h-11 w-full max-w-xs animate-pulse rounded bg-surface" />

      <div className="mt-4 h-4 w-32 animate-pulse rounded bg-surface" />

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: CARD_COUNT }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded border border-border">
            <div className="aspect-square animate-pulse bg-surface" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-surface" />
              <div className="mt-1 h-11 w-full animate-pulse rounded bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
