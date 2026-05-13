"use client";

import { useEffect } from "react";

export function BeamField() {
  useEffect(() => {
    const updatePosition = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty("--beam-x", `${x}%`);
      document.documentElement.style.setProperty("--beam-y", `${y}%`);
    };

    window.addEventListener("pointermove", updatePosition);
    return () => window.removeEventListener("pointermove", updatePosition);
  }, []);

  return <div className="beam-line" />;
}
