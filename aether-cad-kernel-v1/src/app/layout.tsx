import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const inter = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aether Engine",
  description: "Luxury industrial CAD workspace with full-screen WebGPU-ready UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body
        className="min-h-screen bg-obsidian text-slate-100 antialiased tracking-tight"
        style={{ viewTransitionName: "aether-workspace" }}
      >
        <div className="relative min-h-screen overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
