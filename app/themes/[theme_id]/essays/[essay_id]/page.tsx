"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGetWithAuth } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import Essay from "@/types/essay";
import EssayReviewed from "@/components/essays/reviewed_essay";
import EssayNotReviewed from "@/components/essays/not_reviewed_essay";

export default function EssayPage() {
  const { theme_id } = useParams();
  const { essay_id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth({ requireAuth: true });
  const [essay, setEssay] = useState<Essay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEssay() {
      if (authLoading) return;

      setLoading(true);
      setError(null);

      try {
        const res = await apiGetWithAuth(
          `/api/v1/writer/themes/${theme_id}/essays/${essay_id}/`,
          router,
        );

        if (!res?.ok) {
          setError("Erro ao carregar a redação.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setEssay(data);
      } catch (err) {
        console.error("Error fetching essay:", err);
        setError("Erro ao carregar a redação.");
      } finally {
        setLoading(false);
      }
    }

    fetchEssay();
  }, [essay_id, theme_id, router, authLoading]);

  if (authLoading || loading) {
    return <div className="min-h-screen p-8">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!essay) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Redação não encontrada.
        </div>
      </div>
    );
  }

  // ✅ Conditionally render component
  if (essay.status === "REVIEWED") {
    return <EssayReviewed essay={essay} />;
  }

  return <EssayNotReviewed essay={essay} />;
}
