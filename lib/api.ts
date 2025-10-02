async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  const res = await fetch("http://localhost:8000/api/v1/token/refresh/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    // refresh expired → force logout
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return null;
  }

  const data = await res.json();
  localStorage.setItem("access", data.access);
  return data.access;
}

export async function fetchWithAuth(
  url: string,
  router: any,
  options: RequestInit = {},
) {
  let access = localStorage.getItem("access");

  const res = await fetch(`http://localhost:8000${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${access}`,
      // "Content-Type": "application/json",
    },
  });

  if (res.status === 401) {
    // try refresh
    access = await refreshAccessToken();
    if (!access) {
      router.push("/login");
      return;
    }

    // retry request with new token
    return fetch(`http://localhost:8000${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
    });
  }

  return res;
}
