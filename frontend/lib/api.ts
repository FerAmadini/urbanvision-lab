/** Typed client for the UrbanVision Lab backend (see docs/API_CONTRACT.md). */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Verdict = "pending" | "accepted" | "rejected" | "reclassified" | "deleted";

export interface Detection {
  id: string;
  class: string;
  category: string;
  confidence: number;
  bbox: [number, number, number, number];
  verdict: Verdict;
  corrected_class: string | null;
  comment: string | null;
  audited_at: string | null;
}

export interface ImageMetrics {
  detection_count: number;
  accepted: number;
  rejected: number;
  reclassified: number;
  deleted: number;
  avg_confidence: number | null;
  validated: number;
  accuracy: number | null;
}

export interface ImageSummary {
  image_id: string;
  filename: string;
  width: number;
  height: number;
  created_at: string;
  media_url: string;
  detection_count: number;
  audit_status: "pending" | "reviewed";
  accuracy: number | null;
}

export interface ImageDetail extends ImageSummary {
  detections: Detection[];
  metrics: ImageMetrics;
}

export interface GlobalMetrics {
  total_images: number;
  total_detections: number;
  pending_audit_images: number;
  accepted: number;
  rejected: number;
  reclassified: number;
  deleted: number;
  avg_confidence: number | null;
  accuracy: number | null;
  class_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
}

export interface AuditPatch {
  verdict: Exclude<Verdict, "pending">;
  corrected_class?: string;
  comment?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store", ...init });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: unknown } | null;
    const detail = typeof body?.detail === "string" ? body.detail : JSON.stringify(body?.detail ?? "");
    throw new Error(detail || `Error ${res.status} del backend`);
  }
  return (await res.json()) as T;
}

export const api = {
  health: () =>
    request<{ status: string; model: string; classes_filtered: number }>("/api/health"),
  metrics: () => request<GlobalMetrics>("/api/metrics"),
  images: (limit = 50, offset = 0) =>
    request<{ items: ImageSummary[]; total: number }>(
      `/api/images?limit=${limit}&offset=${offset}`,
    ),
  image: (id: string) => request<ImageDetail>(`/api/images/${id}`),
  predict: async (file: File): Promise<ImageDetail> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/api/predict`, {
      method: "POST",
      body: form,
      cache: "no-store",
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { detail?: string } | null;
      throw new Error(body?.detail ?? `Error ${res.status} del backend`);
    }
    return (await res.json()) as ImageDetail;
  },
  audit: (imageId: string, detectionId: string, patch: AuditPatch) =>
    request<Detection>(`/api/images/${imageId}/detections/${detectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }),
};

export function mediaUrl(path: string): string {
  return `${API_URL}${path}`;
}

export function exportUrl(imageId: string, format: "json" | "csv"): string {
  return `${API_URL}/api/images/${imageId}/export?format=${format}`;
}
