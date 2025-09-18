"use client";

import { useState } from "react";
import { Menu, User, ArrowLeft, Upload } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EssayApp() {
  const [activeTab, setActiveTab] = useState<"temas" | "redacoes">("temas");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [showEssaySubmission, setShowEssaySubmission] = useState(false);
  const [submissionMode, setSubmissionMode] = useState<
    "digital" | "manuscrito"
  >("digital");

  const handleThemeClick = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handleBackClick = () => {
    if (showEssaySubmission) {
      setShowEssaySubmission(false);
    } else {
      setSelectedTheme(null);
    }
  };

  const handleWriteEssay = () => {
    setShowEssaySubmission(true);
  };

  if (showEssaySubmission) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white border-b">
          <button onClick={handleBackClick}>
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
          <Menu className="w-6 h-6 text-black" />
        </header>

        {/* Submission Mode Tabs */}
        <div className="flex px-4 py-2 bg-white border-b">
          <button
            onClick={() => setSubmissionMode("digital")}
            className={`px-4 py-2 font-bold ${submissionMode === "digital" ? "text-black border-b-2 border-black" : "text-gray-400 font-medium"}`}
          >
            Digital
          </button>
          <button
            onClick={() => setSubmissionMode("manuscrito")}
            className={`px-4 py-2 font-bold ${submissionMode === "manuscrito" ? "text-black border-b-2 border-black" : "text-gray-400 font-medium"}`}
          >
            Manuscrito
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col h-[calc(100vh-140px)]">
          {submissionMode === "digital" ? (
            <>
              {/* Title Input */}
              <Input
                placeholder="Se quiser usar um título, você pode por aqui"
                className="mb-4 border-gray-300 text-gray-600 placeholder:text-gray-400"
              />

              {/* Essay Text Area */}
              <Textarea
                placeholder=""
                className="flex-1 resize-none border-gray-300 mb-4"
              />

              {/* Submit Button */}
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium">
                Enviar Redação
              </Button>
            </>
          ) : (
            <>
              {/* Tips Section */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-black mb-4">
                  Dicas para mandar bem na foto da redação:
                </h2>

                <ol className="space-y-2 text-gray-600 text-sm">
                  <li>1. Luz boa – prefira luz natural, sem sombras.</li>
                  <li>
                    2. Foco nítido – segure firme e toque na tela antes de
                    clicar.
                  </li>
                  <li>
                    3. Enquadre a folha inteira – sem cortes nem partes
                    faltando.
                  </li>
                  <li>4. Evite formar sombras sobre o texto</li>
                </ol>
              </div>

              {/* Attach Button */}
              <Button
                variant="outline"
                className="w-full mb-4 py-3 border-blue-500 text-blue-500 hover:bg-blue-50 font-medium flex items-center justify-center gap-2 bg-transparent"
              >
                <Upload className="w-4 h-4" />
                Anexar Redação
              </Button>

              {/* Spacer */}
              <div className="flex-1"></div>

              {/* Submit Button (Disabled State) */}
              <Button
                disabled
                className="w-full bg-gray-400 text-white py-3 rounded-lg font-medium cursor-not-allowed"
              >
                Enviar Redação
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (selectedTheme === "biofuel") {
    return (
      <div className="min-h-screen bg-white">
        {/* Yellow Header with Back Button */}
        <header className="bg-gradient-to-br from-orange-400 to-yellow-400 px-4 py-6 relative">
          <div className="flex items-center justify-between mb-8">
            <button onClick={handleBackClick}>
              <ArrowLeft className="w-6 h-6 text-black" />
            </button>
            <Menu className="w-6 h-6 text-black" />
          </div>

          {/* Large Biofuel Illustration */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Blue cloud background */}
              <div className="absolute -top-4 -left-8 w-24 h-16 bg-blue-300 rounded-full opacity-80"></div>
              <div className="absolute -top-2 -right-4 w-16 h-12 bg-blue-400 rounded-full opacity-70"></div>

              {/* Gas pump */}
              <div className="relative z-10 w-16 h-20 bg-orange-600 rounded-lg border-4 border-black flex flex-col items-center justify-center">
                {/* Screen */}
                <div className="w-10 h-6 bg-gray-300 rounded-sm border-2 border-black mb-2"></div>
                {/* Leaf logo */}
                <div className="w-6 h-4 bg-green-500 rounded-full border-2 border-black relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-green-600"></div>
                </div>
              </div>

              {/* Gas nozzle */}
              <div className="absolute -right-6 top-4 w-8 h-12 bg-gray-700 rounded-full border-2 border-black">
                <div className="absolute top-2 left-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </div>

              {/* Hose */}
              <div className="absolute -right-4 top-8 w-12 h-3 bg-black rounded-full"></div>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <h1 className="text-xl font-bold text-black mb-4 leading-tight">
            Os desafios do uso de biocombustíveis no Brasil
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Nos últimos anos, o uso de biocombustíveis, como o etanol e o
            biodiesel, tem se mostrado uma alternativa importante para reduzir a
            dependência de combustíveis fósseis e diminuir a emissão de gases
            poluentes. O Brasil se destaca mundialmente nesse setor, pois possui
            grande produção de cana-de-açúcar e soja, matérias-primas essenciais
            para a fabricação desses combustíveis. Além disso, o incentivo
            governamental e os avanços tecnológicos contribuíram para tornar o
            etanol brasileiro um dos mais eficientes do mundo.
          </p>

          <Button
            onClick={handleWriteEssay}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
          >
            Escrever redação
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white">
        <Menu className="w-6 h-6 text-gray-600" />
        <Avatar className="w-10 h-10 bg-blue-300">
          <AvatarFallback className="bg-blue-300">
            <User className="w-5 h-5 text-white" />
          </AvatarFallback>
        </Avatar>
      </header>

      {/* Navigation Tabs */}
      <div className="flex px-4 py-2 bg-white border-b">
        <button
          onClick={() => setActiveTab("temas")}
          className={`px-4 py-2 font-bold ${activeTab === "temas" ? "text-black border-b-2 border-black" : "text-gray-500 font-medium"}`}
        >
          Temas
        </button>
        <button
          onClick={() => setActiveTab("redacoes")}
          className={`px-4 py-2 font-bold ${activeTab === "redacoes" ? "text-black border-b-2 border-black" : "text-gray-500 font-medium"}`}
        >
          Minhas Redações
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeTab === "temas" ? (
          <>
            {/* Remote Work Topic Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-32 h-24 bg-gradient-to-br from-teal-300 to-blue-300 flex items-center justify-center relative">
                    <div className="relative">
                      <div className="w-8 h-6 bg-orange-400 rounded-t-full mb-1"></div>
                      <div className="w-10 h-8 bg-orange-500 rounded-lg relative">
                        <div className="absolute top-1 left-1 w-6 h-3 bg-gray-700 rounded-sm"></div>
                      </div>
                      <div className="absolute -left-2 top-2 w-3 h-4 bg-green-500 rounded-full"></div>
                      <div className="absolute -left-1 top-1 w-2 h-3 bg-green-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-sm text-black leading-tight mb-2">
                      Como o trabalho remoto impacta o Brasil e o brasileiro?
                    </h3>
                    <p className="text-xs text-gray-500">Médio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Biofuel Topic Card */}
            <Card
              className="overflow-hidden cursor-pointer"
              onClick={() => handleThemeClick("biofuel")}
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-32 h-24 bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center relative">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center relative">
                      <div className="w-8 h-6 bg-orange-700 rounded-sm"></div>
                      <div className="absolute -right-1 top-1 w-3 h-3 bg-teal-500 rounded-full"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-sm text-black leading-tight mb-2">
                      Os desafios do uso de biocombustíveis no Brasil
                    </h3>
                    <p className="text-xs text-gray-500">Difícil</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formal Work Topic Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-32 h-24 bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center relative">
                    <div className="relative">
                      <div className="flex space-x-1 mb-2">
                        <div className="w-3 h-4 bg-gray-600 rounded-sm"></div>
                        <div className="w-4 h-5 bg-gray-700 rounded-sm"></div>
                      </div>
                      <div className="w-6 h-4 bg-orange-600 rounded-lg relative">
                        <div className="absolute -top-1 left-1 w-2 h-2 bg-orange-400 rounded-full"></div>
                      </div>
                      <div className="absolute -right-2 top-1 w-4 h-3 bg-red-400 rounded-sm flex items-end">
                        <div className="w-1 h-2 bg-red-600 mr-1"></div>
                        <div className="w-1 h-1 bg-red-600"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-sm text-black leading-tight mb-2">
                      A precarização do trabalho formal
                    </h3>
                    <p className="text-xs text-gray-500">Médio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Biofuel Essay Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-32 h-24 bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center relative">
                    <Badge className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1">
                      Em correção
                    </Badge>
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center relative">
                      <div className="w-8 h-6 bg-orange-700 rounded-sm"></div>
                      <div className="absolute -right-1 top-1 w-3 h-3 bg-teal-500 rounded-full"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-sm text-black leading-tight mb-2">
                      Os desafios do uso de biocombustíveis no Brasil
                    </h3>
                    <p className="text-xs text-gray-500">
                      Feito em: 05 ago 2025
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone Ban Essay Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-32 h-24 bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center relative">
                    <Badge className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1">
                      Corrigido 875 pts
                    </Badge>
                    <div className="flex space-x-1">
                      <div className="w-4 h-6 bg-orange-400 rounded-full"></div>
                      <div className="w-4 h-6 bg-blue-400 rounded-full"></div>
                      <div className="w-4 h-6 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-sm text-black leading-tight mb-2">
                      Banimento dos celulares nas escolas na nova geração
                    </h3>
                    <p className="text-xs text-gray-500">
                      Feito em: 27 Jul 2025
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
