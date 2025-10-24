"use client";

import { useEffect, useState } from "react";
import { Menu, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { apiGetWithAuth, apiGetWithoutAuth } from "@/lib/api";
import Theme from "@/types/theme";
import Essay from "@/types/essay";

export default function ThemePage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const access = localStorage.getItem("access");
    setIsAuthenticated(!!access);
  }, []);

  // Fetch theme + essays
  useEffect(() => {
    if (!id) return;

    async function fetchThemeAndEssays() {
      setLoading(true);
      try {
        const themeRes = await apiGetWithoutAuth(
          `/api/v1/themes/${id}/`,
          router,
        );
        const themeData = await themeRes.json();
        setTheme(themeData);

        if (localStorage.getItem("access")) {
          const essaysRes = await apiGetWithAuth(
            `/api/v1/themes/${id}/essays/`,
            router,
          );
          const essaysData = await essaysRes.json();
          setEssays(essaysData);
        }
      } catch (err) {
        console.error("Error fetching theme or essays:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchThemeAndEssays();
  }, [id, router]);

  const handleBackClick = () => router.back();

  // Show loading or missing data states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando tema...</p>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Não foi possível carregar o tema.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Yellow Header with Back Button */}
      <header className="bg-linear-to-br from-orange-400 to-yellow-400 px-4 py-6 relative">
        <div className="flex items-center justify-between mb-8">
          <button onClick={handleBackClick}>
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
          <Menu className="w-6 h-6 text-black" />
        </div>

        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Cloud background */}
            <div className="absolute -top-4 -left-8 w-24 h-16 bg-blue-300 rounded-full opacity-80"></div>
            <div className="absolute -top-2 -right-4 w-16 h-12 bg-blue-400 rounded-full opacity-70"></div>

            {/* Gas pump */}
            <div className="relative z-10 w-16 h-20 bg-orange-600 rounded-lg border-4 border-black flex flex-col items-center justify-center">
              <div className="w-10 h-6 bg-gray-300 rounded-sm border-2 border-black mb-2"></div>
              <div className="w-6 h-4 bg-green-500 rounded-full border-2 border-black relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-green-600"></div>
              </div>
            </div>

            {/* Nozzle + hose */}
            <div className="absolute -right-6 top-4 w-8 h-12 bg-gray-700 rounded-full border-2 border-black">
              <div className="absolute top-2 left-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            <div className="absolute -right-4 top-8 w-12 h-3 bg-black rounded-full"></div>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
        </div>
      </header>

      <div className="p-4 space-y-4">
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
            <p className="text-xs text-gray-500">{theme.description}</p>

            {isAuthenticated && (
              <>
                {essays.length > 0 ? (
                  <button
                    onClick={() => router.push(`/essays/${essays[0].id}`)}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded"
                  >
                    Ver Redação
                  </button>
                ) : theme.is_active ? (
                  <button
                    onClick={() => router.push(`/essays/new?theme=${theme.id}`)}
                    className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded"
                  >
                    Escrever Redação
                  </button>
                ) : (
                  <span className="mt-2 inline-block px-3 py-1 bg-gray-400 text-white text-xs rounded">
                    Tema Inativo
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
