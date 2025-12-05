import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Type definitions
export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

export interface ApiOptions {
  method: HttpMethod;
  auth?: boolean;
  body?: FormData | Record<string, any> | null;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  ok: boolean;
}

// Extract error message from backend response
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return `Erro ${response.status}`;
    }

    const data = await response.json();

    // Django REST Framework standard error format
    if (data.detail) {
      return typeof data.detail === "string"
        ? data.detail
        : String(data.detail);
    }

    // Field errors
    if (data && typeof data === "object") {
      const firstError = Object.values(data)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return String(firstError[0]);
      }
      if (typeof firstError === "string") {
        return firstError;
      }
    }

    // Fallback
    return `Erro ${response.status}`;
  } catch {
    return `Erro ${response.status}`;
  }
}

// Refresh access token
async function refreshAccessToken(): Promise<string | null> {
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
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return null;
    }

    const data = await res.json();
    if (data.access) {
      localStorage.setItem("access", data.access);
    }
    if (data.refresh) {
      localStorage.setItem("refresh", data.refresh);
    }

    return data.access;
  } catch (err) {
    console.error("Error refreshing token:", err);
    return null;
  }
}

// Unified API request function
export async function apiRequest<T = any>(
  url: string,
  options: ApiOptions,
  router: AppRouterInstance,
): Promise<ApiResponse<T>> {
  const { method, auth = true, body, headers = {} } = options;

  // Prepare request headers
  const requestHeaders: HeadersInit = { ...headers };

  // Add auth header if required
  if (auth) {
    const access = localStorage.getItem("access");
    if (!access) {
      router.push("/login");
      return {
        error: "Autenticação necessária",
        status: 401,
        ok: false,
      };
    }
    requestHeaders["Authorization"] = `Bearer ${access}`;
  }

  // Prepare request body
  let requestBody: BodyInit | undefined;
  if (body) {
    if (body instanceof FormData) {
      requestBody = body;
      // Don't set Content-Type for FormData, browser will set it with boundary
    } else {
      requestBody = JSON.stringify(body);
      requestHeaders["Content-Type"] = "application/json";
    }
  }

  // Make request
  try {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      method,
      headers: requestHeaders,
      body: requestBody,
    });

    // Handle 401 - try token refresh
    if (response.status === 401 && auth) {
      const newAccess = await refreshAccessToken();

      if (!newAccess) {
        router.replace("/login");
        return {
          error: "Sessão expirada",
          status: 401,
          ok: false,
        };
      }

      // Retry request with new token
      requestHeaders["Authorization"] = `Bearer ${newAccess}`;
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        method,
        headers: requestHeaders,
        body: requestBody,
      });
    }

    // Handle successful response
    if (response.ok) {
      // Handle no-content responses (204)
      if (response.status === 204) {
        return {
          data: undefined,
          status: response.status,
          ok: true,
        };
      }

      // Parse JSON response
      try {
        const data = await response.json();
        return {
          data,
          status: response.status,
          ok: true,
        };
      } catch {
        // Response is not JSON
        return {
          data: undefined,
          status: response.status,
          ok: true,
        };
      }
    }

    // Handle error response
    const errorMessage = await extractErrorMessage(response);
    return {
      error: errorMessage,
      status: response.status,
      ok: false,
    };
  } catch (err) {
    console.error("Network error:", err);
    return {
      error: "Erro de conexão com o servidor",
      status: 0,
      ok: false,
    };
  }
}
