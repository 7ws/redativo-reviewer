async function refreshAccessToken() {
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

export async function fetchWithAuth(
  url: string,
  router: any,
  options: RequestInit = {},
) {
  let access = localStorage.getItem("access");

  if (!access) {
    // No token at all
    router.push("/login");
    return null;
  }

  let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      // "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    // Try refresh
    access = await refreshAccessToken();

    if (!access) {
      router.push("/login");
      return null;
    }

    // Retry request with new token
    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers: {
        // "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
        ...(options.headers || {}),
      },
    });
  }

  return res;
}
