import { create } from "zustand";

export type DiscoveredPart = {
  id: string;
  type: string;
  label: string;
  details: string;
};

interface GlobalState {
  command: string;
  discoveredParts: DiscoveredPart[];
  setCommand: (command: string) => void;
  setDiscoveredParts: (parts: DiscoveredPart[]) => void;
}

export const useGlobalState = create<GlobalState>((set) => ({
  command: "",
  discoveredParts: [
    { id: "part-01", type: "cylinder", label: "Titanium Core", details: "Ø 14mm × 42mm" },
    { id: "part-02", type: "plate", label: "Ceramic Shell", details: "120 × 80 × 5mm" },
  ],
  setCommand: (command) => set({ command }),
  setDiscoveredParts: (discoveredParts) => set({ discoveredParts }),
}));
