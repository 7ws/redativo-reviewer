"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { useEffect, useState } from "react";
import { Menu, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { apiGetWithAuth, apiGetWithoutAuth } from "@/lib/api";
import Theme from "@/types/theme";
import Essay from "@/types/essay";
import UserProfile from "@/types/user_profile";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"temas" | "redacoes">("temas");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [user, setUser] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleProfile = () => {
    router.push(`/profile/${user.id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthenticated(false);
    setUser(null);

    router.replace("/home");
  };

  const handlShowAllThemes = () => {
    localStorage.setItem("showAllThemes", JSON.stringify(!showAllThemes));
    setShowAllThemes(!showAllThemes);
  };

  // --- Check if there are tokens on the URL (after social login) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      router.push("/home");
    }
  }, [router]);

  useEffect(() => {
    // --- Persist active tab in session storage ---
    const savedTab = sessionStorage.getItem("activeTab");
    if (savedTab === "redacoes") setActiveTab("redacoes");

    // --- Auth check ---
    const access = localStorage.getItem("access");
    setIsAuthenticated(!!access);

    // --- Load showAllThemes from session storage ---
    const stored = sessionStorage.getItem("showAllThemes");
    if (stored !== null) {
      setShowAllThemes(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // --- Fetch themes information ---
  useEffect(() => {
    async function fetchThemes() {
      const url = showAllThemes
        ? `/api/v1/themes/`
        : `/api/v1/themes/?active=true`;

      try {
        const res = await apiGetWithoutAuth(url, router);
        const data = await res.json();
        setThemes(data);
      } catch (err) {
        console.error("Error fetching active themes:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchThemes();
  }, [router, showAllThemes]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchEssays() {
      try {
        const res = await apiGetWithAuth(`/api/v1/essays/`, router);
        const data = await res.json();
        setEssays(data);
      } catch (err) {
        console.error("Error fetching essays:", err);
      }
    }

    async function fetchUser() {
      try {
        const res = await apiGetWithAuth(`/api/v1/users/my-user/`, router);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }

    fetchEssays();
    fetchUser();
  }, [router, isAuthenticated]);

  const statusTexts: Record<string, string> = {
    SUBMITTED: "Enviada",
    READY_FOR_REVIEW: "Pronta para revisão",
    UNDER_REVIEW: "Em revisão",
    REVIEWED: "Revisada",
  };

  const getEssayByTheme = (theme: Theme) =>
    essays?.find((essay: Essay) => essay.theme.id === theme.id);

  if (loading) return <p className="p-6 text-center">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <Avatar className="w-10 h-10 bg-blue-300 cursor-pointer">
                {user?.avatar_image && (
                  <AvatarImage
                    src={user.avatar_image || "/placeholder.svg"}
                    alt={user.full_name}
                  />
                )}
                <AvatarFallback className="bg-blue-300">
                  <User className="w-5 h-5 text-white" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {user ? (
              <>
                <DropdownMenuItem onClick={handleProfile}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={handleLogin}>
                  Entrar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignUp}>
                  Cadastrar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded hover:bg-gray-100">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handlShowAllThemes}>
              {showAllThemes ? "Mostrar ativos" : "Mostrar todos"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
          themes.map((theme: Theme) => {
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

                      {/* Authenticated actions */}
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
                          ) : theme.is_active ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/essays/new?theme=${theme.id}`);
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
                        </>
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
                onClick={() => router.push(`/essays/${essay.id}`)}
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
    </div>
  );
}
