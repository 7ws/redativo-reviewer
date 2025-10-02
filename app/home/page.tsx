"use client";

import { useEffect, useState } from "react";
import { Menu, User, ArrowLeft, Upload } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { fetchWithAuth } from "@/lib/api";

import { getAccessToken } from "@/lib/auth";
import Theme from "@/types/theme";
import Essay from "@/types/essay";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"temas" | "redacoes">("temas");

  const [activeThemes, setActiveThemes] = useState([{}]);
  const [essays, setEssays] = useState([{}]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchThemes() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/home/");
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

      setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/v1/essays/`, router);
        setEssays(await res.json());
      } catch (err) {
        console.error("Error fetching active essay:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchThemes();
    fetchEssays();
  }, []);

  const statusTexts: Record<string, string> = {
    in_progress: "in_progress",
    expired: "expired",
    submitted: "submitted",
    ready_for_review: "ready_for_review",
    under_review: "under_review",
    reviewed: "reviewed",
  };

  function getEssayByTheme(theme: Theme): Essay | undefined {
    return essays?.find((essay) => essay.theme === theme.id);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white">
        <Menu className="w-6 h-6 text-gray-600" />
        <Avatar className="w-10 h-10 bg-blue-300">
          <AvatarFallback className="bg-blue-300">
            <User className="w-5 h-5 text-white" />
          </AvatarFallback>
        </Avatar>
      </header>

      {/* Navigation Tabs */}
      <div className="flex px-4 py-2 bg-white border-b">
        <button
          onClick={() => setActiveTab("temas")}
          className={`px-4 py-2 font-bold ${activeTab === "temas" ? "text-black border-b-2 border-black" : "text-gray-500 font-medium"}`}
        >
          Temas
        </button>
        <button
          onClick={() => setActiveTab("redacoes")}
          className={`px-4 py-2 font-bold ${activeTab === "redacoes" ? "text-black border-b-2 border-black" : "text-gray-500 font-medium"}`}
        >
          Minhas Redações
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeTab === "temas" ? (
          <>
            {activeThemes.map((theme) => {
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
                          // fallback placeholder
                          <div className="w-full h-full bg-gradient-to-br from-teal-300 to-blue-300 flex items-center justify-center">
                            <div className="relative">
                              <div className="w-8 h-6 bg-orange-400 rounded-t-full mb-1"></div>
                              <div className="w-10 h-8 bg-orange-500 rounded-lg relative">
                                <div className="absolute top-1 left-1 w-6 h-3 bg-gray-700 rounded-sm"></div>
                              </div>
                              <div className="absolute -left-2 top-2 w-3 h-4 bg-green-500 rounded-full"></div>
                              <div className="absolute -left-1 top-1 w-2 h-3 bg-green-600 rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <h3 className="font-bold text-sm text-black leading-tight mb-2">
                          {theme.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {theme.short_description}
                        </p>

                        {/* Essay Button */}
                        {essay ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // prevent card click
                              router.push(`/essays/${essay.id}`);
                            }}
                            className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Ver Redação
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // prevent card click
                              router.push(`/essays/new?theme=${theme.id}`);
                            }}
                            className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Escrever Redação
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        ) : (
          <>
            {essays.map((essay) => (
              <Card
                className="overflow-hidden cursor-pointer"
                onClick={() => router.push(`/essays/${essay.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-32 h-24 bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center relative">
                      <Badge className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1">
                        {essay.get_status_display}
                      </Badge>
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center relative">
                        <div className="w-8 h-6 bg-orange-700 rounded-sm"></div>
                        <div className="absolute -right-1 top-1 w-3 h-3 bg-teal-500 rounded-full"></div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-3 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <h3 className="font-bold text-sm text-black leading-tight mb-2">
                        {essay.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {statusTexts[essay.status]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
