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

async function makeAuthRequest(
  url: string,
  method: string,
  router: any,
  options: RequestInit = {},
) {
  let access = localStorage.getItem("access");

  if (!access) {
    router.push("/login");
    return null;
  }

  let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method,
    ...options,
    headers: {
      Authorization: `Bearer ${access}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    // Try refresh
    access = await refreshAccessToken();

    if (!access) {
      router.replace("/login");
      return null;
    }

    // Retry request with new token
    let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      method,
      headers: {
        Authorization: `Bearer ${access}`,
        ...(options.headers || {}),
      },
    });
  }

  return res;
}

export async function apiGetWithAuth(url: string, router: any) {
  let res = await makeAuthRequest(url, "GET", router, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res;
}

export async function apiGetWithoutAuth(url: string, router: any) {
  let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res;
}

export async function apiPostWithAuth(
  url: string,
  router: any,
  body?: FormData,
) {
  let res = await makeAuthRequest(url, "POST", router, {
    body: body,
    headers: {},
  });

  return res;
}

export async function apiPatchWithAuth(
  url: string,
  router: any,
  body?: FormData,
) {
  let res = await makeAuthRequest(url, "PATCH", router, {
    body: body,
    headers: {},
  });

  return res;
}

export async function sendEssay(themeId: string, router: any, body: FormData) {
  let res = await apiPostWithAuth(
    `/api/v1/writer/themes/${themeId}/essays/`,
    router,
    body,
  );
  return res;
}
