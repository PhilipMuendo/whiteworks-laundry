export default function Arrow({ className, dir = "right" }: { className?: string; dir?: "right" | "down" | "up" | "up-right" | "left" }) {
  const rot = { right: 0, down: 90, up: -90, "up-right": -45, left: 180 }[dir];
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} style={{ transform: `rotate(${rot}deg)` }}>
      <path d="M3 12h17M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}
