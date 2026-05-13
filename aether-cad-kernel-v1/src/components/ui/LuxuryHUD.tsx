"use client";

export function LuxuryHUD({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-[2rem] border-white/10 p-6 shadow-glass-xl">
      {children}
    </div>
  );
}
