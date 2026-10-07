"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";
import LinenCanvas from "./LinenCanvas";
import Magnetic from "./ui/Magnetic";
import Arrow from "./ui/Arrow";
import { useScrollTo } from "@/lib/smooth-scroll";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import sheetsBw from "@/assets/images/sheets-bw.jpg";

/*
 * YOU RUN THE BUSINESS. WE'LL RUN THE LAUNDRY.
 * The page closes where it opened: on a sheet of linen, now at rest.
 * Two statements hand over to each other on scroll, then one action remains.
 */

function Line({ p, range, children, className, still }: { p: MotionValue<number>; range: [number, number]; children: ReactNode; className?: string; still?: boolean }) {
  const y = useTransform(p, range, ["105%", "0%"]);
  return (
    <span className={`block overflow-hidden pb-[0.05em] ${className ?? ""}`}>
      <motion.span className="block will-change-transform" style={{ y: still ? "0%" : y }}>
        {children}
      </motion.span>
    </span>
  );
}

export default function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const scrollTo = useScrollTo();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const first = useTransform(p, [0.42, 0.62], [1, 0.22]);
  const firstY = useTransform(p, [0.42, 0.7], ["0vh", "-6vh"]);
  const ctaOpacity = useTransform(p, [0.72, 0.86], [0, 1]);
  const ctaY = useTransform(p, [0.72, 0.86], [30, 0]);
  const clothOpacity = useTransform(p, [0, 0.25], [0.35, 1]);
  const still = reduce ? 1 : undefined;

  return (
    <section ref={ref} id="final" aria-labelledby="final-title" className="relative h-[260svh] bg-ink text-bone">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-x-0 bottom-[-12svh] top-[30svh]" style={{ opacity: still ?? clothOpacity }}>
          <LinenCanvas variant="rest" fallback={sheetsBw} className="absolute inset-0 h-full w-full" />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#080808_0%,rgba(8,8,8,0.55)_40%,rgba(8,8,8,0)_70%)]" />

        <h2 id="final-title" className="gutter relative z-10 flex h-full flex-col justify-between pb-[17svh] pt-[14svh] uppercase md:pb-[15svh]">
          <motion.span className="block mix-blend-difference" style={{ opacity: still ?? first, y: still ? 0 : firstY }}>
            <Line p={p} range={[0.02, 0.2]} still={reduce} className="t-title">
              You run
            </Line>
            <Line p={p} range={[0.06, 0.24]} still={reduce} className="t-title">
              the business.
            </Line>
          </motion.span>
          <span className="block self-end text-right mix-blend-difference">
            <Line p={p} range={[0.36, 0.52]} still={reduce} className="text-[clamp(3.4rem,10.4vw,12.5rem)] font-semibold leading-[0.82] tracking-[-0.065em]">
              We&apos;ll
            </Line>
            <Line p={p} range={[0.42, 0.58]} still={reduce} className="text-[clamp(3.4rem,10.4vw,12.5rem)] font-semibold leading-[0.82] tracking-[-0.065em]">
              run the
            </Line>
            <Line p={p} range={[0.48, 0.64]} still={reduce} className="text-[clamp(3.4rem,10.4vw,12.5rem)] font-semibold leading-[0.82] tracking-[-0.065em]">
              laundry<span className="text-signal">.</span>
            </Line>
          </span>
        </h2>

        <motion.div
          className="gutter absolute inset-x-0 bottom-[var(--gutter)] z-20 flex items-end justify-between"
          style={{ opacity: still ?? ctaOpacity, y: still ? 0 : ctaY }}
        >
          <p className="t-label hidden max-w-[30ch] text-bone/60 md:block">Tell us what you run. We&apos;ll take it from there.</p>
          <Magnetic strength={0.25}>
            <a
              href="#quote"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#quote");
              }}
              className="group relative inline-flex items-center gap-4 overflow-hidden bg-bone px-6 py-5 text-[clamp(1rem,1.6vw,1.5rem)] font-semibold uppercase tracking-[-0.01em] text-ink md:px-9 md:py-7"
            >
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-signal transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-y-100" />
              <span className="relative">Request a quote</span>
              <Arrow className="relative h-5 w-5 transition-transform duration-500 group-hover:translate-x-1.5" />
            </a>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
