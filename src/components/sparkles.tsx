const SPARKS = [
  { top: "10%", left: "6%", delay: "0s", className: "text-2xl", glyph: "✦" },
  { top: "18%", left: "88%", delay: "1.1s", className: "text-xl", glyph: "✨" },
  { top: "55%", left: "4%", delay: "0.5s", className: "text-lg", glyph: "⭐" },
  { top: "72%", left: "92%", delay: "1.7s", className: "text-2xl", glyph: "✦" },
  { top: "38%", left: "95%", delay: "0.9s", className: "text-base", glyph: "💫" },
  { top: "84%", left: "18%", delay: "2.3s", className: "text-lg", glyph: "✨" },
  { top: "88%", left: "70%", delay: "1.4s", className: "text-base", glyph: "⭐" },
];

/** Decorative floating sparkles. Pure CSS animation, no interactivity. */
export function Sparkles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className={`absolute animate-float text-amber-200/80 drop-shadow ${s.className}`}
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        >
          {s.glyph}
        </span>
      ))}
    </div>
  );
}
