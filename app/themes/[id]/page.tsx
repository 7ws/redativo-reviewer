"use client";

import { useEffect, useState } from "react";
import { Menu, User, ArrowLeft, Upload } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useRouter } from "next/navigation";

import { apiGetWithAuth } from "@/lib/api";

export default function ThemePage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState({});
  const [essays, setEssays] = useState([{}]);
  const [isActive, setIsActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState("00:00:00");
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  useEffect(() => {
    async function fetchTheme() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/themes/${id}/`,
        );

        const data = await res.json();
        setTheme(data);
        setIsActive(data.is_active);
        setRemainingTime(data.remaining_time);
      } catch (err) {
        console.error("Error fetching active theme:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchEssays() {
      const access = localStorage.getItem("access");
      if (!access) return;

      setLoading(true);
      try {
        const res = await apiGetWithAuth(
          `/api/v1/themes/${id}/essays/`,
          router,
        );
        setEssays(await res.json());
      } catch (err) {
        console.error("Error fetching active essay:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTheme();
    fetchEssays();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Yellow Header with Back Button */}
      <header className="bg-gradient-to-br from-orange-400 to-yellow-400 px-4 py-6 relative">
        <div className="flex items-center justify-between mb-8">
          <button onClick={handleBackClick}>
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
          <Menu className="w-6 h-6 text-black" />
        </div>

        {/* Large Biofuel Illustration */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Blue cloud background */}
            <div className="absolute -top-4 -left-8 w-24 h-16 bg-blue-300 rounded-full opacity-80"></div>
            <div className="absolute -top-2 -right-4 w-16 h-12 bg-blue-400 rounded-full opacity-70"></div>

            {/* Gas pump */}
            <div className="relative z-10 w-16 h-20 bg-orange-600 rounded-lg border-4 border-black flex flex-col items-center justify-center">
              {/* Screen */}
              <div className="w-10 h-6 bg-gray-300 rounded-sm border-2 border-black mb-2"></div>
              {/* Leaf logo */}
              <div className="w-6 h-4 bg-green-500 rounded-full border-2 border-black relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-green-600"></div>
              </div>
            </div>

            {/* Gas nozzle */}
            <div className="absolute -right-6 top-4 w-8 h-12 bg-gray-700 rounded-full border-2 border-black">
              <div className="absolute top-2 left-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>

            {/* Hose */}
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

      {/* Content */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-black mb-4 leading-tight">
          {theme.title}
        </h1>

        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          {theme.description}
        </p>
        {(() => {
          // find the essay for this theme (if any)
          const essay = essays.find((e) => e.theme === theme.id);

          if (isActive) {
            if (!essay) {
              // theme active but no essay yet
              return (
                <Button onClick={() => router.push(`/essays/new?theme=${id}`)}>
                  Escrever redação
                </Button>
              );
            }
          }

          if (essay) {
            return (
              <Button onClick={() => router.push(`/essays/${essay.id}`)}>
                Ver redação
              </Button>
            );
          }

          return (
            <p className="text-red-500">
              Tema encerrado em {theme.available_until}.
            </p>
          );
        })()}
      </div>
    </div>
  );
}
