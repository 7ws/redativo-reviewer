"use client";

import { useParams } from "next/navigation";
import Header from "@/components/header";
import ThemeForReviewerPage from "@/components/themes/for_reviewer";
import UnauthThemePage from "@/components/themes/unauthed";
import { useAuth } from "@/hooks/use-auth";

export default function ThemePage() {
  const { theme_id } = useParams();
  const { user, loading } = useAuth({ requireAuth: true });

  const getHeader = () => (
    <Header
      showBackButton={true}
      showHomeButton={true}
      showProfileButton={true}
      user={user}
    />
  );

  if (loading) return <p className="p-6 text-center">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {getHeader()}
      <ThemeForReviewerPage theme_id={theme_id.toString()} />;
    </div>
  );
}
