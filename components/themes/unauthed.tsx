"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { apiRequest } from "@/lib/api";
import Theme from "@/types/theme";

export default function UnauthThemePage({ theme_id }: { theme_id: string }) {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTheme = async () => {
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await apiRequest<Theme>(
      `/api/v1/common/themes/${theme_id}/`,
      { method: "GET", auth: false },
      router,
    );
    if (apiError) {
      setError(apiError);
    } else {
      setTheme(data || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTheme();
  }, [theme_id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-8 text-gray-600">Carregando tema...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchTheme} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-8 text-red-600">Tema não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image */}
      {theme.background_image ? (
        <div className="w-full h-64 md:h-80 lg:h-96 relative overflow-hidden">
          <Image
            src={theme.background_image}
            alt={theme.title}
            fill
            className="object-cover object-center"
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
          {theme.is_active ? (
            <div className="text-gray-600 italic">
              Faça login para escrever uma redação sobre este tema. Tema
              disponível até{" "}
              {new Date(theme.available_until).toLocaleDateString()}.
            </div>
          ) : (
            <div className="text-gray-600 italic">
              Este tema não está ativo para redações no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
