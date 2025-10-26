import { useRouter } from "next/navigation";
import Essay from "@/types/essay";
import Header from "../header";

export default function EssayNotReviewed({ essay }: { essay: Essay }) {
  const router = useRouter();
  const statusTexts: Record<string, string> = {
    SUBMITTED: "Enviada",
    READY_FOR_REVIEW: "Pronta para revisão",
    UNDER_REVIEW: "Em revisão",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showLogoutButton={true}
        showProfileButton={false}
        showHomeButton={true}
        showBackButton={true}
      />

      <div className="p-4 space-y-6">
        <div className="bg-blue-500 text-white p-4 rounded-2xl flex items-center justify-between">
          <span className="text-lg font-medium">Status:</span>
          <span className="text-2xl font-bold">
            {statusTexts[essay.status] ?? essay.status}
          </span>
        </div>

        <div className="rounded-lg overflow-hidden shadow bg-white">
          <img
            src={essay.text_image}
            alt="Redação enviada"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-gray-600 text-sm text-center">
          Sua redação foi {statusTexts[essay.status] ?? essay.status}.
          {essay.status === "UNDER_REVIEW"
            ? " O corretor está analisando seu texto, aguarde a correção."
            : essay.status === "READY_FOR_REVIEW"
              ? " Está na fila para ser corrigida."
              : essay.status === "SUBMITTED"
                ? " Aguarde a próxima etapa."
                : ""}
        </p>
      </div>
    </div>
  );
}
