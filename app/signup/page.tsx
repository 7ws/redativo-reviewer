"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import InputMask from "react-input-mask";
import { useRouter } from "next/navigation";
import WhatsAppButton from "@/components/whatsapp_button";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
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

  function isValidBrazilPhone(phone: string) {
    const cleaned = phone.replace(/\D/g, "");
    return /^[1-9]{2}9?[0-9]{8}$/.test(cleaned);
  }

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
    const password = (form[3] as HTMLInputElement).value;

    if (!isValidBrazilPhone(phone)) {
      setIsLoading(false);
      alert("Número de telefone inválido. Use o formato (XX) XXXXX-XXXX");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/registration/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: full_name,
          username: username,
          phone_number: phone.replace(/\D/g, ""),
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
              Cadastre-se para participar
            </h1>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-3 h-11"
            >
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

              {/* ✅ This is now fully working */}
              <InputMask
                mask="(99) 99999-9999"
                maskChar={null}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              >
                {(inputProps: any) => (
                  <input
                    {...inputProps}
                    type="tel"
                    placeholder="Número de telefone (XX) 9XXXX-XXXX"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </InputMask>

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
                Cadastrar-se
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
        <WhatsAppButton />
      </div>
    </div>
  );
}
