"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Menu, ArrowLeft } from "lucide-react";
import { apiGetWithAuth, sendEssay } from "@/lib/api";

function EssayUploadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const themeId = searchParams.get("theme");

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBackClick = () => router.back();

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
      alert("Digite um título para a redação.");
      return;
    }
    if (!file || !themeId) {
      alert("Selecione uma imagem antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("text_image", file);

    setLoading(true);
    const res = await sendEssay(themeId, router, formData);

    if (res.ok) {
      alert("Redação enviada com sucesso!");
      router.push(`/themes/${themeId}`);
    } else {
      alert("Erro ao enviar a redação.");
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <button onClick={handleBackClick}>
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <Menu className="w-6 h-6 text-black" />
      </header>

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
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="essay-upload"
      />
      <label
        htmlFor="essay-upload"
        className="block w-full text-center bg-blue-600 text-white py-2 rounded cursor-pointer hover:bg-blue-700"
      >
        Selecionar ou Tirar Foto
      </label>

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
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar Redação"}
      </button>
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
