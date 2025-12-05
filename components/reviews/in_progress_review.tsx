"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPostWithAuth, apiDeleteWithAuth } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Essay from "@/types/essay";
import Review from "@/types/review";
import Theme from "@/types/theme";
import Highlight from "@/types/highlight";
import { naturalToRendered } from "@/lib/imageCoords";
import { useHighlightSelection } from "@/hooks/use-highlight-selection";
import CommentBox from "./comment_box";
import Header from "../header";

export default function InProgressReview({ review }: { review: Review }) {
  const essay: Essay = review.essay;
  const theme: Theme = essay.theme;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth({ requireAuth: true });
  const [competencies, setCompetencies] = useState([
    { id: 1, score: "0", comment: "" },
    { id: 2, score: "0", comment: "" },
    { id: 3, score: "0", comment: "" },
    { id: 4, score: "0", comment: "" },
    { id: 5, score: "0", comment: "" },
  ]);

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(
    null,
  );
  const [commentBox, setCommentBox] = useState({
    show: false,
    position: { x: 0, y: 0 },
    comment: "",
    competencies: [] as number[],
  });

  const imageRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const {
    isSelecting,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp: handleSelectionComplete,
    getCurrentSelection,
  } = useHighlightSelection({
    imageRef,
    onSelectionComplete: (x, y, width, height) => {
      openCommentBox(x, y, width, height);
      const newHighlight: Highlight = {
        id: "",
        x,
        y,
        width,
        height,
        competency: [],
        comment: "",
      };
      setSelectedHighlight(newHighlight);
      setHighlights((prev) => [...prev, newHighlight]);
    },
  });

  // Helper to get rendered coordinates from natural coordinates
  const getRenderedCoords = (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    if (!imageRef.current) return null;
    const imgRect = imageRef.current.getBoundingClientRect();
    return naturalToRendered(
      { x, y, width, height },
      naturalSize.w,
      naturalSize.h,
      imgRect.width,
      imgRect.height,
    );
  };

  // Restore highlights from review threads on mount
  useEffect(() => {
    if (
      !review?.review_comment_threads ||
      review.review_comment_threads.length === 0
    )
      return;

    const img = imageRef.current;
    if (!img) return;

    const loadHighlights = () => {
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      if (!natW || !natH) return;

      setNaturalSize({ w: natW, h: natH });

      const restored = review.review_comment_threads.map((t) => ({
        id: `${t.id}`,
        x: Number(t.start_text_selection_x) || 0,
        y: Number(t.start_text_selection_y) || 0,
        width: Number(t.text_selection_width) || 0,
        height: Number(t.text_selection_height) || 0,
        competency: [],
        comment: t.comments?.[0]?.content || "",
      }));

      setHighlights(restored);
    };

    if (img.complete && img.naturalWidth > 0) {
      loadHighlights();
    } else {
      img.addEventListener("load", loadHighlights);
      return () => img.removeEventListener("load", loadHighlights);
    }
  }, [review?.review_comment_threads]);

  // Set natural size when image loads
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  };

  const handleScoreChange = (id: number, value: string) => {
    setCompetencies((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, score: value } : comp)),
    );
  };

  const handleCommentChange = (id: number, value: string) => {
    setCompetencies((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, comment: value } : comp)),
    );
  };

  const totalScore = competencies.reduce((sum, comp) => {
    const score = Number.parseInt(comp.score) || 0;
    return sum + score;
  }, 0);

  const handleHighlightClick = (highlight: Highlight, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedHighlight(highlight);
    setCommentBox({
      show: true,
      position: commentBox.position,
      comment: highlight.comment,
      competencies: highlight.competency,
    });
    openCommentBox(highlight.x, highlight.y, highlight.width, highlight.height);
  };

  const openCommentBox = (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    const imgRect = imageRef.current.getBoundingClientRect();

    const r = naturalToRendered(
      { x, y, width, height },
      naturalSize.w,
      naturalSize.h,
      imgRect.width,
      imgRect.height,
    );

    // Proposed position (rendered px)
    let posX = r.left + r.width / 2;
    let posY = r.top + r.height + 10;

    // Keep inside image
    const commentBoxWidth = 350;
    const commentBoxHeight = 250;

    // Clamp X
    posX = Math.max(
      commentBoxWidth / 2,
      Math.min(posX, imgRect.width - commentBoxWidth / 2),
    );

    // Clamp Y
    if (posY + commentBoxHeight > imgRect.height) {
      posY = r.top - commentBoxHeight - 10;
      if (posY < 0) posY = 10;
    }

    setCommentBox((prev) => ({
      ...prev,
      show: true,
      position: { x: posX, y: posY },
    }));
  };

  const toggleCompetency = (num: number) => {
    setCommentBox((prev) => ({
      ...prev,
      competencies: prev.competencies.includes(num)
        ? prev.competencies.filter((c) => c !== num)
        : [...prev.competencies, num].sort(),
    }));
  };

  const saveComment = async () => {
    if (!selectedHighlight) return;

    if (selectedHighlight.id !== "") {
      setSaveError("Esta marcação já foi salva.");
      return;
    }

    if (!commentBox.comment.trim()) {
      resetCommentBox();
      setHighlights((prev) => prev.filter((h) => h !== selectedHighlight));
      return;
    }

    const url = `/api/v1/reviewer/reviews/${review.id}/threads/`;
    const formData = new FormData();
    formData.append("comment", commentBox.comment);
    formData.append("competency", commentBox.competencies.join(","));
    formData.append(
      "start_text_selection_x",
      Math.round(selectedHighlight.x).toString(),
    );
    formData.append(
      "start_text_selection_y",
      Math.round(selectedHighlight.y).toString(),
    );
    formData.append("text_selection_width", selectedHighlight.width.toString());
    formData.append(
      "text_selection_height",
      selectedHighlight.height.toString(),
    );

    try {
      setSaveError(null);
      const res = await apiPostWithAuth(url, router, formData);

      if (!res || !res.ok) {
        setSaveError("Erro ao salvar comentário.");
        return;
      }

      const data = await res.json();

      setHighlights((prev) =>
        prev.map((h) =>
          h === selectedHighlight
            ? {
                ...h,
                id: data.id || (formData.get("id") as string),
                comment: commentBox.comment,
                competency: commentBox.competencies,
              }
            : h,
        ),
      );
      resetCommentBox();
    } catch (err) {
      console.error(err);
      setSaveError("Erro ao salvar comentário.");
    }
  };

  const resetCommentBox = () => {
    setCommentBox({
      show: false,
      position: { x: 0, y: 0 },
      comment: "",
      competencies: [],
    });
    setSelectedHighlight(null);
  };

  const deleteHighlight = async () => {
    if (!selectedHighlight) return;

    if (selectedHighlight.id !== "") {
      const url = `/api/v1/reviewer/reviews/${review.id}/threads/${selectedHighlight.id}/`;
      try {
        setSaveError(null);
        const res = await apiDeleteWithAuth(url, router);

        if (!res || !res.ok) {
          setSaveError("Erro ao excluir marcação.");
          return;
        }
      } catch (err) {
        console.error(err);
        setSaveError("Erro ao excluir marcação.");
        return;
      }
    }

    setHighlights((prev) => prev.filter((h) => h !== selectedHighlight));
    resetCommentBox();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".comment-box") && !target.closest(".highlight")) {
        // Highlights that are NOT saved on the database will have id === ""
        if (selectedHighlight && selectedHighlight.id === "") {
          setHighlights((prev) => prev.filter((h) => h !== selectedHighlight));
        }
        resetCommentBox();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedHighlight]);

  // Validation helper
  const validateCompetencies = () => {
    const newErrors: Record<number, string> = {};
    let hasError = false;

    competencies.forEach((c) => {
      const score = Number(c.score);
      if (isNaN(score) || score < 0 || score > 200 || score % 20 !== 0) {
        newErrors[c.id] =
          "A nota deve estar entre 0 e 200 e ser múltiplo de 20.";
        hasError = true;
      } else if (c.comment.trim() === "") {
        newErrors[c.id] = "O comentário é obrigatório.";
        hasError = true;
      }
    });

    return { errors: newErrors, hasError };
  };

  const handleSave = async () => {
    const { errors: newErrors, hasError } = validateCompetencies();

    if (hasError) {
      setErrors(newErrors);
      setSaveError("Por favor, corrija os erros antes de salvar.");
      return;
    }

    setErrors({});
    setSaveError(null);
    setSaveSuccess(null);

    const url = `/api/v1/reviewer/themes/${theme.id}/essays/${essay.id}/reviews/${review.id}/finish/`;

    const formData = new FormData();
    competencies.forEach((c) => {
      formData.append(`skill_${c.id}_score`, c.score);
      formData.append(`skill_${c.id}_text`, c.comment);
    });

    try {
      const res = await apiPostWithAuth(url, router, formData);
      if (!res || !res.ok) throw new Error(`Erro ${res?.status}`);
      router.push(`/home`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        showLogoutButton={true}
        showProfileButton={false}
        showHomeButton={true}
        showBackButton={true}
      />
      <div className="flex items-center justify-between px-8 py-6 border-b">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">{essay.title}</h1>
          <h2 className="text-lg font-semibold text-black mb-2">
            Tema: {theme.title}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed max-w-4xl">
            {theme.short_description}
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium rounded-lg"
        >
          Salvar
        </Button>
      </div>

      <div className="flex gap-8 p-8">
        <div className="flex-1">
          <div
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative cursor-crosshair select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={essay.text_image}
              onLoad={handleImageLoad}
              className="w-full h-auto pointer-events-none"
              draggable={false}
            />

            {highlights.map((h) => {
              const rendered = getRenderedCoords(h.x, h.y, h.width, h.height);
              if (!rendered) return null;

              return (
                <div
                  key={h.id}
                  className="highlight absolute cursor-pointer"
                  style={{
                    left: `${rendered.left}px`,
                    top: `${rendered.top}px`,
                    width: `${rendered.width}px`,
                    height: `${rendered.height}px`,
                    backgroundColor:
                      selectedHighlight === h
                        ? "rgba(0, 101, 255, 0.25)"
                        : "rgba(199, 220, 249, 0.3)",
                    border: "2px solid rgba(0, 101, 255, 0.6)",
                  }}
                  onClick={(e) => handleHighlightClick(h, e)}
                />
              );
            })}

            {isSelecting &&
              naturalSize.w > 0 &&
              (() => {
                const x = Math.min(selectionStart.x, selectionEnd.x);
                const y = Math.min(selectionStart.y, selectionEnd.y);
                const width = Math.abs(selectionEnd.x - selectionStart.x);
                const height = Math.abs(selectionEnd.y - selectionStart.y);

                const rendered = getRenderedCoords(x, y, width, height);
                if (!rendered) return null;

                return (
                  <div
                    className="absolute pointer-events-none border-2 border-blue-600 border-dashed"
                    style={{
                      left: `${rendered.left}px`,
                      top: `${rendered.top}px`,
                      width: `${rendered.width}px`,
                      height: `${rendered.height}px`,
                    }}
                  />
                );
              })()}

            {commentBox.show && (
              <div
                ref={commentBoxRef}
                className="comment-box absolute bg-white rounded-xl shadow-lg border-2 border-blue-600 p-4 z-50"
                style={{
                  left: `${commentBox.position.x}px`,
                  top: `${commentBox.position.y}px`,
                  transform: "translateX(-50%)",
                  width: "350px",
                  maxWidth: "90vw",
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => toggleCompetency(num)}
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-semibold transition-colors ${
                          commentBox.competencies.includes(num)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={deleteHighlight}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <Textarea
                  placeholder="Adicione um comentário"
                  value={commentBox.comment}
                  onChange={(e) =>
                    setCommentBox((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  className="border-gray-300 placeholder:text-gray-400 min-h-[100px] resize-none"
                  autoFocus
                />

                <Button
                  onClick={saveComment}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="w-[400px] space-y-4">
          <h3 className="text-lg font-semibold text-black mb-4">
            Informar nota por competência:
          </h3>

          <div className="space-y-4">
            {competencies.map((comp) => (
              <div
                key={comp.id}
                className={`bg-gray-100 rounded-2xl p-4 space-y-3 ${
                  errors[comp.id] ? "border border-red-400" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-gray-700">
                      {comp.id}
                    </span>
                  </div>

                  <select
                    value={comp.score}
                    onChange={(e) => handleScoreChange(comp.id, e.target.value)}
                    className={`flex-1 bg-white border rounded-md px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 ${
                      errors[comp.id]
                        ? "border-red-400 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  >
                    {[...Array(11)].map((_, i) => {
                      const value = i * 20;
                      return (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <Textarea
                  placeholder="Adicione um comentário"
                  value={comp.comment}
                  onChange={(e) => handleCommentChange(comp.id, e.target.value)}
                  className={`bg-white border placeholder:text-gray-400 min-h-20 resize-none ${
                    errors[comp.id]
                      ? "border-red-400 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />

                {errors[comp.id] && (
                  <p className="text-sm text-red-500">{errors[comp.id]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="bg-blue-500 text-white rounded-2xl p-4 flex items-center justify-between">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold">{totalScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
