"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  User,
  ArrowLeft,
  Upload,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

export default function EssayPage() {
  const { id } = useParams<{ id: string }>();
  const [essay, setEssay] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  useEffect(() => {
    async function fetchEssays() {
      const access = localStorage.getItem("access");
      if (!access) return;

      setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/v1/essays/${id}/`, router);
        setEssay(await res.json());
      } catch (err) {
        console.error("Error fetching active essay:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEssays();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <button onClick={handleBackClick}>
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <Menu className="w-6 h-6 text-black" />
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Essay Image Section with Teacher Annotations */}
        <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
          <img
            src={essay.text}
            alt="Redação corrigida com marcações do professor"
            className="w-full h-auto"
          />
          {/* Interactive annotation markers can be added here in the future */}
        </div>
      </div>
    </div>
  );
}
