"use client";

export function SentinelOrb() {
  return (
    <div className="pointer-events-none absolute right-8 top-8 z-20 flex items-center justify-center">
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,rgba(83,202,255,0.95),rgba(55,71,221,0.14) 46%,rgba(11,14,28,0) 72%)] shadow-sentinel before:absolute before:inset-0 before:rounded-full before:blur-3xl before:content-[''] after:absolute after:inset-4 after:rounded-full after:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45),transparent_55%)] after:opacity-80">
        <span className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/10" />
      </div>
    </div>
  );
}
