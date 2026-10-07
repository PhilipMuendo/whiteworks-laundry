"use client";

import { usePrefersReducedMotion } from "@/lib/useMedia";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { site, type Industry } from "@/config/site";
import { EASE_EXPO, pad } from "@/lib/utils";

const N = site.industries.length;

function Plate({ industry, index, p, enter }: { industry: Industry; index: number; p: MotionValue<number>; enter: MotionValue<number> }) {
  const reduce = usePrefersReducedMotion();
  // window in which this plate opens (starts late in the previous chapter)
  // all scroll offsets must stay within [0, 1] (Motion may hand them to a native ScrollTimeline)
  const c = (v: number) => Math.min(1, Math.max(0, v));
  const a = c((index - 0.32) / N);
  const b = c((index + 0.06) / N);
  const end = Math.max(b + 0.001, c((index + 1.2) / N));
  const src = index === 0 ? enter : p;
  const range = index === 0 ? [0, 1] : [a, b];

  // aperture: closed → pops to a window → opens to full bleed
  const [r0, r1] = range;
  const clip = useTransform(
    src,
    [r0, r0 + (r1 - r0) * 0.12, r1],
    reduce
      ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
      : ["inset(50% 50% 50% 50%)", "inset(36% 32% 36% 32%)", "inset(0% 0% 0% 0%)"],
  );
  const scale = useTransform(
    p,
    index === 0 ? [0, 0.001, end] : [a, b, end],
    index === 0 ? [1.04, 1.04, 1.16] : [1.35, 1.04, 1.16],
  );
  const shadeA = c((index + 0.68) / N);
  const shade = useTransform(p, [shadeA, Math.max(shadeA + 0.001, c((index + 1.06) / N))], [0, index === N - 1 ? 0 : 0.75]);

  return (
    <motion.div className="absolute inset-0 overflow-hidden will-change-[clip-path]" style={{ clipPath: clip, zIndex: index }}>
      <motion.div className="absolute inset-0" style={{ scale: reduce ? 1 : scale }}>
        <Image src={industry.image.src} alt={industry.image.alt} fill sizes="100vw" className="object-cover" placeholder="blur" />
      </motion.div>
      <motion.div className="absolute inset-0 bg-ink" style={{ opacity: shade }} />
    </motion.div>
  );
}

export default function Industries() {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);

  useMotionValueEvent(p, "change", (v) => {
    const next = Math.min(N - 1, Math.max(0, Math.floor(v * N + 0.12)));
    if (next !== active) {
      setDir(next > active ? 1 : -1);
      setActive(next);
    }
  });

  const bar = useTransform(p, [0, 1], [0, 1]);
  const ind = site.industries[active];

  return (
    <section
      ref={ref}
      id="industries"
      aria-labelledby="industries-title"
      className="relative bg-ink text-bone"
      style={{ height: `${N * 100}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {site.industries.map((it, i) => (
          <Plate key={it.id} industry={it} index={i} p={p} enter={enter} />
        ))}
        <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(to_top,rgba(8,8,8,0.92)_0%,rgba(8,8,8,0.35)_38%,rgba(8,8,8,0.15)_60%,rgba(8,8,8,0.6)_100%)]" />

        {/* header row */}
        <div className="gutter absolute inset-x-0 top-[calc(var(--gutter)+4.5rem)] z-30 flex items-start justify-between">
          <h2 id="industries-title" className="t-label text-bone/70">
            Who we serve
          </h2>
          <p className="t-label tabular-nums text-bone/70" aria-hidden="true">
            <span className="text-bone">{pad(active + 1)}</span> / {pad(N)}
          </p>
        </div>

        {/* chapter index (desktop) */}
        <ol className="gutter absolute left-0 top-1/2 z-30 hidden -translate-y-1/2 space-y-1.5 md:block" aria-label="Industries">
          {site.industries.map((it, i) => (
            <li key={it.id} className="t-label flex items-center gap-3">
              <span
                className="block h-px bg-current transition-all duration-700 ease-[var(--ease-expo)]"
                style={{ width: i === active ? 32 : 10, opacity: i === active ? 1 : 0.4 }}
              />
              <span className={`transition-colors duration-500 ${i === active ? "text-bone" : "text-bone/40"}`}>{it.name}</span>
            </li>
          ))}
        </ol>

        {/* the name */}
        <div className="gutter absolute inset-x-0 bottom-[calc(var(--gutter)+2.5rem)] z-30 md:bottom-[calc(var(--gutter)+1rem)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={ind.id}
              className="mb-5 max-w-[26rem] md:mb-6 md:ml-auto md:text-right"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: EASE_EXPO }}
            >
              <p className="t-lead text-bone">{ind.line}</p>
              <p className="t-label mt-3 text-bone/55">{ind.items.join("  ·  ")}</p>
            </motion.div>
          </AnimatePresence>
          <p className="relative overflow-hidden uppercase" aria-live="polite">
            <span className="sr-only">{ind.name}</span>
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.span
                key={ind.id}
                aria-hidden="true"
                className="flex font-semibold leading-[0.84] tracking-[-0.065em]"
                // size each name to fit the measure: long words get smaller, short words get huge
                style={{ fontSize: `min(16vw, ${(93 / (ind.name.length * 0.64)).toFixed(2)}vw)` }}
              >
                {/* whole word, not per-letter spans: keeps the font's kerning intact at display size */}
                <motion.span
                  className="inline-block"
                  custom={dir}
                  variants={{
                    initial: (d: number) => ({ y: reduce ? 0 : `${d * 100}%`, opacity: reduce ? 0 : 1 }),
                    animate: { y: "0%", opacity: 1 },
                    exit: (d: number) => ({ y: reduce ? 0 : `${d * -100}%`, opacity: reduce ? 0 : 1 }),
                  }}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.95, ease: EASE_EXPO }}
                >
                  {ind.name}
                </motion.span>
              </motion.span>
            </AnimatePresence>
          </p>
        </div>

        {/* progress */}
        <div className="gutter absolute inset-x-0 bottom-[var(--gutter)] z-30 md:hidden">
          <div className="h-px w-full bg-bone/20">
            <motion.div className="h-px origin-left bg-bone" style={{ scaleX: bar }} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-30 hidden h-[3px] md:block">
          <motion.div className="h-full origin-left bg-signal" style={{ scaleX: bar }} />
        </div>
      </div>
    </section>
  );
}
