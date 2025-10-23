"use client";

import { useEffect, useState } from "react";
import { Menu, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { fetchWithAuth } from "@/lib/api";
import Theme from "@/types/theme";
import Essay from "@/types/essay";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"temas" | "redacoes">("temas");
  const [activeThemes, setActiveThemes] = useState<Theme[]>([]);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  // --- Persist active tab in session storage ---
  useEffect(() => {
    const savedTab = sessionStorage.getItem("activeTab");
    if (savedTab === "redacoes") setActiveTab("redacoes");
  }, []);

  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // --- Auth check ---
  useEffect(() => {
    const access = localStorage.getItem("access");
    setIsAuthenticated(!!access);
  }, []);

  // --- Fetch data ---
  useEffect(() => {
    async function fetchThemes() {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/home/`;
        const res = await fetch(url);
        const data = await res.json();
        setActiveThemes(data);
      } catch (err) {
        console.error("Error fetching active themes:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchEssays() {
      const access = localStorage.getItem("access");
      if (!access) return;

      try {
        const res = await fetchWithAuth(`/api/v1/essays/`, router);
        const data = await res.json();
        setEssays(data);
      } catch (err) {
        console.error("Error fetching essays:", err);
      }
    }

    fetchThemes();
    fetchEssays();
  }, [router]);

  const statusTexts: Record<string, string> = {
    in_progress: "Em andamento",
    expired: "Expirada",
    submitted: "Enviada",
    ready_for_review: "Pronta para revisão",
    under_review: "Em revisão",
    reviewed: "Revisada",
  };

  const getEssayByTheme = (theme: Theme) =>
    essays?.find((essay) => essay.theme === theme.id);

  if (loading) return <p className="p-6 text-center">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <Menu className="w-6 h-6 text-gray-600" />
        <Avatar className="w-10 h-10 bg-blue-300">
          <AvatarFallback>
            <User className="w-5 h-5 text-white" />
          </AvatarFallback>
        </Avatar>
      </header>

      {/* Tabs */}
      <div className="flex px-4 py-2 bg-white border-b">
        <button
          onClick={() => setActiveTab("temas")}
          className={`px-4 py-2 font-bold ${
            activeTab === "temas"
              ? "text-black border-b-2 border-black"
              : "text-gray-500 font-medium"
          }`}
        >
          Temas
        </button>

        {isAuthenticated && (
          <button
            onClick={() => setActiveTab("redacoes")}
            className={`px-4 py-2 font-bold ${
              activeTab === "redacoes"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 font-medium"
            }`}
          >
            Minhas Redações
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeTab === "temas" &&
          activeThemes.map((theme) => {
            const essay = getEssayByTheme(theme);
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
                        <div className="w-full h-full bg-gradient-to-br from-teal-300 to-blue-300" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <h3 className="font-bold text-sm mb-2">{theme.title}</h3>
                      <p className="text-xs text-gray-500">
                        {theme.short_description}
                      </p>
                      {isAuthenticated && (
                        <>
                          {essay ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/essays/${essay.id}`);
                              }}
                              className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded"
                            >
                              Ver Redação
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/essays/new?theme=${theme.id}`);
                              }}
                              className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded"
                            >
                              Escrever Redação
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

        {activeTab === "redacoes" &&
          essays.map((essay) => (
            <Card
              key={essay.id}
              className="overflow-hidden cursor-pointer"
              onClick={() => router.push(`/essays/${essay.id}`)}
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-32 h-24 bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center relative">
                    <Badge className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1">
                      {statusTexts[essay.status]}
                    </Badge>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-sm mb-2">{essay.title}</h3>
                    <p className="text-xs text-gray-500">
                      {statusTexts[essay.status]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
