"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, mediaUrl, type ImageSummary } from "@/lib/api";
import { formatDate, pct } from "@/lib/labels";

export default function HistorialPage() {
  const [items, setItems] = useState<ImageSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .images(50)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        No se pudo conectar con el backend: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Historial de procesamiento</h1>
        <p className="text-sm text-slate-500">{total} imágenes procesadas.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Imagen</th>
              <th className="px-4 py-2.5 font-medium">Fecha</th>
              <th className="px-4 py-2.5 font-medium">Objetos</th>
              <th className="px-4 py-2.5 font-medium">Auditoría</th>
              <th className="px-4 py-2.5 font-medium">Precisión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Sin imágenes todavía.{" "}
                  <Link href="/procesar" className="text-emerald-700 underline">
                    Procesar la primera
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              items.map((img) => (
                <tr key={img.image_id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/imagen/${img.image_id}`}
                      className="flex items-center gap-3 font-medium text-slate-800 hover:text-emerald-700"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaUrl(img.media_url)}
                        alt={img.filename}
                        className="h-9 w-12 rounded object-cover"
                      />
                      <span className="truncate">{img.filename}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDate(img.created_at)}</td>
                  <td className="px-4 py-2.5 tabular-nums text-slate-600">
                    {img.detection_count}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        img.audit_status === "reviewed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {img.audit_status === "reviewed" ? "Revisada" : "Pendiente"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-slate-600">{pct(img.accuracy)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
