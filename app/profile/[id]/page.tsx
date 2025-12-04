"use client";

import { useEffect, useRef, useState } from "react";
import { Edit2, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserProfile from "@/types/user_profile";
import { useParams, useRouter } from "next/navigation";
import { apiPatchWithAuth } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";

export default function Profile() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const { user: authUser, loading } = useAuth({ requireAuth: true });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [updatingName, setUpdatingName] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

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

    return phone;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
    }
  };

  const handleAvatarUpload = async () => {
    if (!fileInputRef.current?.files?.[0] || !user) return;

    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("avatar_image", file);

    setUpdatingAvatar(true);
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
        toast({
          title: "Foto atualizada",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        });
      } else {
        throw new Error("Falha ao enviar imagem");
      }
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
      toast({
        title: "Erro ao atualizar foto",
        description: "Não foi possível atualizar sua foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleNameEdit = () => {
    if (!user) return;
    setEditedName(user.full_name);
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (!editedName.trim()) return;

    const formData = new FormData();
    formData.append("full_name", editedName);

    setUpdatingName(true);
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
        toast({
          title: "Nome atualizado",
          description: "Seu nome foi atualizado com sucesso.",
        });
      } else {
        throw new Error("Falha ao atualizar nome");
      }
    } catch (err) {
      console.error("Erro ao atualizar nome:", err);
      toast({
        title: "Erro ao atualizar nome",
        description: "Não foi possível atualizar seu nome. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUpdatingName(false);
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-8 text-gray-600">
          Carregando perfil...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-8 text-red-600">Perfil não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showProfileButton={false}
        showOptionsButton={false}
        showLogoutButton={true}
        showHomeButton={true}
        user={user}
      />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-black">Perfil</h1>

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

          {preview && (
            <Button
              onClick={handleAvatarUpload}
              disabled={updatingAvatar}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {updatingAvatar ? "Enviando..." : "Salvar Foto"}
            </Button>
          )}

          <div className="w-full max-w-md space-y-2">
            {isEditingName ? (
              <div className="space-y-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="text-center text-lg font-medium"
                  disabled={updatingName}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleNameSave}
                    disabled={updatingName}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    {updatingName ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    onClick={handleNameCancel}
                    disabled={updatingName}
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
