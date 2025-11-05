"use client";

import { useEffect, useRef, useState } from "react";
import { Edit2, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserProfile from "@/types/user_profile";
import { useParams, useRouter } from "next/navigation";
import { apiGetWithAuth, apiPatchWithAuth } from "@/lib/api";
import Header from "@/components/header";

export default function Profile() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile>();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🧠 Fetch user data
  useEffect(() => {
    const access = localStorage.getItem("access");

    if (!access) {
      router.push("/login");
      return;
    }
    setLoading(true);

    async function fetchUser() {
      try {
        const res = await apiGetWithAuth(`/api/v1/users/${id}/`, router);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [id]);

  function formatPhoneNumber(phone: string | null | undefined) {
    if (!phone) return "Não informado";

    const cleaned = phone.replace(/\D/g, "");

    // Mobile: 11 digits → (XX) 9XXXX-XXXX
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }

    // Landline fallback: 10 digits → (XX) XXXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }

    return phone; // fallback if something unexpected
  }

  // 📸 Handle avatar file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
    }
  };

  // 💾 Upload avatar
  const handleAvatarUpload = async () => {
    if (!fileInputRef.current?.files?.[0] || !user) return;

    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("avatar_image", file);

    setLoading(true);
    try {
      const res = await apiPatchWithAuth(
        `/api/v1/users/${id}/`,
        router,
        formData,
      );
      if (res && res.ok) {
        const updated = await res.json();
        setUser(updated);
        setPreview(null);
      } else {
        console.error("Falha ao enviar imagem de perfil");
      }
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Start editing name
  const handleNameEdit = () => {
    setEditedName(user.full_name);
    setIsEditingName(true);
  };

  // 💾 Save name
  const handleNameSave = async () => {
    if (!editedName.trim()) return;

    const formData = new FormData();
    formData.append("full_name", editedName);

    try {
      const res = await apiPatchWithAuth(
        `/api/v1/users/${id}/`,
        router,
        formData,
      );
      if (res && res.ok) {
        const updated = await res.json();
        setUser(updated);
        setIsEditingName(false);
      } else {
        console.error("Falha ao atualizar nome");
      }
    } catch (err) {
      console.error("Erro ao atualizar nome:", err);
    }
  };

  // ❌ Cancel name edit
  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        showProfileButton={false}
        showOptionsButton={false}
        showLogoutButton={true}
        showHomeButton={true}
        user={user}
      />

      {/* Profile Content */}
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-black">Perfil</h1>

        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-32 h-32 bg-blue-300">
              {preview ? (
                <AvatarImage src={preview} alt="Pré-visualização" />
              ) : user.avatar_image ? (
                <AvatarImage src={user.avatar_image} alt={user.full_name} />
              ) : (
                <AvatarFallback className="bg-blue-300 text-white text-4xl">
                  {user.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </label>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="avatar-upload"
              ref={fileInputRef}
            />
          </div>

          {/* Show upload button if there's a preview */}
          {preview && (
            <Button
              onClick={handleAvatarUpload}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Enviando..." : "Salvar Foto"}
            </Button>
          )}

          {/* Name Section */}
          <div className="w-full max-w-md space-y-2">
            {isEditingName ? (
              <div className="space-y-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="text-center text-lg font-medium"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleNameSave}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    Salvar
                  </Button>
                  <Button
                    onClick={handleNameCancel}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <p className="text-xl font-bold text-black">{user.full_name}</p>
                <button
                  onClick={handleNameEdit}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base font-medium text-black">
                {user.email ? user.email : "Email não informado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telefone</p>
              <p className="text-base font-medium text-black">
                {formatPhoneNumber(user.phone_number)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Membro desde</p>
              <p className="text-base font-medium text-black">
                {new Date(user.created_at).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Redações enviadas</p>
              <p className="text-base font-medium text-black">
                {user.essay_count ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
