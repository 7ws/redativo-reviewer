"use client";

import Essay from "@/types/essay";
import Header from "../header";
import ReviewedEssayViewer from "./reviewed_essay_viewer";

export default function EssayReviewed({ essay }: { essay: Essay }) {
  const review = essay.reviews[0];

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          showLogoutButton={true}
          showProfileButton={false}
          showHomeButton={true}
          showBackButton={true}
        />
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Nenhuma avaliação encontrada para esta redação.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showLogoutButton={true}
        showProfileButton={false}
        showHomeButton={true}
        showBackButton={true}
      />

      <div className="p-4 space-y-4">
        {/* Overall score */}
        <div className="bg-blue-500 text-white p-4 flex items-center justify-between rounded-2xl">
          <span className="text-lg font-medium">Nota geral:</span>
          <span className="text-3xl font-bold">{review.final_score}</span>
        </div>

        {/* Image + split behavior */}
        <div className="space-y-4">
          {/* top */}
          <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
            <div
              className="relative w-full overflow-hidden"
              style={{
                maxHeight: splitPositionPx ? `${splitPositionPx}px` : "none",
              }}
            >
              <img
                ref={imageRef}
                src={essay.text_image}
                alt="Redação corrigida com marcações do professor"
                className="w-full h-auto block"
                onLoad={handleImageLoad}
                // optional crossOrigin if backend requires it for naturalWidth accuracy:
                // crossOrigin="anonymous"
              />
              {/* overlays for top half */}
              <div className="absolute inset-0 pointer-events-none">
                {highlights.map((h) => {
                  const r = rectFromPct(h);
                  if (splitPositionPx && r.top >= splitPositionPx) return null;
                  // make interactive overlay accept clicks
                  return (
                    <button
                      key={h.id}
                      onClick={() => handleHighlightClick(h.id)}
                      style={{
                        position: "absolute",
                        left: `${r.left}px`,
                        top: `${r.top}px`,
                        width: `${r.width}px`,
                        height: `${r.height}px`,
                        backgroundColor:
                          selectedHighlight === h.id
                            ? "#0065FF80"
                            : "#0065FF40",
                        border:
                          selectedHighlight === h.id
                            ? "2px solid #0065FF"
                            : "1px solid #0065FF",
                        cursor: "pointer",
                        pointerEvents: "auto",
                      }}
                      aria-label={`Marcação ${h.id}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* comment box (inserted between halves) */}
          {selectedHighlight && (
            <div
              className="rounded-2xl p-4 border-2 animate-in fade-in slide-in-from-top-2 duration-300"
              style={{
                backgroundColor: "#3B82F650",
                borderColor: "#3B82F6",
              }}
            >
              <p className="text-sm text-gray-700 leading-relaxed">
                {highlights.find((x) => x.id === selectedHighlight)?.comment}
              </p>
            </div>
          )}

          {/* bottom */}
          {splitPositionPx && (
            <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="relative w-full overflow-hidden">
                <img
                  src={essay.text_image}
                  alt="Redação corrigida com marcações do professor - parte inferior"
                  className="w-full h-auto block"
                  style={{ marginTop: `-${splitPositionPx}px` }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ marginTop: `-${splitPositionPx}px` }}
                >
                  {highlights.map((h) => {
                    const r = rectFromPct(h);
                    if (r.top + r.height <= splitPositionPx) return null;
                    return (
                      <button
                        key={h.id}
                        onClick={() => handleHighlightClick(h.id)}
                        style={{
                          position: "absolute",
                          left: `${r.left}px`,
                          top: `${r.top}px`,
                          width: `${r.width}px`,
                          height: `${r.height}px`,
                          backgroundColor:
                            selectedHighlight === h.id
                              ? "#0065FF80"
                              : "#0065FF40",
                          border:
                            selectedHighlight === h.id
                              ? "2px solid #0065FF"
                              : "1px solid #0065FF",
                          cursor: "pointer",
                          pointerEvents: "auto",
                        }}
                        aria-label={`Marcação ${h.id}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Competency buttons */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Veja os comentários do corretor por competência:
          </p>
          <div className="flex flex-wrap items-center flex-row justify-center gap-4">
            {competencies.map((comp) => (
              <button
                key={comp.id}
                onClick={() => handleCompetencyClick(comp.id)}
                className={`relative text-white font-bold text-center min-w-[57px] rounded-2xl flex flex-col items-center justify-center h-[90px] ${
                  selectedCompetency === comp.id
                    ? "ring-2 ring-offset-2 ring-gray-400"
                    : ""
                }`}
                style={{ backgroundColor: "#3B82F6" }}
              >
                <div className="text-2xl font-bold">{comp.id}</div>
                <div className="text-lg font-medium">{comp.score}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Competency comment */}
        {selectedCompetency &&
          (() => {
            const comp = competencies[selectedCompetency - 1];
            const bg = "#3B82F6";
            return (
              <div
                className="rounded-2xl p-4 border-2"
                style={{ backgroundColor: `${bg}50`, borderColor: bg }}
              >
                <p className="text-sm text-gray-700 leading-relaxed">
                  {comp.text}
                </p>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
