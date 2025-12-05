import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
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
      const { data, ok } = await apiRequest<UserProfile>(
        "/api/v1/users/my-user/",
        { method: "GET", auth: true },
        router,
      );

      if (!ok) {
        setIsAuthenticated(false);
        setUser(null);
        if (options?.requireAuth) {
          router.replace("/login");
        }
      } else {
        setUser(data || null);
      }
      setLoading(false);
    }

    fetchUser();
  }, [router, options?.requireAuth]);

  return { user, loading, isAuthenticated };
}
