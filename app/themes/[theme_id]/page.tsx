"use client";

import { useParams } from "next/navigation";
import Header from "@/components/header";
import ThemeForReviewerPage from "@/components/themes/for_reviewer";
import UnauthThemePage from "@/components/themes/unauthed";
import { useAuth } from "@/hooks/use-auth";
import ThemeForWriterPage from "@/components/themes/for_writer";

export default function ThemePage() {
  const { theme_id } = useParams();
  const { user, loading } = useAuth();

  const getHeader = () => (
    <Header
      showBackButton={true}
      showHomeButton={true}
      showProfileButton={true}
      user={user}
    />
  );

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
