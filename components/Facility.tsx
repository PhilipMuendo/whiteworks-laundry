"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { site } from "@/config/site";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import { pad } from "@/lib/utils";
import { RevealLines } from "./ui/Reveal";

/*
 * THIS IS WHAT SCALE LOOKS LIKE.
 * A pinned "dolly-in": a constellation of plant photographs surrounds the
 * headline; on scroll the camera pushes through the centre frame until the
 * machine hall fills the screen and the outer frames fly past the lens.
 */

// frame layout: offsets from centre and sizes in viewport units; `s` = final scale
const FRAMES = [
  { top: 0, left: 0, w: 25, h: 25, s: 4 }, // centre → fills the screen at 4×
  { top: -31, left: 6, w: 32, h: 27, s: 5 },
  { top: -9, left: -27, w: 19, h: 42, s: 6 },
  { top: 1, left: 28, w: 24, h: 26, s: 5.5 },
  { top: 29, left: 6, w: 20, h: 24, s: 6.5 },
  { top: 27, left: -22, w: 27, h: 22, s: 7.5 },
  { top: 24, left: 26, w: 15, h: 16, s: 8.5 },
  { top: -30, left: -23, w: 14, h: 15, s: 9 },
];

function Frame({ i, p }: { i: number; p: MotionValue<number> }) {
  const f = FRAMES[i];
  const img = site.facility[i];
  const scale = useTransform(p, [0.08, 0.86], [1, f.s]);
  const capOpacity = useTransform(p, [0.05, 0.25], [1, 0]);
  if (!img) return null;
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ scale }}>
      <div
        className="relative overflow-hidden"
        style={{ width: `${f.w}vw`, height: `${f.h}svh`, top: `${f.top}svh`, left: `${f.left}vw` }}
      >
        <Image src={img.src} alt={img.alt} fill sizes={i === 0 ? "100vw" : "40vw"} className="object-cover" placeholder="blur" />
        <motion.span className="t-label absolute bottom-1.5 left-2 text-bone/80" style={{ opacity: capOpacity }}>
          Fig. {pad(i + 1)}
        </motion.span>
      </div>
    </motion.div>
  );
}

export default function Facility() {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const headScale = useTransform(p, [0, 0.55], [1, 0.82]);
  const headOpacity = useTransform(p, [0.3, 0.58], [1, 0]);
  const finalOpacity = useTransform(p, [0.84, 0.95], [0, 1]);
  const finalY = useTransform(p, [0.84, 0.95], [30, 0]);
  const dim = useTransform(p, [0.6, 0.86], [0.25, 0.1]);

  if (reduce) {
    return (
      <section id="facility" aria-labelledby="facility-title" className="bg-ink py-[14vh] text-bone">
        <h2 id="facility-title" className="gutter t-display uppercase">
          This is what scale looks like.
        </h2>
        <div className="gutter mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {site.facility.map((f, i) => (
            <div key={i} className="relative aspect-[4/5] overflow-hidden">
              <Image src={f.src} alt={f.alt} fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover" placeholder="blur" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="facility" aria-labelledby="facility-title" className="relative h-[340svh] bg-ink text-bone">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {FRAMES.map((_, i) => (
          <Frame key={i} i={i} p={p} />
        ))}
        <motion.div className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: dim }} />

        <motion.div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center mix-blend-difference"
          style={{ scale: headScale, opacity: headOpacity }}
        >
          <RevealLines
            as="h2"
            className="text-center uppercase"
            lineClassName="text-[clamp(3.25rem,10.5vw,12.5rem)] font-semibold leading-[0.84] tracking-[-0.065em]"
            lines={["This is", "what", "scale", "looks like."]}
            stagger={0.1}
            amount={0.2}
          />
          <span id="facility-title" className="sr-only">
            This is what scale looks like
          </span>
        </motion.div>

        <motion.div
          className="gutter absolute inset-x-0 bottom-[var(--gutter)] z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          style={{ opacity: finalOpacity, y: finalY }}
        >
          <p className="t-heading max-w-[18ch] uppercase">Industrial capacity. Hospitality standards.</p>
          <p className="t-label max-w-[40ch] text-bone/70 md:text-right">
            Fig. 01 · {site.facility[0]?.caption}. Commercial washer-extractors running programmed cycles, load after load.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
