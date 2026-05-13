"use client";

import { GridBackdrop } from "@/components/cad/GridBackdrop";
import { SceneCanvas } from "@/components/cad/SceneCanvas";

export function Viewport() {
  return (
    <div className="relative flex min-h-[560px] flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-[#050607]/95 shadow-glass-xl">
      <SceneCanvas />
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <GridBackdrop />
      </div>
      <div className="absolute left-7 top-7 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.35em] text-slate-200 backdrop-blur-sm">
        WEBGPU DEVICE MODE
      </div>
    </div>
  );
}
