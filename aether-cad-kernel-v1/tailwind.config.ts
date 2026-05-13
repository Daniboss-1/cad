import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#020202",
        "glass-ghost": "rgba(255,255,255,0.08)",
        "beam-cyan": "#64fff6",
        "beam-violet": "#b992ff",
      },
      boxShadow: {
        "glass-xl": "0 40px 120px rgba(0, 0, 0, 0.45)",
        sentinel: "0 0 80px rgba(145, 187, 255, 0.22)",
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "48px",
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        ".glass-panel": {
          backgroundColor: "rgba(13, 17, 22, 0.76)",
          backdropFilter: "blur(28px)",
          "-webkit-backdrop-filter": "blur(28px)",
          boxShadow: "0 40px 120px rgba(0, 0, 0, 0.48)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
        ".glass-pill": {
          padding: "0.85rem 1.5rem",
          borderRadius: "9999px",
          backgroundColor: "rgba(255, 255, 255, 0.06)",
          boxShadow: "0 28px 80px rgba(0, 0, 0, 0.22)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
        },
        ".beam-line": {
          position: "absolute",
          pointerEvents: "none",
          inset: "0",
          backgroundImage:
            "radial-gradient(circle at var(--beam-x, 50%) var(--beam-y, 50%), rgba(100,255,246,0.14) 0%, transparent 24%), radial-gradient(circle at calc(var(--beam-x, 50%) + 12%) calc(var(--beam-y, 50%) + 4%), rgba(185,146,255,0.12) 0%, transparent 16%)",
          opacity: "0.22",
          mixBlendMode: "screen",
        },
      });
    },
  ],
} satisfies Config;
