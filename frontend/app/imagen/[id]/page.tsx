"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuditCard from "@/components/AuditCard";
import DetectionOverlay from "@/components/DetectionOverlay";
import { api, exportUrl, mediaUrl, type AuditPatch, type ImageDetail } from "@/lib/api";
import { formatDate, pct } from "@/lib/labels";

export default function ImageDetailPage() {
  const params = useParams<{ id: string }>();
  const imageId = params.id;

  const [detail, setDetail] = useState<ImageDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .image(imageId)
      .then((data) => {
        setDetail(data);
        setSelectedId((current) => current ?? data.detections[0]?.id ?? null);
      })
      .catch((err: Error) => setError(err.message));
  }, [imageId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAudit = async (detectionId: string, patch: AuditPatch) => {
    setBusy(true);
    setError(null);
    try {
      await api.audit(imageId, detectionId, patch);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la auditoría.");
    } finally {
      setBusy(false);
    }
  };

  if (error && !detail) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!detail) {
    return <p className="text-sm text-slate-500">Cargando imagen…</p>;
  }

  const { metrics } = detail;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href="/historial" className="text-xs text-slate-500 hover:text-slate-800">
            ← Historial
          </Link>
          <h1 className="text-xl font-semibold">{detail.filename}</h1>
          <p className="text-xs text-slate-500">
            Procesada el {formatDate(detail.created_at)} · {detail.width}×{detail.height} px
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={exportUrl(detail.image_id, "json")}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Exportar JSON
          </a>
          <a
            href={exportUrl(detail.image_id, "csv")}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Exportar CSV
          </a>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-3">
          <DetectionOverlay
            src={mediaUrl(detail.media_url)}
            width={detail.width}
            height={detail.height}
            detections={detail.detections}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Modelo vs. auditoría humana</h2>
            <p className="mt-2 text-sm text-slate-700">
              El modelo detectó <strong>{metrics.detection_count}</strong> objetos · la auditoría
              validó <strong>{metrics.validated}</strong> · precisión de esta imagen:{" "}
              <strong>{pct(metrics.accuracy)}</strong>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Correctas {metrics.accepted} · incorrectas {metrics.rejected} · reclasificadas{" "}
              {metrics.reclassified} · eliminadas {metrics.deleted} · confianza promedio{" "}
              {pct(metrics.avg_confidence)}
            </p>
          </div>
        </div>

        <aside className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Detecciones ({detail.detections.length})
          </h2>
          {detail.detections.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
              El modelo no detectó objetos del subconjunto urbano en esta imagen. Es el resultado
              esperado con clases que COCO no incluye (por ejemplo, contenedores o residuos
              genéricos): un modelo productivo requeriría un dataset propio.
            </div>
          ) : (
            detail.detections.map((detection) => (
              <AuditCard
                key={detection.id}
                detection={detection}
                busy={busy}
                selected={detection.id === selectedId}
                onSelect={() => setSelectedId(detection.id)}
                onAudit={(patch) => handleAudit(detection.id, patch)}
              />
            ))
          )}
        </aside>
      </div>
    </div>
  );
}
