"use client";

import { ArrowLeft, Home, LogOut, Menu, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import UserProfile from "@/types/user_profile";

export default function Header({
  user,
  showBackButton = false,
  showHomeButton = false,
  showProfileButton = false,
  showOptionsButton = false,
  showLogoutButton = false,
  optionsSlot, // 👈 custom slot for options
}: {
  user?: UserProfile;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showProfileButton?: boolean;
  showOptionsButton?: boolean;
  showLogoutButton?: boolean;
  optionsSlot?: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow relative">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        {showBackButton && (
          <button onClick={() => router.back()} className="focus:outline-none">
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
        )}

        {showHomeButton && (
          <button
            onClick={() => router.push("/home")}
            className="focus:outline-none"
          >
            <Home className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>

      {/* CENTER SECTION (can hold a title or remain empty) */}
      <div className="flex-1 flex justify-center">
        {/* could add a title here */}
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">
        {showProfileButton && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <Avatar className="w-10 h-10 bg-blue-300 cursor-pointer">
                  {user?.avatar_image ? (
                    <AvatarImage src={user.avatar_image} alt={user.full_name} />
                  ) : (
                    <AvatarFallback className="bg-blue-300">
                      <User className="w-5 h-5 text-white" />
                    </AvatarFallback>
                  )}
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
                  <DropdownMenuItem onClick={handleLogout}>
                    Sair
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => router.push("/login")}>
                    Entrar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/signup")}>
                    Cadastrar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {showLogoutButton && !showProfileButton && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        )}

        {showOptionsButton &&
          (optionsSlot || <Menu className="w-6 h-6 text-black" />)}
      </div>
    </header>
  );
}
