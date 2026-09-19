"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ProcesarPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = (selected: File | undefined | null) => {
    setError(null);
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (jpg, png o webp).");
      return;
    }
    setFile(selected);
  };

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const result = await api.predict(file);
      router.push(`/imagen/${result.image_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la imagen.");
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Procesar imagen</h1>
        <p className="text-sm text-slate-500">
          Subí una fotografía de calle, residuos o materiales. El modelo YOLO11n detectará los
          objetos del subconjunto urbano y podrás auditar cada detección.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition ${
          dragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-white hover:border-emerald-400"
        }`}
      >
        <p className="text-sm font-medium text-slate-700">
          Arrastrá una imagen acá, o hacé clic para seleccionarla
        </p>
        <p className="mt-1 text-xs text-slate-500">JPG, PNG o WebP · hasta 20 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>

      {file ? (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
          <p className="truncate text-sm text-slate-700">
            {file.name} <span className="text-xs text-slate-400">({Math.round(file.size / 1024)} KB)</span>
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={uploading}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {uploading ? "Procesando…" : "Procesar"}
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <p className="text-xs text-slate-400">
        Nota: el modelo está preentrenado en COCO, por lo que reconoce clases como botellas,
        vasos, muebles y bicicletas. Los residuos genéricos (bolsas, cartón, latas) no forman
        parte de esas clases: esa limitación está documentada a propósito.
      </p>
    </div>
  );
}
