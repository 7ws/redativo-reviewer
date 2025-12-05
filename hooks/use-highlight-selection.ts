import { useState, RefObject } from "react";
import { getImageRelativeCoords } from "@/lib/imageCoords";
import Highlight from "@/types/highlight";

interface UseHighlightSelectionProps {
  imageRef: RefObject<HTMLImageElement>;
  onSelectionComplete: (x: number, y: number, width: number, height: number) => void;
}

export function useHighlightSelection({
  imageRef,
  onSelectionComplete,
}: UseHighlightSelectionProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const { x, y } = getImageRelativeCoords(e, imageRef.current);

    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !imageRef.current) return;
    const { x, y } = getImageRelativeCoords(e, imageRef.current);
    setSelectionEnd({ x, y });
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    const x = Math.min(selectionStart.x, selectionEnd.x);
    const y = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);

    if (width > 10 && height > 10) {
      onSelectionComplete(x, y, width, height);
    }
  };

  const getCurrentSelection = () => {
    if (!isSelecting) return null;

    const x = Math.min(selectionStart.x, selectionEnd.x);
    const y = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);

    return { x, y, width, height };
  };

  return {
    isSelecting,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getCurrentSelection,
  };
}
