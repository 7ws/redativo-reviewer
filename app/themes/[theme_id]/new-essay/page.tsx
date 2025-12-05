"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Menu, ArrowLeft } from "lucide-react";
import { apiGetWithAuth, sendEssay } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";

function EssayUploadContent() {
  const { theme_id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth({ requireAuth: true });

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkEssayAlreadySubmitted() {
      if (!theme_id) {
        setError("Tema não especificado.");
        router.replace("/home");
        return;
      }

      if (authLoading) return;

      const res = await apiGetWithAuth(
        `/api/v1/writer/themes/${theme_id}/essays/`,
        router,
      );

      if (!res?.ok) {
        setError("Erro ao verificar redações existentes.");
        return;
      }

      const essays = await res.json();
      if (essays.length > 0) {
        setError("Você já enviou uma redação para este tema.");
        router.replace(`/home`);
      }
    }

    checkEssayAlreadySubmitted();
  }, [theme_id, router, authLoading]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Digite um título para a redação.");
      return;
    }
    if (!file || !theme_id) {
      setError("Selecione uma imagem antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("text_image", file);

    setLoading(true);
    setError(null);

    const res = await sendEssay(theme_id, router, formData);

    if (!res?.ok) {
      setError("Erro ao enviar a redação.");
      setLoading(false);
      return;
    }

    router.push(`/themes/${theme_id}`);
  }

  if (authLoading) {
    return <div className="min-h-screen p-8">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <Header showBackButton={true} showHomeButton={true} />

      {/* Tips Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-black mb-4">
          Dicas para mandar bem na foto da redação:
        </h2>
        <ol className="space-y-2 text-gray-600 text-sm">
          <li>1. Luz boa – prefira luz natural, sem sombras.</li>
          <li>
            2. Foco nítido – segure firme e toque na tela antes de clicar.
          </li>
          <li>3. Enquadre a folha inteira – sem cortes nem partes faltando.</li>
          <li>4. Evite formar sombras sobre o texto</li>
        </ol>
      </div>

      <h2 className="text-lg font-bold text-black">Enviar Redação</h2>

      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da redação"
        className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      {/* File input */}
      {/* Hidden input – CAMERA */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          setShowPicker(false);
          handleFileChange(e);
        }}
        className="hidden"
        id="camera-input"
      />

      {/* Hidden input – GALLERY */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          setShowPicker(false);
          handleFileChange(e);
        }}
        className="hidden"
        id="gallery-input"
      />
      <button
        onClick={() => setShowPicker(true)}
        className="block w-full text-center bg-blue-600 text-white py-2 rounded cursor-pointer hover:bg-blue-700"
      >
        Selecionar ou Tirar Foto
      </button>

      {/* Preview */}
      {preview && (
        <div className="mt-4">
          <h3 className="font-medium text-sm mb-2">Pré-visualização:</h3>
          <img
            src={preview}
            alt="Pré-visualização da redação"
            className="max-w-full rounded border"
          />
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !title.trim() || !file}
        className={`w-full text-white py-2 rounded transition-colors ${
          loading || !title.trim() || !file
            ? "bg-green-600/50 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Enviando..." : "Enviar Redação"}
      </button>

      {showPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 space-y-4 shadow-xl">
            <h3 className="text-lg font-semibold text-center">
              Selecionar imagem
            </h3>

            <button
              onClick={() => document.getElementById("camera-input")!.click()}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              📷 Tirar Foto
            </button>

            <button
              onClick={() => document.getElementById("gallery-input")!.click()}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 flex items-center justify-center gap-2"
            >
              🖼️ Escolher da Galeria
            </button>

            <button
              onClick={() => setShowPicker(false)}
              className="w-full text-red-500 font-semibold py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EssayUploadPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EssayUploadContent />
    </Suspense>
  );
}
