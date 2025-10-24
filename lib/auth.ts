export function getAccessToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("access") : null;
}

export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/token/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      },
    );

    if (!res.ok) {
      // refresh expired → force logout
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return null;
    }

    const data = await res.json();
    if (data.access) {
      localStorage.setItem("access", data.access);
    }
    if (data.refresh) {
      // optional — if your backend rotates refresh tokens
      localStorage.setItem("refresh", data.refresh);
    }

    return data.access;
  } catch (err) {
    console.error("Error refreshing token:", err);
    return null;
  }
}
