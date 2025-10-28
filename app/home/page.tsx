"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";

import { apiGetWithAuth, apiGetWithoutAuth } from "@/lib/api";
import Theme from "@/types/theme";
import UserProfile from "@/types/user_profile";
import Header from "@/components/header";
import UnauthHomePage from "@/components/home/unauthed";
import ForWriterHomePage from "@/components/home/forWriter";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"temas" | "redacoes">("temas");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [user, setUser] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const router = useRouter();

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
      try {
        const res = await apiGetWithoutAuth(`/api/v1/themes/`, router);
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

    async function fetchUser() {
      try {
        const res = await apiGetWithAuth(`/api/v1/users/my-user/`, router);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }

    fetchUser();
  }, [router, isAuthenticated]);

  const getHeader = () => (
    <Header
      showProfileButton={true}
      showOptionsButton={true}
      optionsSlot={
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
      }
      user={user}
    />
  );

  if (loading) return <p className="p-6 text-center">Carregando...</p>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {getHeader()}
        <UnauthHomePage themes={themes} showAll={showAllThemes} />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {getHeader()}
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
        </div>

        {user.is_writer && (
          <ForWriterHomePage
            themes={themes}
            activeTab={activeTab}
            showAll={showAllThemes}
          />
        )}
      </div>
    );
  }
}
