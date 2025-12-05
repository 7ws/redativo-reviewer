"use client";

import { useEffect, useRef, useState } from "react";
import Review from "@/types/review";

interface Competency {
  id: number;
  score: number;
  text: string;
}

interface Highlight {
  id: number;
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  comment: string;
}

interface ReviewedEssayViewerProps {
  review: Review;
  essayImageUrl: string;
}

export default function ReviewedEssayViewer({
  review,
  essayImageUrl,
}: ReviewedEssayViewerProps) {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [rawHighlights, setRawHighlights] = useState([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedHighlight, setSelectedHighlight] = useState<number | null>(
    null,
  );
  const [selectedCompetency, setSelectedCompetency] = useState<number | null>(
    null,
  );

  const imageRef = useRef<HTMLImageElement>(null);
  const [renderSize, setRenderSize] = useState({ width: 0, height: 0 });

  const handleCompetencyClick = (id: number) => {
    setSelectedCompetency(selectedCompetency === id ? null : id);
    setSelectedHighlight(null);
  };

  const handleHighlightClick = (id: number) => {
    setSelectedHighlight(selectedHighlight === id ? null : id);
    setSelectedCompetency(null);
  };

  const updateRenderSize = () => {
    if (imageRef.current) {
      const r = imageRef.current.getBoundingClientRect();
      setRenderSize({
        width: Math.round(r.width),
        height: Math.round(r.height),
      });
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateRenderSize);
    return () => window.removeEventListener("resize", updateRenderSize);
  }, []);

  useEffect(() => {
    function setupEssayData() {
      setCompetencies([
        {
          id: 1,
          score: Number(review.skill_1_score),
          text: review.skill_1_text,
        },
        {
          id: 2,
          score: Number(review.skill_2_score),
          text: review.skill_2_text,
        },
        {
          id: 3,
          score: Number(review.skill_3_score),
          text: review.skill_3_text,
        },
        {
          id: 4,
          score: Number(review.skill_4_score),
          text: review.skill_4_text,
        },
        {
          id: 5,
          score: Number(review.skill_5_score),
          text: review.skill_5_text,
        },
      ]);

      const threads = review.review_comment_threads || [];
      setRawHighlights(
        threads.map((t, i) => ({
          id: i + 1,
          x: t.start_text_selection_x,
          y: t.start_text_selection_y,
          width: t.text_selection_width,
          height: t.text_selection_height,
          comment: t.comments?.[0].content ?? "Sem comentário disponível.",
        })),
      );
      setLoading(false);
    }

    setupEssayData();
  }, [review]);

  const normalizeHighlights = (raw, natW, natH) => {
    return raw.map((h) => ({
      id: h.id,
      xPct: (Number(h.x) / natW) * 100,
      yPct: (Number(h.y) / natH) * 100,
      wPct: (Number(h.width) / natW) * 100,
      hPct: (Number(h.height) / natH) * 100,
      comment: h.comment,
    }));
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    const natW = img.naturalWidth || 0;
    const natH = img.naturalHeight || 0;
    updateRenderSize();

    if (rawHighlights && rawHighlights.length > 0 && natW && natH) {
      const normalized = normalizeHighlights(rawHighlights, natW, natH);
      setHighlights(normalized);
    }
  };

  const getSplitPx = () => {
    if (!selectedHighlight) return null;
    const h = highlights.find((x) => x.id === selectedHighlight);
    if (!h || !renderSize.height) return null;
    const splitPx = ((h.yPct + h.hPct) / 100) * renderSize.height;
    return Math.round(splitPx);
  };

  const splitPositionPx = getSplitPx();

  const rectFromPct = (h: Highlight) => {
    const left = (h.xPct / 100) * renderSize.width;
    const top = (h.yPct / 100) * renderSize.height;
    const width = (h.wPct / 100) * renderSize.width;
    const height = (h.hPct / 100) * renderSize.height;
    return {
      left: Math.round(left),
      top: Math.round(top),
      width: Math.round(width),
      height: Math.round(height),
    };
  };

  if (loading) {
    return <div className="min-h-screen p-8">Carregando...</div>;
  }

  return (
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
              src={essayImageUrl}
              alt="Redação corrigida com marcações do professor"
              className="w-full h-auto block"
              onLoad={handleImageLoad}
            />
            {/* overlays for top half */}
            <div className="absolute inset-0 pointer-events-none">
              {highlights.map((h) => {
                const r = rectFromPct(h);
                if (splitPositionPx && r.top >= splitPositionPx) return null;
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
                        selectedHighlight === h.id ? "#0065FF80" : "#0065FF40",
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
                src={essayImageUrl}
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
  );
}
