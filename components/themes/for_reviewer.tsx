"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGetWithAuth, apiGetWithoutAuth, apiPostWithAuth } from "@/lib/api";
import Theme from "@/types/theme_for_reviewer";

export default function ThemeForReviewerPage({
  theme_id,
}: {
  theme_id: string;
}) {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTheme() {
      setLoading(true);
      try {
        const res = await apiGetWithAuth(
          `/api/v1/reviewer/themes/${theme_id}/`,
          router,
        );
        if (res.ok) {
          const data = await res.json();
          setTheme(data);
        }
      } catch (err) {
        console.error("Erro ao carregar o tema:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTheme();
  }, [theme_id, router]);

  async function handleNewReview(theme_id: string, essay_id: string) {
    try {
      const res = await apiPostWithAuth(
        `/api/v1/reviewer/themes/${theme_id}/essays/${essay_id}/reviews/`,
        router,
      );
      const data = await res.json();
      router.push(`/themes/${theme_id}/essays/${essay_id}/reviews/${data.id}`);
    } catch (err) {
      console.error("Error starting new review:", err);
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-600">Carregando tema...</div>;
  }

  if (!theme) {
    return <div className="p-8 text-red-600">Tema não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image */}
      {theme.background_image ? (
        <div className="w-full h-64 md:h-80 lg:h-96 overflow-hidden">
          <img
            src={theme.background_image}
            alt={theme.title}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500 text-sm italic">
          Nenhuma imagem disponível
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{theme.title}</h1>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {theme.description}
        </p>

        <div className="pt-4">
          {theme.essays_pending_review.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();

                // pick a random essay id
                const essays = theme.essays_pending_review;
                const randomEssay =
                  essays[Math.floor(Math.random() * essays.length)];

                handleNewReview(theme.id, randomEssay);
              }}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded"
            >
              Revisar Redação
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
