import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UrbanVision Lab",
  description:
    "Plataforma demo de auditoría de detecciones de residuos urbanos con visión por computadora.",
};

const NAV_ITEMS = [
  { href: "/", label: "Panel" },
  { href: "/procesar", label: "Procesar imagen" },
  { href: "/historial", label: "Historial" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tracking-tight">UrbanVision Lab</span>
              <span className="hidden text-xs text-slate-500 sm:inline">
                Auditoría de detecciones · demo técnica
              </span>
            </Link>
            <nav className="flex gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <footer className="mx-auto w-full max-w-6xl px-4 pb-8 text-xs text-slate-400">
          Demo técnica: modelo YOLO11n preentrenado en COCO (subconjunto urbano filtrado). No es
          un sistema productivo de detección de residuos.
        </footer>
      </body>
    </html>
  );
}
