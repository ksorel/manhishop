"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { deleteReview } from "@/lib/admin/reviews";
import { cn } from "@/lib/utils";
import type { AdminReview } from "@/lib/admin/reviews";

export function ReviewList({ initialReviews }: { initialReviews: AdminReview[] }) {
  const t = useTranslations("admin.reviews");
  const confirm = useConfirm();
  const [reviews, setReviews] = useState(initialReviews);

  async function handleDelete(id: string) {
    if (!(await confirm({ message: t("confirmDelete"), danger: true }))) return;
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  if (reviews.length === 0) {
    return <Card className="mt-6 p-6 text-muted-foreground">{t("empty")}</Card>;
  }

  return (
    <ul className="mt-6 flex flex-col gap-2">
      {reviews.map((review) => (
        <li key={review.id}>
          <Card className="flex flex-col gap-2 p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{review.productNameFr}</p>
                <p className="text-xs text-muted-foreground">
                  {review.authorName} · {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(review.id)}
                className="shrink-0 text-error hover:underline"
              >
                {t("delete")}
              </button>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn("size-4", n <= review.rating ? "text-warning" : "text-border")}
                  fill={n <= review.rating ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              ))}
            </div>
            {review.comment && <p className="text-foreground">{review.comment}</p>}
          </Card>
        </li>
      ))}
    </ul>
  );
}
