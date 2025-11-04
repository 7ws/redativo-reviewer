"use client";

import { useState, useEffect, React } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthenticated() {
      const access = localStorage.getItem("access");
      if (access) {
        router.replace("/home");
      }
    }
    checkAuthenticated();
  }, [router]);

  const handleGoogleSignup = async () => {
    setIsLoading(true);

    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/accounts/google/login/?process=login`;

    setTimeout(() => {
      setIsLoading(false);
      alert("Unable to login with Google.");
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.target as HTMLFormElement;
    const full_name = (form[0] as HTMLInputElement).value;
    const username = (form[1] as HTMLInputElement).value;
    const password = (form[2] as HTMLInputElement).value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/registration/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: full_name,
          username: username,
          password1: password,
          password2: password,
        }),
      },
    );

    setIsLoading(false);

    if (res.ok) {
      const data = await res.json();

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      router.push("/home");
    } else {
      const data = await res.json();
      alert("Error: " + JSON.stringify(data));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Criar Conta
            </h1>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-3 h-11"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? "Criando conta..." : "Continuar com Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nome Completo"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Nome de usuário. Ex: redativo123"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Senha"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="submit"
                className="w-full bg-[#3B82F6] hover:bg-blue-600"
              >
                Criar Conta
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já escreveu conosco?{" "}
              <Link
                href="/login"
                className="text-[#3B82F6] hover:underline font-medium"
              >
                Faça o login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
