"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
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

      const { data, error } = await apiRequest<Essay>(
        `/api/v1/writer/themes/${theme_id}/essays/${essay_id}/`,
        { method: "GET" },
        router,
      );

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      setEssay(data || null);
      setLoading(false);
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
