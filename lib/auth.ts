export function getAccessToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("access") : null;
}
