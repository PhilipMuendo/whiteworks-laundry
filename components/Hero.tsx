"use client";

import { usePrefersReducedMotion } from "@/lib/useMedia";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LinenCanvas from "./LinenCanvas";
import Magnetic from "./ui/Magnetic";
import Arrow from "./ui/Arrow";
import { site } from "@/config/site";
import { useScrollTo } from "@/lib/smooth-scroll";
import { EASE_EXPO } from "@/lib/utils";
import machineHall from "@/assets/images/machine-hall.jpg";
import fabricDark from "@/assets/images/fabric-dark.jpg";

/**
 * HERO: a sheet of linen drifts through a dark plant. The headline is split
 * around it: "BEHIND" sits literally behind the cloth. On scroll the words part,
 * the camera pushes into the fabric until the sheet becomes the page itself,
 * handing over to the bone-white "Clean at scale" section with no hard edge.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const scrollTo = useScrollTo();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const leftX = useTransform(p, [0, 0.6], ["0vw", "-42vw"]);
  const rightX = useTransform(p, [0, 0.6], ["0vw", "42vw"]);
  const wordsOpacity = useTransform(p, [0.25, 0.6], [1, 0]);
  const behindScale = useTransform(p, [0, 0.6], [1, 1.5]);
  const behindOpacity = useTransform(p, [0, 0.45], [1, 0]);
  const uiOpacity = useTransform(p, (v) => 1 - Math.min(1, Math.max(0, v / 0.12)));
  const uiY = useTransform(p, (v) => -40 * Math.min(1, Math.max(0, v / 0.12)));
  const bgScale = useTransform(p, [0, 1], [1.08, 1.35]);
  const bgOpacity = useTransform(p, [0, 0.7], [0.22, 0]);
  const whiteOut = useTransform(p, [0.84, 0.99], [0, 1]);
  // bind scroll-linked UI styles only after mount so SSR and hydration markup agree
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ui = mounted ? uiOpacity : 1;

  const word = (delay: number) => ({
    initial: reduce ? false : { y: "108%" },
    animate: { y: "0%" },
    transition: { duration: 1.5, ease: EASE_EXPO, delay },
  });

  return (
    <section ref={ref} id="top" aria-labelledby="hero-title" className="relative h-[230vh] bg-ink md:h-[270vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* environment: a barely-there machine hall, pushed out of focus */}
        <motion.div className="absolute inset-0" style={{ scale: bgScale, opacity: bgOpacity }}>
          <Image src={machineHall} alt="" fill priority sizes="100vw" className="object-cover blur-[2px]" placeholder="blur" />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_45%,transparent_0%,#080808_78%)]" />

        <h1 id="hero-title" className="contents">
          {/* DOM order reads "The laundry behind your business"; z-index handles the layering */}
          {/* THE LAUNDRY: top left, above the cloth, inverting over it */}
          <motion.span
            className="absolute left-[var(--gutter)] top-[15svh] z-20 block uppercase mix-blend-difference md:top-[13svh]"
            style={{ x: leftX, opacity: wordsOpacity }}
          >
            <span className="block overflow-hidden">
              <motion.span {...word(0.15)} className="block text-[19vw] font-semibold leading-[0.82] tracking-[-0.065em] md:text-[11.2vw]">
                The <br className="md:hidden" />
                Laundry
              </motion.span>
            </span>
          </motion.span>

          {/* BEHIND: outlined, physically behind the linen */}
          <motion.span
            className="t-outline pointer-events-none absolute inset-x-0 top-1/2 z-0 block -translate-y-1/2 text-center text-[30vw] font-semibold uppercase leading-[0.8] tracking-[-0.06em] text-bone/60 md:text-[24vw]"
            style={{ scale: behindScale, opacity: behindOpacity }}
          >
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, scale: 0.92, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 2.2, ease: EASE_EXPO, delay: 0.5 }}
            >
              Behind
            </motion.span>
          </motion.span>

          {/* YOUR BUSINESS. bottom right */}
          <motion.span
            className="absolute bottom-[24svh] right-[var(--gutter)] z-20 block text-right uppercase mix-blend-difference md:bottom-[21svh]"
            style={{ x: rightX, opacity: wordsOpacity }}
          >
            <span className="block overflow-hidden">
              <motion.span {...word(0.3)} className="block text-[19vw] font-semibold leading-[0.82] tracking-[-0.065em] md:text-[11.2vw]">
                Your <br className="md:hidden" />
                Business<span className="text-signal">.</span>
              </motion.span>
            </span>
          </motion.span>
        </h1>

        <LinenCanvas progress={p} fallback={fabricDark} className="absolute inset-0 z-10 h-full w-full" />

        {/* descriptor */}
        <motion.p
          className="t-label absolute left-[var(--gutter)] top-[calc(var(--gutter)+3.25rem)] z-30 hidden text-bone/60 md:block"
          style={{ opacity: ui }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          Commercial laundry <span className="text-signal">/</span> Textile care <span className="text-signal">/</span> Pickup &amp; delivery
        </motion.p>

        {/* supporting copy + CTAs */}
        <motion.div
          className="absolute bottom-[var(--gutter)] left-[var(--gutter)] right-[var(--gutter)] z-30 flex flex-col gap-5 md:right-auto md:max-w-[min(30rem,40vw)]"
          style={{ opacity: ui, y: mounted ? uiY : 0 }}
        >
          <motion.p
            className="t-lead max-w-[32ch] text-bone/85"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1.2, ease: EASE_EXPO }}
          >
            {site.hero.support}
          </motion.p>
          <motion.div
            className="flex items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 1.2, ease: EASE_EXPO }}
          >
            <Magnetic>
              <a
                href="#quote"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#quote");
                }}
                className="group relative inline-flex h-12 items-center gap-3 overflow-hidden bg-bone px-5 text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-ink"
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-signal transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-y-100" />
                <span className="relative">Request a quote</span>
                <Arrow className="relative h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </a>
            </Magnetic>
            <a
              href="#scale"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#scale");
              }}
              className="group inline-flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-bone"
            >
              <span className="relative">
                Explore
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-bone transition-transform duration-500 group-hover:scale-x-0" />
              </span>
              <Arrow dir="down" className="h-4 w-4 transition-transform duration-500 group-hover:translate-y-1" />
            </a>
          </motion.div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          className="absolute bottom-[var(--gutter)] right-[var(--gutter)] z-30 hidden items-end gap-3 md:flex"
          style={{ opacity: ui }}
          aria-hidden="true"
        >
          <span className="t-label text-bone/60">Scroll</span>
          <span className="relative block h-14 w-px overflow-hidden bg-bone/20">
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-bone"
              animate={reduce ? undefined : { y: ["-100%", "200%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
            />
          </span>
        </motion.div>

        {/* the linen becomes the page */}
        <motion.div className="pointer-events-none absolute inset-0 z-40 bg-bone" style={{ opacity: whiteOut }} />
      </div>
    </section>
  );
}
