"use client";

import type { Detection } from "@/lib/api";
import { CATEGORY_COLORS, classLabel } from "@/lib/labels";

interface DetectionOverlayProps {
  src: string;
  width: number;
  height: number;
  detections: Detection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Draws bounding boxes over the image, scaled from original pixel coords. */
export default function DetectionOverlay({
  src,
  width,
  height,
  detections,
  selectedId,
  onSelect,
}: DetectionOverlayProps) {
  const visible = detections.filter((d) => d.verdict !== "deleted");

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Imagen procesada por el modelo" className="block h-auto w-full" />
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 h-full w-full">
        {visible.map((d) => {
          const [x1, y1, x2, y2] = d.bbox;
          const color = CATEGORY_COLORS[d.category] ?? CATEGORY_COLORS.other;
          const selected = d.id === selectedId;
          const label = `${classLabel(d.class)} ${Math.round(d.confidence * 100)}%`;
          const labelWidth = label.length * 9 + 12;
          const labelY = Math.max(y1 - 28, 0);
          return (
            <g key={d.id} className="cursor-pointer" onClick={() => onSelect(d.id)}>
              <rect
                x={x1}
                y={y1}
                width={Math.max(x2 - x1, 1)}
                height={Math.max(y2 - y1, 1)}
                fill="transparent"
                stroke={color}
                strokeWidth={selected ? 6 : 3}
                strokeDasharray={d.verdict === "rejected" ? "12 8" : undefined}
                opacity={d.verdict === "rejected" ? 0.55 : 1}
              />
              <rect x={x1} y={labelY} width={labelWidth} height={26} fill={color} opacity={0.92} />
              <text x={x1 + 6} y={labelY + 18} fill="#ffffff" fontSize={16} fontFamily="sans-serif">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
