"use client";

import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";

export default function AdministratorHomePage() {
  const { user, loading } = useAuth({ requireAuth: true });

  if (loading) return <p className="p-6 text-center">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showProfileButton={true} user={user} />
      <div className="p-6">
        <h1 className="text-2xl font-bold">{user?.full_name}</h1>
      </div>
    </div>
  );
}
