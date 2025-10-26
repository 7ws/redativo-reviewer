"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/header";
import { apiGetWithAuth } from "@/lib/api";
import Theme from "@/types/theme";

export default function ThemePage() {
  const { id } = useParams();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTheme() {
      try {
        const res = await apiGetWithAuth(`/api/v1/themes/${id}/`, router);
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

    if (id) fetchTheme();
  }, [id, router]);

  if (loading) {
    return <div className="p-8 text-gray-600">Carregando tema...</div>;
  }

  if (!theme) {
    return <div className="p-8 text-red-600">Tema não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Reuse your header */}
      <Header showBackButton={true} showHomeButton={true} />

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

        {/* ✏️ Button to write essay */}
        <div className="pt-4">
          <button
            onClick={() => router.push(`/themes/${theme.id}/essay-upload`)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors"
          >
            Escrever Redação
          </button>
        </div>
      </div>
    </div>
  );
}
