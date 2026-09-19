/** Spanish display labels for COCO classes, categories and audit verdicts. */

export const CLASS_LABELS_ES: Record<string, string> = {
  bottle: "Botella",
  "wine glass": "Copa",
  cup: "Vaso",
  fork: "Tenedor",
  knife: "Cuchillo",
  spoon: "Cuchara",
  bowl: "Bowl",
  backpack: "Mochila",
  handbag: "Bolso",
  suitcase: "Valija",
  umbrella: "Paraguas",
  scissors: "Tijera",
  vase: "Florero",
  "teddy bear": "Peluche",
  toothbrush: "Cepillo dental",
  "hair drier": "Secador",
  book: "Libro",
  apple: "Manzana",
  orange: "Naranja",
  banana: "Banana",
  sandwich: "Sándwich",
  pizza: "Pizza",
  cake: "Torta",
  donut: "Dona",
  chair: "Silla",
  couch: "Sillón",
  bed: "Cama",
  "dining table": "Mesa",
  toilet: "Inodoro",
  tv: "TV",
  refrigerator: "Heladera",
  microwave: "Microondas",
  oven: "Horno",
  toaster: "Tostadora",
  sink: "Pileta",
  bicycle: "Bicicleta",
  "potted plant": "Planta",
};

export const CATEGORY_LABELS_ES: Record<string, string> = {
  recyclable: "Reciclable",
  organic: "Orgánico",
  bulky: "Voluminoso",
  other: "Otro",
};

export const VERDICT_LABELS_ES: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Correcta",
  rejected: "Incorrecta",
  reclassified: "Reclasificada",
  deleted: "Eliminada",
};

export const CATEGORY_COLORS: Record<string, string> = {
  recyclable: "#0284c7",
  organic: "#d97706",
  bulky: "#7c3aed",
  other: "#64748b",
};

export const VERDICT_STYLES: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  reclassified: "bg-amber-100 text-amber-800",
  deleted: "bg-slate-200 text-slate-500 line-through",
};

export function classLabel(name: string): string {
  return CLASS_LABELS_ES[name] ?? name;
}

export function categoryLabel(name: string): string {
  return CATEGORY_LABELS_ES[name] ?? name;
}

export function verdictLabel(name: string): string {
  return VERDICT_LABELS_ES[name] ?? name;
}

export function pct(value: number | null): string {
  return value === null ? "—" : `${Math.round(value * 100)} %`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
