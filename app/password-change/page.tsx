"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";

export default function PasswordChangePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth({ requireAuth: true });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setSubmitting(true);

    const { ok, error } = await apiRequest(
      "/api/v1/users/password-change/",
      {
        method: "POST",
        body: {
          old_password: oldPassword,
          new_password: newPassword,
        },
      },
      router
    );

    if (ok) {
      // Redirect to home, which will fetch new redirect_url
      router.replace("/");
    } else {
      setError(error || "Erro ao alterar senha.");
    }

    setSubmitting(false);
  };

  if (authLoading) {
    return <p className="p-6 text-center">Carregando...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-2">Alterar Senha</h1>
        <p className="text-gray-600 mb-6">
          Por favor, configure uma nova senha para continuar.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha Atual
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nova Senha
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              required
              minLength={8}
            />
            <p className="text-sm text-gray-500 mt-1">
              Mínimo de 8 caracteres.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Alterando..." : "Alterar Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
