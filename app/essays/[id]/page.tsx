"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  User,
  ArrowLeft,
  Upload,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

export default function EssayPage() {
  const { id } = useParams<{ id: string }>();
  const [essay, setEssay] = useState({});
  const [review, setReview] = useState({});
  const [competencies, setCompetencies] = useState([{}]);
  const [highlights, setHighlights] = useState([{}]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [selectedHighlight, setSelectedHighlight] = useState<number | null>(
    null,
  );
  const [selectedCompetency, setSelectedCompetency] = useState<number | null>(
    null,
  );
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const selectedHighlightData = selectedHighlight
    ? highlights.find((h) => h.id === selectedHighlight)
    : null;
  const splitPosition = selectedHighlightData
    ? selectedHighlightData.y + selectedHighlightData.height
    : null;

  const handleCompetencyClick = (competencyId: number) => {
    setSelectedCompetency(
      competencyId === selectedCompetency ? null : competencyId,
    );
    setSelectedHighlight(null);
  };

  const handleHighlightClick = (highlightId: number, competencyId: number) => {
    setSelectedHighlight(highlightId);
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const tips = [
    {
      title: "Use conectores",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet lacus nec turpis fringilla lacinia nec rhoncus urna. Suspendisse vitae tincidunt dolor, ac feugiat nisl.",
    },
    {
      title: "Estruture bem os parágrafos",
      content:
        "Organize suas ideias de forma clara e coerente, garantindo que cada parágrafo tenha uma função específica na argumentação.",
    },
    {
      title: "Use dados e estatísticas",
      content:
        "Fortaleça seus argumentos com informações concretas e dados relevantes ao tema proposto.",
    },
  ];

  const handleBackClick = () => {
    setSelectedCompetency(null);
    setSelectedHighlight(null);
    router.back();
  };

  useEffect(() => {
    async function fetchEssays() {
      const access = localStorage.getItem("access");
      if (!access) return;

      setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/v1/essays/${id}/`, router);
        const essayData = await res.json();
        setEssay(essayData);

        // ✅ Only set review and competencies once the data is available
        if (essayData.reviews && essayData.reviews.length > 0) {
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
          const reviewCommentThreads = firstReview.review_comment_threads || [];

          const formattedHighlights = reviewCommentThreads.map(
            (thread, index) => ({
              id: index + 1,
              x: thread.start_text_selection_x,
              y: thread.start_text_selection_y,
              width: thread.text_selection_width,
              height: thread.text_selection_height,
            }),
          );

          setHighlights(formattedHighlights);
        }
      } catch (err) {
        console.error("Error fetching active essay:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEssays();
  }, [id, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white">
        <button onClick={handleBackClick}>
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <Menu className="w-6 h-6 text-gray-600" />
      </header>

      <div className="p-4 space-y-4">
        {/* Overall Score Widget */}
        <div className="bg-blue-500 text-white p-4 flex items-center justify-between rounded-2xl">
          <span className="text-lg font-medium">Nota geral:</span>
          <span className="text-3xl font-bold">{review.final_score}</span>
        </div>

        {/* Essay Image Section with Teacher Annotations */}
        <div className="space-y-4">
          {/* Top section - shows image from top to split position */}
          <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
            <div
              className="relative w-full overflow-hidden"
              style={{
                maxHeight: splitPosition ? `${splitPosition}vh` : "none",
              }}
            >
              <img
                src={essay.text_image}
                alt="Redação corrigida com marcações do professor"
                className="w-full h-auto block"
              />
              {/* Highlights overlay */}
              <div className="absolute inset-0">
                {highlights.map((highlight) => {
                  if (splitPosition && highlight.y >= splitPosition)
                    return null;

                  return (
                    <button
                      key={highlight.id}
                      onClick={() =>
                        handleHighlightClick(
                          highlight.id,
                          highlight.competencyId,
                        )
                      }
                      className={`absolute cursor-pointer transition-all`}
                      style={{
                        left: `${highlight.x}%`,
                        top: `${highlight.y}vh`,
                        width: `${highlight.width}%`,
                        height: `${highlight.height}vh`,
                        backgroundColor:
                          selectedHighlight === highlight.id
                            ? "#0065FF80"
                            : "#0065FF40",
                        border:
                          selectedHighlight === highlight.id
                            ? "2px solid #0065FF"
                            : "1px solid #0065FF",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comment box - appears right after the selected highlight */}
          {selectedHighlight && (
            <div
              className="rounded-2xl p-4 border-2 animate-in fade-in slide-in-from-top-2 duration-300"
              style={{
                backgroundColor: "#3B82F650",
                borderColor: "#3B82F6",
              }}
            >
              <p className="text-sm text-gray-700 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit
                amet lacus nec turpis fringilla lacinia nec rhoncus urna.
                Suspendisse vitae tincidunt dolor, ac feugiat nisl. Maecenas nec
                quam lorem. Vestibulum bibendum, felis et ultrices lobortis,
                dolor nulla pulvinar est, sed posuere ligula risus eleifend
                justo.
              </p>
            </div>
          )}

          {/* Bottom section - shows image from split position to end */}
          {splitPosition && (
            <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="relative w-full overflow-hidden">
                <img
                  src={essay.text_image}
                  alt="Redação corrigida com marcações do professor - parte inferior"
                  className="w-full h-auto block"
                  style={{
                    marginTop: `-${splitPosition}vh`,
                  }}
                />
                {/* Highlights overlay */}
                <div
                  className="absolute inset-0"
                  style={{ marginTop: `-${splitPosition}vh` }}
                >
                  {highlights.map((highlight) => {
                    if (highlight.y + highlight.height <= splitPosition)
                      return null;

                    return (
                      <button
                        key={highlight.id}
                        onClick={() =>
                          handleHighlightClick(
                            highlight.id,
                            highlight.competencyId,
                          )
                        }
                        className={`absolute cursor-pointer transition-all`}
                        style={{
                          left: `${highlight.x}%`,
                          top: `${highlight.y}vh`,
                          width: `${highlight.width}%`,
                          height: `${highlight.height}vh`,
                          backgroundColor:
                            selectedHighlight === highlight.id
                              ? "#0065FF80"
                              : "#0065FF40",
                          border:
                            selectedHighlight === highlight.id
                              ? "2px solid #0065FF"
                              : "1px solid #0065FF",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Competency Buttons */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Veja os comentários do corretor por competência:
          </p>

          <div className="flex flex-wrap items-center flex-row justify-center gap-4">
            {competencies.map((comp) => {
              return (
                <button
                  key={comp.id}
                  onClick={() => handleCompetencyClick(comp.id)}
                  className={`relative text-white font-bold text-center min-w-[57px] rounded-2xl flex flex-col items-center justify-center h-[90px] ${
                    selectedCompetency === comp.id
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : ""
                  }`}
                  style={{
                    backgroundColor: "#3B82F6",
                  }}
                >
                  <div className="text-2xl font-bold">{comp.id}</div>
                  <div className="text-lg font-medium">{comp.score}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment Box */}
        {selectedCompetency &&
          (() => {
            const comp = competencies[selectedCompetency - 1];
            const bgColor = "#3B82F6";
            return (
              <div
                className="rounded-2xl p-4 border-2"
                style={{
                  backgroundColor: `${bgColor}50`,
                  borderColor: bgColor,
                }}
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
