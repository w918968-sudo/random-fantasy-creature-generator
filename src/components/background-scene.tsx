/**
 * Fixed, full-screen backdrop rendered behind all page content: a vivid sky, a
 * glowing sun with slowly rotating rays, drifting clouds, and layered hill
 * silhouettes. Pure CSS/SVG — server-compatible (no client hooks).
 */
export function BackgroundScene() {
  return (
    <div
      aria-hidden
      className="bg-scene pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Sun rays */}
      <div
        className="sun-rays absolute rounded-full"
        style={{
          top: "-16rem",
          right: "-14rem",
          width: "56rem",
          height: "56rem",
          background:
            "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.14) 0deg 10deg, transparent 10deg 22deg)",
          WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 68%)",
          maskImage: "radial-gradient(circle, #000 0%, transparent 68%)",
        }}
      />

      {/* Sun orb */}
      <div
        className="sun-orb absolute rounded-full"
        style={{
          top: "-10rem",
          right: "-8rem",
          width: "34rem",
          height: "34rem",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, var(--sun) 42%, transparent 72%)",
        }}
      />

      {/* Drifting clouds */}
      <div
        className="cloud absolute rounded-full"
        style={{
          top: "10%",
          left: "-8%",
          width: "36rem",
          height: "15rem",
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.62), transparent 70%)",
        }}
      />
      <div
        className="cloud absolute rounded-full"
        style={{
          top: "22%",
          left: "30%",
          width: "26rem",
          height: "11rem",
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.45), transparent 70%)",
          animationDelay: "-11s",
        }}
      />
      <div
        className="cloud absolute rounded-full"
        style={{
          top: "6%",
          left: "60%",
          width: "30rem",
          height: "13rem",
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.5), transparent 70%)",
          animationDelay: "-20s",
        }}
      />

      {/* Layered hill silhouettes */}
      <svg
        className="absolute bottom-0 left-0 h-[44vh] w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="var(--hill)"
          fillOpacity="0.12"
          d="M0 170 L170 90 L320 160 L470 70 L620 160 L790 80 L950 160 L1110 60 L1260 150 L1440 90 L1440 320 L0 320 Z"
        />
        <path
          fill="var(--hill)"
          fillOpacity="0.2"
          d="M0 210 C230 150 400 230 630 180 C830 140 1010 230 1230 190 C1330 170 1400 200 1440 180 L1440 320 L0 320 Z"
        />
        <path
          fill="var(--hill)"
          fillOpacity="0.3"
          d="M0 250 C250 210 380 265 580 235 C760 210 920 265 1130 235 C1260 218 1380 245 1440 225 L1440 320 L0 320 Z"
        />
      </svg>
    </div>
  );
}
