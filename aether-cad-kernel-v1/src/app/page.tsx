"use client";

import { motion } from "framer-motion";
import { Cpu, Layers, Sparkles, SlidersHorizontal } from "lucide-react";
import { BeamField } from "@/components/ui/BeamField";
import { BillOfMaterials } from "@/components/ui/BillOfMaterials";
import { CommandBar } from "@/components/ui/CommandBar";
import { SentinelOrb } from "@/components/ui/SentinelOrb";
import { Viewport } from "@/components/cad/Viewport";

const entrance = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020202] text-slate-100">
      <BeamField />
      <SentinelOrb />
      <div className="fixed left-0 top-0 z-30 flex h-full w-16 flex-col items-center justify-between border-r border-white/10 bg-black/20 px-3 py-6 backdrop-blur-3xl">
        <div className="space-y-4">
          {[Layers, Cpu, Sparkles].map((Icon, index) => (
            <button
              key={index}
              className="group flex h-12 w-12 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/10"
              aria-label="Workspace action"
            >
              <Icon className="h-5 w-5 transition group-hover:text-cyan-300" />
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <button className="group flex h-12 w-12 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-violet-300/40 hover:bg-white/10">
            <SlidersHorizontal className="h-5 w-5 transition group-hover:text-violet-300" />
          </button>
        </div>
      </div>

      <main className="mx-auto min-h-screen max-w-[1800px] px-6 py-6 pl-24 lg:px-10">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={entrance}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="glass-panel mb-6 rounded-[2rem] p-6"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Aether Engine</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Luxury industrial CAD workspace
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                Full-screen command-driven CAD environment with WebGPU rendering, glassmorphism controls, and high‑fidelity asset discovery.
              </p>
            </div>
            <CommandBar />
          </div>
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <motion.section
            initial="hidden"
            animate="visible"
            variants={entrance}
            transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
            className="glass-panel rounded-[2rem] p-0 shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
          >
            <Viewport />
          </motion.section>

          <motion.aside
            initial="hidden"
            animate="visible"
            variants={entrance}
            transition={{ duration: 0.55, delay: 0.16, ease: "easeOut" }}
            className="glass-panel rounded-[2rem] p-6"
          >
            <BillOfMaterials />
          </motion.aside>
        </div>
      </main>
    </div>
  );
}
