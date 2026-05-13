"use client";

import { ArrowUpRight, Layers } from "lucide-react";
import { useGlobalState } from "@/store/useGlobalState";

export function BillOfMaterials() {
  const discoveredParts = useGlobalState((state) => state.discoveredParts);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Bill of Materials</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Live CAD assets</h2>
        </div>
        <div className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-300">
          {discoveredParts.length} parts
        </div>
      </div>

      <div className="grid gap-4">
        {discoveredParts.map((part) => (
          <div key={part.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-white">{part.label}</p>
                <p className="mt-1 text-sm text-slate-400">{part.details}</p>
              </div>
              <div className="rounded-2xl bg-cyan-500/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200">
                {part.type}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
              <span>Discovery feed</span>
              <ArrowUpRight className="h-4 w-4 text-cyan-300" />
            </div>
          </div>
        ))}
      </div>
      <button className="flex w-full items-center justify-center rounded-3xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/10">
        <Layers className="mr-2 h-4 w-4" />
        Sync assembly data
      </button>
    </div>
  );
}
