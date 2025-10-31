"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/header";
import ThemeForReviewerPage from "@/components/themes/for_reviewer";
import UnauthThemePage from "@/components/themes/unauthed";
import UserProfile from "@/types/user_profile";
import { apiGetWithAuth } from "@/lib/api";
import ThemeForWriterPage from "@/components/themes/for_writer";

export default function ThemePage() {
  const router = useRouter();
  const { theme_id } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile>();

  useEffect(() => {
    // --- Auth check ---
    const access = localStorage.getItem("access");
    if (!access) return;
    setIsAuthenticated(true);
  }, [theme_id, router]);

  const getHeader = () => (
    <Header
      showBackButton={true}
      showHomeButton={true}
      showProfileButton={true}
    />
  );

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

  if (loading) return <p className="p-6 text-center">Carregando...</p>;

  if (user?.is_reviewer) {
    return (
      <div className="min-h-screen bg-gray-50">
        {getHeader()}
        <ThemeForReviewerPage theme_id={theme_id.toString()} />;
      </div>
    );
  }

  if (user?.is_writer) {
    return (
      <div className="min-h-screen bg-gray-50">
        {getHeader()}
        <ThemeForWriterPage theme_id={theme_id.toString()} />;
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {getHeader()}
      <UnauthThemePage theme_id={theme_id.toString()} />;
    </div>
  );
}
