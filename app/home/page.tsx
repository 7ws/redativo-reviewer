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

import { apiGetWithAuth } from "@/lib/api";
import UserProfile from "@/types/user_profile";
import Header from "@/components/header";
import WhatsAppButton from "@/components/whatsapp_button";
import UnauthHomePage from "@/components/home/unauthed";
import ForWriterHomePage from "@/components/home/for_writer";
import ForReviewerHomePage from "@/components/home/for_reviewer";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"temas" | "redacoes" | "revisoes">(
    "temas",
  );
  const [user, setUser] = useState<UserProfile>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [loading, setLoading] = useState(true);
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

    // --- Auth check ---
    const _access = localStorage.getItem("access");
    setIsAuthenticated(!!_access);
    if (!_access) setLoading(false);
  }, [router]);

  useEffect(() => {
    // --- Persist active tab in session storage ---
    const savedTab = sessionStorage.getItem("activeTab");
    if (savedTab === "redacoes") setActiveTab("redacoes");

    // --- Load showAllThemes from session storage ---
    const stored = sessionStorage.getItem("showAllThemes");
    if (stored !== null) {
      setShowAllThemes(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user) return;

    async function fetchUser() {
      setLoading(true);
      try {
        const res = await apiGetWithAuth(`/api/v1/users/my-user/`, router);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [isAuthenticated, user, router]);

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

  if (user?.is_writer) {
    return (
      <>
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
          <ForWriterHomePage activeTab={activeTab} showAll={showAllThemes} />
        </div>
        <WhatsAppButton />
      </>
    );
  }

  if (user?.is_reviewer) {
    return (
      <>
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
              onClick={() => setActiveTab("revisoes")}
              className={`px-4 py-2 font-bold ${
                activeTab === "revisoes"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 font-medium"
              }`}
            >
              Minhas Revisões
            </button>
          </div>
          <ForReviewerHomePage activeTab={activeTab} showAll={showAllThemes} />
        </div>
        <WhatsAppButton />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {getHeader()}
        <UnauthHomePage showAll={showAllThemes} />
      </div>
      <WhatsAppButton />
    </>
  );
}
