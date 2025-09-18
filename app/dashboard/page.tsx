"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.push("/login"); // redirect if not logged in
      return;
    }

    async function fetchProtected() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/protected/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("access");
          router.push("/login");
          return;
        }

        const data = await res.json();
        setMessage(data.message);
      } catch (err) {
        setMessage("Error loading data.");
      } finally {
        setLoading(false);
      }
    }

    fetchProtected();
  }, [router]);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-2xl shadow-md w-96 text-center space-y-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
