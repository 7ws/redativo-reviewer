"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Theme from "@/types/theme";
import Essay from "@/types/essay";
import { statusTexts } from "../essays/status_text";
import { apiGetWithAuth } from "@/lib/api";

export default function ForWriterHomePage({
  activeTab,
  showAll,
}: {
  activeTab: "temas" | "redacoes";
  showAll: boolean;
}) {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // --- Fetch themes information ---
  useEffect(() => {
    async function fetchThemes() {
      try {
        const res = await apiGetWithAuth(`/api/v1/writer/themes/`, router);
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

  useEffect(() => {
    async function fetchEssays() {
      try {
        const res = await apiGetWithAuth(`/api/v1/essays/all/`, router);
        const data = await res.json();
        setEssays(data);
      } catch (err) {
        console.error("Error fetching essays:", err);
      }
    }

    fetchEssays();
  }, [router]);

  const filteredThemes = showAll ? themes : themes.filter((t) => t.is_active);

  const getEssayByTheme = (theme: Theme) =>
    essays?.find((essay: Essay) => essay.theme.id === theme.id);

  return (
    <div className="p-4 space-y-4">
      {activeTab === "temas" &&
        filteredThemes.map((theme: Theme) => {
          const essay: Essay = getEssayByTheme(theme);
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
                    {/* Available until */}
                    {theme.available_until && (
                      <p className="text-xs text-gray-600 mb-2">
                        Disponível até{" "}
                        {new Date(theme.available_until).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                    )}

                    {essay ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/themes/${theme.id}/essays/${essay.id}`);
                        }}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        Ver Redação
                      </button>
                    ) : theme.is_active ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/themes/${theme.id}/new-essay`);
                        }}
                        className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded"
                      >
                        Escrever Redação
                      </button>
                    ) : (
                      <span className="mt-2 inline-block px-3 py-1 bg-gray-400 text-white text-xs rounded">
                        Tema Inativo
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

      {activeTab === "redacoes" &&
        essays.map((essay: Essay) => {
          const theme = essay.theme;
          const themeImage =
            theme?.background_image || "/placeholder-theme.jpg";
          const themeTitle = theme?.title || "Tema desconhecido";

          // Optional: color-code statuses for better UX
          const statusColors: Record<string, string> = {
            SUBMITTED: "bg-blue-500",
            READY_FOR_REVIEW: "bg-indigo-500",
            UNDER_REVIEW: "bg-purple-500",
            REVIEWED: "bg-green-600",
          };

          const statusColor = statusColors[essay.status] || "bg-gray-400";

          return (
            <Card
              key={essay.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() =>
                router.push(`/themes/${theme.id}/essays/${essay.id}`)
              }
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Left image section */}
                  <div className="w-32 h-24 relative">
                    <img
                      src={themeImage}
                      alt={themeTitle}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-2 left-2 ${statusColor} text-white text-xs px-2 py-1 rounded`}
                    >
                      {statusTexts[essay.status]}
                    </span>
                  </div>

                  {/* Right content section */}
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-sm mb-1">{essay.title}</h3>
                    <p className="text-xs text-gray-600 italic mb-1">
                      {themeTitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      Status: {statusTexts[essay.status]}
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
