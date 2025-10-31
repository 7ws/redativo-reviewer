"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPostWithAuth } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import Essay from "@/types/essay";
import Review from "@/types/review";
import Theme from "@/types/theme";
import Highlight from "@/types/highlight";
import { getImageRelativeCoords } from "@/lib/imageCoords";
import { naturalToRendered } from "@/lib/imageCoords";
import Thread from "@/types/thread";

export default function InProgressReview({ review }: { review: Review }) {
  const essay: Essay = review.essay;
  const theme: Theme = essay.theme;
  const router = useRouter();
  const [competencies, setCompetencies] = useState([
    { id: 1, score: "", comment: "" },
    { id: 2, score: "", comment: "" },
    { id: 3, score: "", comment: "" },
    { id: 4, score: "", comment: "" },
    { id: 5, score: "", comment: "" },
  ]);

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentBoxPosition, setCommentBoxPosition] = useState({ x: 0, y: 0 });
  const [tempComment, setTempComment] = useState("");
  const [tempCompetency, setTempCompetency] = useState<number[]>([]);
  const commentBoxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [rawThreads, setRawThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (review?.review_comment_threads) {
      setRawThreads(review.review_comment_threads);
    }
  }, [review]);

  // restore helper (idempotent guard inside)
  const restoreHighlightsFromRaw = () => {
    const img = imageRef.current;
    if (!img) return;
    if (!rawThreads || rawThreads.length === 0) return;
    // already restored?
    if (naturalSize.w > 0 && highlights.length > 0) {
      // optional: you might want to check highlights originated from rawThreads
      // but returning early avoids duplicate work
      return;
    }

    // Ensure natural size is set
    const natW = img.naturalWidth || 0;
    const natH = img.naturalHeight || 0;
    if (!natW || !natH) return; // caller should ensure image is ready

    setNaturalSize({ w: natW, h: natH });

    const restored = rawThreads.map((t) => ({
      id: `${t.id}`, // keep same id type you expect
      x: Number(t.start_text_selection_x) || 0,
      y: Number(t.start_text_selection_y) || 0,
      width: Number(t.text_selection_width) || 0,
      height: Number(t.text_selection_height) || 0,
      competency: [], // fill if you have that data
      comment: t.comments?.[0]?.content || "",
    }));

    setHighlights(restored);
  };

  // call on image load (when image actually fires onLoad)
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const natW = img.naturalWidth || 0;
    const natH = img.naturalHeight || 0;
    setNaturalSize({ w: natW, h: natH });

    // try restore immediately (rawThreads may or may not already be present)
    if (rawThreads && rawThreads.length > 0) {
      restoreHighlightsFromRaw();
    }
  };

  // fallback / synchronization effect — runs when rawThreads changes
  useEffect(() => {
    if (!rawThreads || rawThreads.length === 0) return;
    const img = imageRef.current;
    if (!img) return;

    // if the image is already complete (cached or loaded), restore immediately
    if (img.complete && img.naturalWidth > 0) {
      restoreHighlightsFromRaw();
      return;
    }

    // otherwise wait for the image load event and restore after it fires
    const onLoad = () => {
      restoreHighlightsFromRaw();
    };
    img.addEventListener("load", onLoad);

    return () => {
      img.removeEventListener("load", onLoad);
    };
  }, [rawThreads]); // re-run whenever rawThreads changes

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

  const handleMouseDown = (e) => {
    if (!imageRef.current) return;
    const { x, y } = getImageRelativeCoords(e, imageRef.current);

    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isSelecting || !imageRef.current) return;
    const { x, y } = getImageRelativeCoords(e, imageRef.current);
    setSelectionEnd({ x, y });
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);

    if (width > 10 && height > 10) {
      const x = Math.min(selectionStart.x, selectionEnd.x);
      const y = Math.min(selectionStart.y, selectionEnd.y);

      openCommentBox(x, y, width, height);
      setTempComment("");
      setTempCompetency([]);

      const newHighlight: Highlight = {
        id: `temp-${Date.now()}`,
        x,
        y,
        width,
        height,
        competency: [],
        comment: "",
      };
      setActiveHighlight(newHighlight.id);
      setHighlights((prev) => [...prev, newHighlight]);
    }
  };

  const handleHighlightClick = (highlight: Highlight, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveHighlight(highlight.id);
    setTempComment(highlight.comment);
    setTempCompetency(highlight.competency);
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
      {
        x: x,
        y: y,
        width: width,
        height: height,
      },
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

    setCommentBoxPosition({ x: posX, y: posY });
    setShowCommentBox(true);
  };

  const toggleCompetency = (num: number) => {
    setTempCompetency((prev) => {
      if (prev.includes(num)) {
        return prev.filter((c) => c !== num);
      } else {
        return [...prev, num].sort();
      }
    });
  };

  const saveComment = async () => {
    if (!activeHighlight) return;

    if (tempComment.trim() || tempCompetency.length > 0) {
      setHighlights((prev) =>
        prev.map((h) =>
          h.id === activeHighlight
            ? { ...h, comment: tempComment, competency: tempCompetency }
            : h,
        ),
      );

      const h: Highlight = highlights.find((h) => h.id === activeHighlight);
      if (!h) return;

      const url = `/api/v1/reviewer/reviews/${review.id}/threads/`;
      const formData = new FormData();
      formData.append("comment", tempComment);
      formData.append("competency", tempCompetency.join(","));
      formData.append("start_text_selection_x", Math.round(h.x).toString());
      formData.append("start_text_selection_y", Math.round(h.y).toString());
      formData.append("text_selection_width", h.width.toString());
      formData.append("text_selection_height", h.height.toString());

      try {
        const res = await apiPostWithAuth(url, router, formData);
        if (!res || !res.ok) throw new Error(`Erro ${res?.status}`);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Remove highlight if no content was added
      setHighlights((prev) => prev.filter((h) => h.id !== activeHighlight));
    }

    setShowCommentBox(false);
    setActiveHighlight(null);
    setTempComment("");
    setTempCompetency([]);
  };

  const deleteHighlight = () => {
    if (!activeHighlight) return;
    setHighlights((prev) => prev.filter((h) => h.id !== activeHighlight));
    setShowCommentBox(false);
    setActiveHighlight(null);
    setTempComment("");
    setTempCompetency([]);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        showCommentBox &&
        !target.closest(".comment-box") &&
        !target.closest(".highlight")
      ) {
        if (tempComment.trim() || tempCompetency.length > 0) {
          // Save the comment if there's content
          if (activeHighlight) {
            setHighlights((prev) =>
              prev.map((h) =>
                h.id === activeHighlight
                  ? { ...h, comment: tempComment, competency: tempCompetency }
                  : h,
              ),
            );
          }
        } else {
          // Remove highlight if no content was added
          if (activeHighlight) {
            setHighlights((prev) =>
              prev.filter((h) => h.id !== activeHighlight),
            );
          }
        }
        setShowCommentBox(false);
        setActiveHighlight(null);
        setTempComment("");
        setTempCompetency([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCommentBox, activeHighlight, tempComment, tempCompetency]);

  // 🟢 Save button
  const handleSave = async () => {
    const url = `/api/v1/reviewer/themes/${theme.id}/essays/${essay.id}/reviews/${review.id}/finish/`;

    for (const c of competencies) {
      if (c.comment.trim() === "") {
        return;
      }
      // if (c.score < 0 || c.score > 200 || c.score % 40 !== 0) {
      //   return;
      // }
    }

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

  const getSelectionRect = () => {
    const x = Math.min(selectionStart.x, selectionEnd.x);
    const y = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);
    return { x, y, width, height };
  };

  return (
    <div className="min-h-screen bg-white">
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
              const imgRect = imageRef.current.getBoundingClientRect();

              const rendered = naturalToRendered(
                { x: h.x, y: h.y, width: h.width, height: h.height },
                naturalSize.w,
                naturalSize.h,
                imgRect.width,
                imgRect.height,
              );

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
                      activeHighlight === h.id
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
              imageRef.current &&
              (() => {
                const imgRect = imageRef.current.getBoundingClientRect();

                const x = Math.min(selectionStart.x, selectionEnd.x);
                const y = Math.min(selectionStart.y, selectionEnd.y);
                const width = Math.abs(selectionEnd.x - selectionStart.x);
                const height = Math.abs(selectionEnd.y - selectionStart.y);

                const rendered = naturalToRendered(
                  { x, y, width, height },
                  naturalSize.w,
                  naturalSize.h,
                  imgRect.width,
                  imgRect.height,
                );

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

            {showCommentBox && (
              <div
                ref={commentBoxRef}
                className="comment-box absolute bg-white rounded-xl shadow-lg border-2 border-blue-600 p-4 z-50"
                style={{
                  left: `${commentBoxPosition.x}px`,
                  top: `${commentBoxPosition.y}px`,
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
                          tempCompetency.includes(num)
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
                  value={tempComment}
                  onChange={(e) => setTempComment(e.target.value)}
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
                className="bg-gray-100 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-gray-700">
                      {comp.id}
                    </span>
                  </div>

                  <Input
                    type="number"
                    min="0"
                    max="200"
                    placeholder="Informe nota"
                    value={comp.score}
                    onChange={(e) => handleScoreChange(comp.id, e.target.value)}
                    className="flex-1 bg-white border-gray-300 placeholder:text-gray-400"
                  />
                </div>

                <Textarea
                  placeholder="Adicione um comentário"
                  value={comp.comment}
                  onChange={(e) => handleCommentChange(comp.id, e.target.value)}
                  className="bg-white border-gray-300 placeholder:text-gray-400 min-h-20 resize-none"
                />
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
