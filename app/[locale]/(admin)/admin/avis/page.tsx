import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminReviews } from "@/lib/admin/reviews";
import { ReviewList } from "@/components/admin/review-list";

export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.reviews");

  const reviews = await getAdminReviews();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <ReviewList initialReviews={reviews} />
    </div>
  );
}
