import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Menu, Home, ArrowLeft, User, LogOut } from "lucide-react";
import UserProfile from "@/types/user_profile";

interface HeaderProps {
  user?: UserProfile;
  onLogout?: () => void;
  showLogoutButton?: boolean;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showProfileButton?: boolean;
  showOptionsButton?: boolean;
}

export default function Header({
  onLogout,
  user = undefined,
  showLogoutButton = false,
  showProfileButton = true,
  showOptionsButton = true,
  showHomeButton = false,
  showBackButton = false,
}: HeaderProps) {
  const router = useRouter();

  // Default fallback behavior
  const handleGoHome = () => {
    router.push("/home");
  };

  const handleLogout = () => {
    if (onLogout) return onLogout();
    localStorage.clear();
    router.replace("/home");
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      {showBackButton && (
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
      )}
      {showHomeButton && (
        <button onClick={handleGoHome} className="focus:outline-none">
          <Home className="w-6 h-6 text-gray-600" />
        </button>
      )}

      {showProfileButton && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <Avatar className="w-10 h-10 bg-blue-300 cursor-pointer">
                {user?.avatar_image && (
                  <AvatarImage
                    src={user.avatar_image || "/placeholder.svg"}
                    alt={user.full_name}
                  />
                )}
                <AvatarFallback className="bg-blue-300">
                  <User className="w-5 h-5 text-white" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {user ? (
              <>
                <DropdownMenuItem
                  onClick={() => router.push(`/profile/${user.id}`)}
                >
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => router.push("/login")}>
                  Entrar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/register")}>
                  Cadastrar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {showOptionsButton && (
        <Menu className="w-6 h-6 text-black cursor-pointer" />
      )}

      {showLogoutButton && !showOptionsButton && !showProfileButton && (
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      )}
    </header>
  );
}
