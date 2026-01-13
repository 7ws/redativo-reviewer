"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import WhatsAppButton from "@/components/whatsapp_button";
import UnauthHomePage from "@/components/home/unauthed";
import ForReviewerHomePage from "@/components/home/for_reviewer";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"temas" | "revisoes">("temas");
  const [showAllThemes, setShowAllThemes] = useState(false);
  const { user, loading } = useAuth();

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
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    // --- Load showAllThemes from session storage ---
    const stored = sessionStorage.getItem("showAllThemes");
    if (stored !== null) {
      setShowAllThemes(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

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
