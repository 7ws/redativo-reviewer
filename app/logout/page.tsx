"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleLogout() {
      sessionStorage.clear();
      await apiRequest(
        `/api/v1/auth/logout`,
        { method: "POST", auth: true },
        router,
      );
      localStorage.clear();
      router.replace("/home");
    }
    handleLogout();
  }, [router]);
}
