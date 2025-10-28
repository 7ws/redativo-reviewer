"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGetWithAuth } from "@/lib/api";
import Essay from "@/types/essay";
import EssayReviewed from "@/components/essays/reviewed_essay";
import EssayNotReviewed from "@/components/essays/not_reviewed_essay";

export default function EssayPage() {
  const { theme_id } = useParams();
  const { id } = useParams();
  const router = useRouter();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEssay() {
      setLoading(true);
      try {
        const res = await apiGetWithAuth(
          `/api/v1/themes/${theme_id}/essays/${id}/`,
          router,
        );
        const data = await res.json();
        setEssay(data);
      } catch (err) {
        console.error("Error fetching essay:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEssay();
  }, [id, theme_id, router]);

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!essay)
    return <div className="p-8 text-red-600">Redação não encontrada.</div>;

  // ✅ Conditionally render component
  if (essay.status === "REVIEWED") {
    return <EssayReviewed essay={essay} />;
  }

  return <EssayNotReviewed essay={essay} />;
}
