"use client";

import Review from "@/types/review";
import Header from "../header";
import ReviewedEssayViewer from "../essays/reviewed_essay_viewer";

export default function FinishedReview({ review }: { review: Review }) {
  const essay = review.essay;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showLogoutButton={true}
        showProfileButton={false}
        showHomeButton={true}
        showBackButton={true}
      />
      <ReviewedEssayViewer review={review} essayImageUrl={essay.text_image} />
    </div>
  );
}
