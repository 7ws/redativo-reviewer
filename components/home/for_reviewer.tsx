"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { statusTexts } from "../reviews/status_text";
import { apiGetWithAuth, apiPostWithAuth } from "@/lib/api";
import Theme from "@/types/theme_for_reviewer";
import Essay from "@/types/essay";
import Review from "@/types/review";

export default function ForReviewerHomePage({
  activeTab,
  showAll,
}: {
  activeTab: "temas" | "revisoes";
  showAll: boolean;
}) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // --- Fetch themes information ---
  useEffect(() => {
    async function fetchThemes() {
      setLoading(true);
      try {
        const res = await apiGetWithAuth(`/api/v1/reviewer/themes/`, router);
        const data = await res.json();
        setThemes(data);
      } catch (err) {
        console.error("Error fetching active themes:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchThemes();
  }, [router, showAll]);

  // --- Fetch review information ---
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        const res = await apiGetWithAuth(
          `/api/v1/reviewer/my-reviews/`,
          router,
        );
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Error fetching essays for review:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [router]);

  async function handleNewReview(theme_id: string, essay_id: string) {
    try {
      const res = await apiPostWithAuth(
        `/api/v1/reviewer/themes/${theme_id}/essays/${essay_id}/reviews/`,
        router,
      );
      const data = await res.json();
      router.push(
        `/themes/${data.theme_id}/essays/${essay_id}/reviews/${data.id}`,
      );
    } catch (err) {
      console.error("Error starting new review:", err);
    }
  }

  const filteredThemes = showAll ? themes : themes;

  if (loading) {
    return <div className="p-8 text-gray-600">Carregando temas...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {activeTab === "temas" &&
        filteredThemes.map((theme: Theme) => {
          return (
            <Card
              key={theme.id}
              className="overflow-hidden cursor-pointer"
              onClick={() => router.push(`/themes/${theme.id}`)}
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Thumbnail */}
                  <div className="w-32 h-24 flex items-center justify-center relative">
                    {theme.background_image ? (
                      <Image
                        src={theme.background_image}
                        alt={theme.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-teal-300 to-blue-300" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-sm mb-2">{theme.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {theme.description}
                    </p>

                    {theme.essays_pending_review.map((essay_id: string) => (
                      <button
                        key={essay_id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNewReview(theme.id, essay_id);
                        }}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        Revisar Redação
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

      {activeTab === "revisoes" &&
        reviews.map((review: Review) => {
          const essay: Essay = review.essay;

          return (
            <Card
              key={review.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() =>
                router.push(`/themes/${essay.theme.id}/essays/${review.id}`)
              }
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Left image section */}
                  <div className="w-32 h-24 flex items-center justify-center relative">
                    {essay.theme.background_image ? (
                      <Image
                        src={essay.theme.background_image}
                        alt={essay.theme.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-teal-300 to-blue-300" />
                    )}
                  </div>

                  {/* Right content section */}
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-sm mb-1">{essay.title}</h3>
                    <p className="text-xs text-gray-600 italic mb-1">
                      {essay.theme.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Status: {statusTexts[review.status]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
