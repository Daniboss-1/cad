"use client";

import { useState, type FormEvent } from "react";
import { Command, Keyboard, Send } from "lucide-react";
import { useGlobalState } from "@/store/useGlobalState";

export function CommandBar() {
  const command = useGlobalState((state) => state.command);
  const setCommand = useGlobalState((state) => state.setCommand);
  const [input, setInput] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    setCommand(input.trim());
    setInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-pill mx-auto flex w-full max-w-4xl flex-col gap-4 px-5 py-3 text-sm tracking-tight text-slate-100 shadow-glass-xl sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <Command className="h-5 w-5 text-cyan-200" />
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Command Nexus</p>
          <p className="mt-1 text-sm text-slate-100/80">{command || "Type CAD actions, e.g. union titanium core with ceramic shell."}</p>
        </div>
      </div>
      <div className="flex flex-1 items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type a natural language CAD command..."
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-100 transition hover:bg-cyan-500/25"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-[0.75rem] uppercase tracking-[0.22em] text-slate-300">
        <Keyboard className="h-4 w-4" /> Command-K
      </div>
    </form>
  );
}
