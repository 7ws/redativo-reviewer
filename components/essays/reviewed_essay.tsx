"use client";

import Essay from "@/types/essay";
import Header from "../header";
import ReviewedEssayViewer from "./reviewed_essay_viewer";

export default function EssayReviewed({ essay }: { essay: Essay }) {
  const review = essay.reviews[0];

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          showLogoutButton={true}
          showProfileButton={false}
          showHomeButton={true}
          showBackButton={true}
        />
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Nenhuma avaliação encontrada para esta redação.
          </div>
        </div>
      </div>
    );
  }

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
