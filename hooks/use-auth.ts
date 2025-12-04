import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGetWithAuth } from "@/lib/api";
import UserProfile from "@/types/user_profile";

interface UseAuthOptions {
  requireAuth?: boolean;
}

interface UseAuthReturn {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(options?: UseAuthOptions): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const access = localStorage.getItem("access");
    const authenticated = !!access;
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      setLoading(false);
      if (options?.requireAuth) {
        router.replace("/login");
      }
      return;
    }

    async function fetchUser() {
      try {
        const res = await apiGetWithAuth("/api/v1/users/my-user/", router);
        if (!res?.ok) {
          setIsAuthenticated(false);
          setUser(null);
          if (options?.requireAuth) {
            router.replace("/login");
          }
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router, options?.requireAuth]);

  return { user, loading, isAuthenticated };
}
