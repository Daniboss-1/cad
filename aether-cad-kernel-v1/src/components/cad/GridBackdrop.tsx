export function GridBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-40">
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:56px_56px]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:56px_56px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:180px_180px] opacity-70" />
    </div>
  );
}
