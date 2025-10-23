"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SocialCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      router.push("/home");
    } else {
      // fallback if no tokens → maybe hit token_from_session instead
      router.push("/login");
    }
  }, [router]);

  return <p>Finalizing login...</p>;
}
