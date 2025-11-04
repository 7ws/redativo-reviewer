"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { apiGetWithoutAuth } from "@/lib/api";
import Theme from "@/types/theme";

export default function UnauthHomePage({ showAll }: { showAll: boolean }) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // --- Fetch themes information ---
  useEffect(() => {
    async function fetchThemes() {
      try {
        const res = await apiGetWithoutAuth(`/api/v1/common/themes/`, router);
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
  const filteredThemes = showAll ? themes : themes.filter((t) => t.is_active);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex px-4 py-2 bg-white border-b">
        <button
          className={"px-4 py-2 font-bold text-black border-b-2 border-black"}
        >
          Temas
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {filteredThemes.map((theme: Theme) => {
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
                      {theme.short_description}
                    </p>

                    <div className="pt-4">
                      {theme.is_active ? (
                        <div className="text-gray-600 italic">
                          Faça login para escrever uma redação sobre este tema.
                          Tema disponível até{" "}
                          {new Date(theme.available_until).toLocaleDateString()}
                          .
                        </div>
                      ) : (
                        <div className="text-gray-600 italic">
                          Este tema não está mais ativo para de redações.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
