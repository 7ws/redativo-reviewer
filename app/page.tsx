"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndRedirect() {
      const access = localStorage.getItem("access");

      if (!access) {
        router.replace("/login");
        return;
      }

      const { data, ok } = await apiRequest<{ redirect_url: string }>(
        "/api/v1/users/my-user/",
        { method: "GET", auth: true },
        router,
      );

      if (ok && data?.redirect_url) {
        router.replace(data.redirect_url);
      } else {
        router.replace("/login");
      }
    }

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Carregando...</p>
    </div>
  );
}
