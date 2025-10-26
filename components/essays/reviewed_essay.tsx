"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { apiGetWithAuth } from "@/lib/api";
import Essay from "@/types/essay";
import Review from "@/types/review";
import Header from "../header";

export default function EssayReviewed({ essay }: { essay: Essay }) {
  const { id } = useParams();
  const router = useRouter();

  const [review, setReview] = useState<Review>();
  const [competencies, setCompetencies] = useState([]);
  // rawHighlights: exactly as returned from backend
  const [rawHighlights, setRawHighlights] = useState([]);
  // highlights: normalized to percent-of-image { id, xPct, yPct, wPct, hPct, comment }
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [selectedCompetency, setSelectedCompetency] = useState(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const imageRef = useRef(null);
  const [renderSize, setRenderSize] = useState({ width: 0, height: 0 });

  const tips = [
    { title: "Use conectores", content: "Lorem ipsum..." },
    {
      title: "Estruture bem os parágrafos",
      content: "Organize suas ideias...",
    },
    {
      title: "Use dados e estatísticas",
      content: "Fortaleça seus argumentos...",
    },
  ];

  const handleCompetencyClick = (id: string) => {
    setSelectedCompetency(selectedCompetency === id ? null : id);
    setSelectedHighlight(null);
  };

  const handleHighlightClick = (id: string) => {
    setSelectedHighlight(selectedHighlight === id ? null : id);
    setSelectedCompetency(null);
  };

  // update render size (called on load & resize)
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

  // Fetch essay and keep backend highlight numbers untouched in rawHighlights
  useEffect(() => {
    async function fetchEssays() {
      setLoading(true);
      try {
        const res = await apiGetWithAuth(`/api/v1/essays/${id}/`, router);
        const essayData = await res.json();

        const firstReview = essayData.reviews[0];
        setReview(firstReview);
        setCompetencies([
          {
            id: 1,
            score: firstReview.skill_1_score,
            text: firstReview.skill_1_text,
          },
          {
            id: 2,
            score: firstReview.skill_2_score,
            text: firstReview.skill_2_text,
          },
          {
            id: 3,
            score: firstReview.skill_3_score,
            text: firstReview.skill_3_text,
          },
          {
            id: 4,
            score: firstReview.skill_4_score,
            text: firstReview.skill_4_text,
          },
          {
            id: 5,
            score: firstReview.skill_5_score,
            text: firstReview.skill_5_text,
          },
        ]);

        const threads = firstReview.review_comment_threads || [];
        // map backend threads in raw form
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
      } catch (err) {
        console.error("Error fetching essay:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEssays();
  }, [id, router]);

  // Normalize rawHighlights to percent-of-image after image natural size is known
  const normalizeHighlightsToPercent = (raw, natW, natH) => {
    // heuristic helper to decide input unit:
    // - fraction: values in [0,1] (e.g. 0.12)
    // - percent: values in (1..100]
    // - pixels: values > 100 (or <= nat dimension)
    const decideUnit = (val, natDim) => {
      if (val === null || val === undefined) return "pixels";
      if (val <= 1) return "fraction";
      if (val <= 100) return "percent";
      // if val bigger than 100 but less than natural dimension, it's probably pixels too
      return "pixels";
    };

    return raw.map((h) => {
      const unitX = decideUnit(h.x, natW);
      const unitW = decideUnit(h.width, natW);
      const unitY = decideUnit(h.y, natH);
      const unitH = decideUnit(h.height, natH);

      // convert each to percent (0-100)
      const toPctX = (() => {
        if (unitX === "fraction") return h.x * 100;
        if (unitX === "percent") return h.x;
        // pixels
        return (h.x / natW) * 100;
      })();

      const toPctW = (() => {
        if (unitW === "fraction") return h.width * 100;
        if (unitW === "percent") return h.width;
        return (h.width / natW) * 100;
      })();

      const toPctY = (() => {
        if (unitY === "fraction") return h.y * 100;
        if (unitY === "percent") return h.y;
        return (h.y / natH) * 100;
      })();

      const toPctH = (() => {
        if (unitH === "fraction") return h.height * 100;
        if (unitH === "percent") return h.height;
        return (h.height / natH) * 100;
      })();

      // sanitize: clamp 0..100 to avoid crazy values
      const clamp = (v) => Math.max(0, Math.min(100, v || 0));

      return {
        id: h.id,
        xPct: clamp(toPctX),
        yPct: clamp(toPctY),
        wPct: clamp(toPctW),
        hPct: clamp(toPctH),
        comment: h.comment,
      };
    });
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    const natW = img.naturalWidth || 0;
    const natH = img.naturalHeight || 0;
    // update render size now as well
    updateRenderSize();

    if (rawHighlights && rawHighlights.length > 0 && natW && natH) {
      const normalized = normalizeHighlightsToPercent(
        rawHighlights,
        natW,
        natH,
      );
      setHighlights(normalized);
      // debugging (remove if you want)
      console.log("natural size:", natW, natH);
      console.log("raw highlights:", rawHighlights);
      console.log("normalized highlights (%):", normalized);
    }
  };

  // whenever render size changes, we just re-render: overlays will use renderSize
  useEffect(() => {
    // recalc split when renderSize or highlights change if needed
  }, [renderSize, highlights]);

  // If a highlight is selected, split position (in px) under image is computed from yPct + hPct
  const getSplitPx = () => {
    if (!selectedHighlight) return null;
    const h = highlights.find((x) => x.id === selectedHighlight);
    if (!h || !renderSize.height) return null;
    const splitPx = ((h.yPct + h.hPct) / 100) * renderSize.height;
    return Math.round(splitPx);
  };

  const splitPositionPx = getSplitPx();

  // helper to compute overlay pixel rect from percent values
  const rectFromPct = (h) => {
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

  // tips navigation
  const nextTip = () => setCurrentTipIndex((p) => (p + 1) % tips.length);
  const prevTip = () =>
    setCurrentTipIndex((p) => (p - 1 + tips.length) % tips.length);

  // small loading guard
  if (loading) {
    return <div className="min-h-screen p-8">Carregando...</div>;
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

        {/* Personalized Tips */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Mais dicas para você:</h3>
          <div className="relative">
            <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
              <h4 className="font-bold text-blue-600 mb-2">
                {tips[currentTipIndex].title}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {tips[currentTipIndex].content}
              </p>
            </div>

            {/* Carousel Navigation */}
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={prevTip}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-1">
                {tips.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === currentTipIndex ? "bg-blue-500" : "bg-gray-300"}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTip}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
