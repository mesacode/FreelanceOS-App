export default function BackgroundEffect() {
  return (
    <>
      {/* Gradient Orbs */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute -left-48 -top-48 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, var(--accent-from) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite"
          }}
        />
        <div
          className="absolute -right-32 -top-32 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{
            background: "radial-gradient(circle, var(--accent-to) 0%, transparent 70%)",
            animation: "float 10s ease-in-out infinite reverse"
          }}
        />
        <div
          className="absolute -bottom-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full opacity-10 blur-3xl"
          style={{
            background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            animation: "float 12s ease-in-out infinite"
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          zIndex: 0
        }}
      />

      {/* Noise Texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          zIndex: 0
        }}
      />
    </>
  );
}
