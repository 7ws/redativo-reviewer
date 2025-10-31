import Highlight from "@/types/highlight";

export function getImageRelativeCoords(
  e: MouseEvent | React.MouseEvent,
  img: HTMLImageElement,
) {
  const rect = img.getBoundingClientRect();

  const renderedW = rect.width;
  const renderedH = rect.height;
  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;

  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  // clamp to image
  const x = Math.max(0, Math.min(offsetX, renderedW));
  const y = Math.max(0, Math.min(offsetY, renderedH));

  // convert viewport coords → NATURAL IMAGE COORDINATES
  return {
    x: Math.round((x / renderedW) * naturalW),
    y: Math.round((y / renderedH) * naturalH),
  };
}

export function naturalToPercent(
  highlight: Highlight,
  naturalW: number,
  naturalH: number,
) {
  return {
    xPct: (highlight.x / naturalW) * 100,
    yPct: (highlight.y / naturalH) * 100,
    wPct: (highlight.width / naturalW) * 100,
    hPct: (highlight.height / naturalH) * 100,
  };
}

export function naturalToRendered(n, naturalW, naturalH, renderedW, renderedH) {
  return {
    left: (n.x / naturalW) * renderedW,
    top: (n.y / naturalH) * renderedH,
    width: (n.width / naturalW) * renderedW,
    height: (n.height / naturalH) * renderedH,
  };
}
