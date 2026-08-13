"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { submitReview, deleteMyReview } from "@/lib/reviews/actions";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/reviews/queries";

function StarRow({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(size, n <= value ? "text-warning" : "text-border")}
          fill={n <= value ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function ProductReviews({
  productId,
  initialReviews,
  eligibility,
}: {
  productId: string;
  initialReviews: Review[];
  eligibility: { canReview: boolean; myReviewId: string | null };
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const confirm = useConfirm();

  const [reviews, setReviews] = useState(initialReviews);
  const [myReviewId, setMyReviewId] = useState(eligibility.myReviewId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const myReview = reviews.find((r) => r.id === myReviewId) ?? null;
  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  async function handleSubmit() {
    if (rating === 0) return;
    setPending(true);
    setError(false);
    try {
      const result = await submitReview(productId, rating, comment);
      if (result.status !== "ok") {
        setError(true);
        return;
      }
      // Rafraîchit localement plutôt que de re-fetch la page entière.
      const optimisticReview: Review = {
        id: myReviewId ?? crypto.randomUUID(),
        rating,
        comment,
        authorName: myReview?.authorName ?? t("you"),
        createdAt: new Date().toISOString(),
      };
      setReviews((prev) => [optimisticReview, ...prev.filter((r) => r.id !== myReviewId)]);
      setMyReviewId(optimisticReview.id);
      setRating(0);
      setComment("");
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!myReviewId) return;
    if (!(await confirm({ message: t("confirmDelete"), danger: true }))) return;
    await deleteMyReview(myReviewId);
    setReviews((prev) => prev.filter((r) => r.id !== myReviewId));
    setMyReviewId(null);
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-foreground">{t("title")}</h2>

      <div className="mt-3 flex items-center gap-2">
        <StarRow value={Math.round(average)} />
        <span className="text-sm text-muted-foreground">
          {t("average", { rating: average.toFixed(1), count: reviews.length })}
        </span>
      </div>

      {reviews.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">{t("empty")}</p>
      )}

      <ul className="mt-4 flex flex-col gap-3">
        {reviews.map((review) => (
          <li key={review.id}>
            <Card className="flex flex-col gap-1 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-foreground">{review.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString(locale)}
                </span>
              </div>
              <StarRow value={review.rating} />
              {review.comment && <p className="text-foreground">{review.comment}</p>}
              {review.id === myReviewId && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="mt-1 self-start text-xs text-error hover:underline"
                >
                  {t("deleteYourReview")}
                </button>
              )}
            </Card>
          </li>
        ))}
      </ul>

      {eligibility.canReview && !myReviewId && (
        <Card className="mt-4 flex flex-col gap-3 p-4">
          <span className="text-sm font-medium text-foreground">{t("yourRating")}</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={String(n)}
                className="flex size-11 items-center justify-center"
              >
                <Star
                  className={cn("size-6", n <= rating ? "text-warning" : "text-border")}
                  fill={n <= rating ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground">{t("commentLabel")}</span>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="rounded border border-border bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          {error && <p className="text-sm font-medium text-error">{t("error")}</p>}
          <Button
            type="button"
            onClick={handleSubmit}
            loading={pending}
            disabled={rating === 0}
            className="self-start"
          >
            {t("submit")}
          </Button>
        </Card>
      )}
    </section>
  );
}
