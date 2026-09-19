"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import { api, mediaUrl, type GlobalMetrics, type ImageSummary } from "@/lib/api";
import { CATEGORY_COLORS, categoryLabel, classLabel, formatDate, pct } from "@/lib/labels";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [recent, setRecent] = useState<ImageSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.metrics(), api.images(5)])
      .then(([m, imgs]) => {
        setMetrics(m);
        setRecent(imgs.items);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        No se pudo conectar con el backend: {error}. Verificá que esté corriendo en
        http://localhost:8000 (ver backend/README.md).
      </div>
    );
  }

  if (!metrics) {
    return <p className="text-sm text-slate-500">Cargando métricas…</p>;
  }

  const audited = metrics.accepted + metrics.rejected + metrics.reclassified + metrics.deleted;
  const categories = Object.entries(metrics.category_distribution);
  const maxCategory = Math.max(1, ...categories.map(([, n]) => n));
  const topClasses = Object.entries(metrics.class_distribution).slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Panel de auditoría</h1>
          <p className="text-sm text-slate-500">
            Estado del procesamiento de imágenes y validación humana.
          </p>
        </div>
        <Link
          href="/procesar"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Procesar imagen
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Imágenes procesadas" value={String(metrics.total_images)} />
        <StatCard label="Detecciones" value={String(metrics.total_detections)} />
        <StatCard
          label="Pendientes de auditoría"
          value={String(metrics.pending_audit_images)}
          hint="imágenes con detecciones sin revisar"
        />
        <StatCard label="Confianza promedio" value={pct(metrics.avg_confidence)} hint="del modelo" />
        <StatCard
          label="Precisión validada"
          value={pct(metrics.accuracy)}
          hint={`${metrics.accepted + metrics.reclassified} de ${audited} detecciones auditadas`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Distribución por categoría</h2>
          <div className="mt-3 space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-slate-500">Sin datos todavía.</p>
            ) : (
              categories.map(([category, count]) => (
                <div key={category} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-slate-600">{categoryLabel(category)}</span>
                  <div className="h-3 flex-1 rounded bg-slate-100">
                    <div
                      className="h-3 rounded"
                      style={{
                        width: `${(count / maxCategory) * 100}%`,
                        backgroundColor: CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs tabular-nums text-slate-600">{count}</span>
                </div>
              ))
            )}
          </div>
          <h2 className="mt-5 text-sm font-semibold text-slate-900">Clases más frecuentes</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {topClasses.length === 0 ? (
              <p className="text-sm text-slate-500">Sin datos todavía.</p>
            ) : (
              topClasses.map(([cls, count]) => (
                <span
                  key={cls}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                >
                  {classLabel(cls)} · {count}
                </span>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Últimas imágenes</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {recent.length === 0 ? (
              <li className="py-2 text-sm text-slate-500">
                Todavía no hay imágenes procesadas.{" "}
                <Link href="/procesar" className="text-emerald-700 underline">
                  Procesá la primera
                </Link>
                .
              </li>
            ) : (
              recent.map((img) => (
                <li key={img.image_id} className="flex items-center gap-3 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaUrl(img.media_url)}
                    alt={img.filename}
                    className="h-10 w-14 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/imagen/${img.image_id}`}
                      className="block truncate text-sm font-medium text-slate-800 hover:text-emerald-700"
                    >
                      {img.filename}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {formatDate(img.created_at)} · {img.detection_count} detecciones
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      img.audit_status === "reviewed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {img.audit_status === "reviewed" ? "Revisada" : "Pendiente"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
