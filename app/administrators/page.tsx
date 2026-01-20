"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";

export default function AdministratorHomePage() {
  const { user, loading } = useAuth({ requireAuth: true });

  if (loading) return <p className="p-6 text-center">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showProfileButton={true} user={user} />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">{user?.full_name}</h1>

        <div className="grid gap-4">
          {user?.institution && (
            <Link
              href="/administrators/institution"
              className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                Gerenciar Instituição
              </h2>
              <p className="text-gray-600 mt-1">
                Gerencie as informações da instituição, administradores,
                corretores e convites.
              </p>
              <p className="text-sm text-blue-600 mt-2">
                {user.institution.name}
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
