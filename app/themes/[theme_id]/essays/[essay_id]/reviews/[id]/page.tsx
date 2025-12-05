"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import Review from "@/types/review";
import FinishedReview from "@/components/reviews/finished_review";
import InProgressReview from "@/components/reviews/in_progress_review";

export default function ReviewPage() {
  const { theme_id } = useParams();
  const { essay_id } = useParams();
  const { id } = useParams();
  const router = useRouter();
  const [review, setReview] = useState<Review>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReview() {
      setLoading(true);
      const { data } = await apiRequest<Review>(
        `/api/v1/reviewer/themes/${theme_id}/essays/${essay_id}/reviews/${id}/`,
        { method: "GET", auth: true },
        router,
      );
      setReview(data);
      setLoading(false);
    }

    fetchReview();
  }, [essay_id, theme_id, id, router]);

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!review)
    return <div className="p-8 text-red-600">Revisão não encontrada.</div>;

  // ✅ Conditionally render component
  if (review.status === "SUBMITTED") {
    return <FinishedReview review={review} />;
  }

  return <InProgressReview review={review} />;
}
