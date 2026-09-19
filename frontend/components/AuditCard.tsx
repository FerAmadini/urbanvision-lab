"use client";

import { useState } from "react";
import type { AuditPatch, Detection } from "@/lib/api";
import {
  CLASS_LABELS_ES,
  VERDICT_STYLES,
  categoryLabel,
  classLabel,
  verdictLabel,
} from "@/lib/labels";

interface AuditCardProps {
  detection: Detection;
  busy: boolean;
  selected: boolean;
  onSelect: () => void;
  onAudit: (patch: AuditPatch) => void;
}

/** Human-in-the-loop panel for a single detection. */
export default function AuditCard({ detection, busy, selected, onSelect, onAudit }: AuditCardProps) {
  const [reclassTarget, setReclassTarget] = useState("");
  const [comment, setComment] = useState(detection.comment ?? "");
  const [showReclass, setShowReclass] = useState(false);

  const effectiveClass = detection.corrected_class ?? detection.class;

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition ${
        selected ? "border-emerald-500 ring-1 ring-emerald-500" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {classLabel(effectiveClass)}
            {detection.verdict === "reclassified" ? (
              <span className="ml-1 text-xs font-normal text-slate-500">
                (detectada como {classLabel(detection.class)})
              </span>
            ) : null}
          </p>
          <p className="text-xs text-slate-500">
            {categoryLabel(detection.category)} · confianza {Math.round(detection.confidence * 100)} %
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${VERDICT_STYLES[detection.verdict]}`}
        >
          {verdictLabel(detection.verdict)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            onAudit({ verdict: "accepted", comment: comment || undefined });
          }}
          className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Correcta
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            onAudit({ verdict: "rejected", comment: comment || undefined });
          }}
          className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
        >
          Incorrecta
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            setShowReclass((v) => !v);
          }}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cambiar clase
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            onAudit({ verdict: "deleted", comment: comment || undefined });
          }}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
        >
          Eliminar
        </button>
      </div>

      {showReclass ? (
        <div className="mt-2 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <select
            value={reclassTarget}
            onChange={(e) => setReclassTarget(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
          >
            <option value="">Nueva clase…</option>
            {Object.entries(CLASS_LABELS_ES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy || !reclassTarget}
            onClick={() => {
              onAudit({ verdict: "reclassified", corrected_class: reclassTarget, comment: comment || undefined });
              setShowReclass(false);
            }}
            className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-900 disabled:opacity-50"
          >
            Aplicar
          </button>
        </div>
      ) : null}

      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        placeholder="Comentario de auditoría (opcional)"
        className="mt-2 w-full rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
      />
    </div>
  );
}
