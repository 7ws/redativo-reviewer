"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { statusTexts } from "../reviews/status_text";
import { apiRequest } from "@/lib/api";
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
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [themesError, setThemesError] = useState<string | null>(null);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const router = useRouter();

  const fetchThemes = async () => {
    setLoadingThemes(true);
    setThemesError(null);
    const { data, error } = await apiRequest<Theme[]>(
      `/api/v1/reviewer/themes/`,
      { method: "GET", auth: true },
      router,
    );
    if (error) {
      setThemesError(error);
    } else {
      setThemes(data || []);
    }
    setLoadingThemes(false);
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    setReviewsError(null);
    const { data, error } = await apiRequest<Review[]>(
      `/api/v1/reviewer/my-reviews/`,
      { method: "GET", auth: true },
      router,
    );
    if (error) {
      setReviewsError(error);
    } else {
      setReviews(data || []);
    }
    setLoadingReviews(false);
  };

  useEffect(() => {
    fetchThemes();
  }, [router]);

  useEffect(() => {
    fetchReviews();
  }, [router]);

  async function handleNewReview(theme_id: string, essay_id: string) {
    const { data } = await apiRequest<{ id: string }>(
      `/api/v1/reviewer/themes/${theme_id}/essays/${essay_id}/reviews/`,
      { method: "POST", auth: true },
      router,
    );
    if (data?.id) {
      router.push(`/themes/${theme_id}/essays/${essay_id}/reviews/${data.id}`);
    }
  }

  return (
    <div className="p-4 space-y-4">
      {activeTab === "temas" && (
        <>
          {loadingThemes && (
            <div className="text-center py-8 text-gray-600">
              Carregando temas...
            </div>
          )}

          {themesError && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{themesError}</p>
              <Button onClick={fetchThemes} variant="outline">
                Tentar novamente
              </Button>
            </div>
          )}

          {!loadingThemes &&
            !themesError &&
            themes.map((theme: Theme) => {
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
                        <h3 className="font-bold text-sm mb-2">
                          {theme.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {theme.short_description}
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
        </>
      )}

      {activeTab === "revisoes" && (
        <>
          {loadingReviews && (
            <div className="text-center py-8 text-gray-600">
              Carregando suas revisões...
            </div>
          )}

          {reviewsError && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{reviewsError}</p>
              <Button onClick={fetchReviews} variant="outline">
                Tentar novamente
              </Button>
            </div>
          )}

          {!loadingReviews &&
            !reviewsError &&
            reviews.map((review: Review) => {
              const essay: Essay = review.essay;

              return (
                <Card
                  key={review.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() =>
                    router.push(
                      `/themes/${essay.theme.id}/essays/${essay.id}/reviews/${review.id}/`,
                    )
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
                        <h3 className="font-bold text-sm mb-1">
                          {essay.title}
                        </h3>
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
        </>
      )}
    </div>
  );
}
