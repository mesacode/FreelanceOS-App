type LogoProps = {
  size?: number;
};

export default function Logo({ size = 40 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M20 2L35 20L20 38L5 20L20 2Z"
        fill="url(#freelanceos-logo-outer)"
        style={{ filter: "drop-shadow(0 0 12px rgba(124, 58, 237, 0.5))" }}
      />
      <path d="M20 10L28 20L20 30L12 20L20 10Z" fill="url(#freelanceos-logo-inner)" />
      <circle
        cx="20"
        cy="20"
        r="3"
        fill="white"
        style={{ filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))" }}
      />
      <defs>
        <linearGradient id="freelanceos-logo-outer" x1="5" y1="2" x2="35" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="freelanceos-logo-inner" x1="12" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
