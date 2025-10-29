"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPostWithAuth } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleLogout() {
      sessionStorage.clear();
      apiPostWithAuth(`/api/v1/auth/logout`, router);
      localStorage.clear();
      router.replace("/home");
    }
    handleLogout();
  }, [router]);
}
