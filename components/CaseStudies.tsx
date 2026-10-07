"use client";

import { motion, useInView, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { site, hasPlaceholderCases, type CaseStudy } from "@/config/site";
import { EASE_EXPO, pad } from "@/lib/utils";
import { RevealLines } from "./ui/Reveal";

/*
 * CASE STUDIES as editorial spreads. Each spread pins to the viewport; the
 * next one slides over it while the previous recedes into the dark.
 */

function Spread({ c, i, total, p }: { c: CaseStudy; i: number; total: number; p: MotionValue<number> }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  // 0 → 1 while the next spread slides over this one (driven by the parent, since sticky
  // elements report unreliable offsets)
  const seg = Math.max(1, total - 1);
  const from = Math.min(i / seg, 0.999);
  const covered = useTransform(p, [from, Math.min(1, Math.max(from + 0.001, (i + 1) / seg))], [0, 1]);
  const scale = useTransform(covered, [0, 1], [1, 0.9]);
  const shade = useTransform(covered, [0, 1], [0, 0.7]);
  const imgScale = useTransform(covered, [0, 1], [1, 1.12]);
  const last = i === total - 1;

  return (
    <article
      ref={ref}
      aria-labelledby={`case-${c.id}`}
      className="relative bg-ink md:sticky md:top-0 md:h-[100svh]"
    >
      <motion.div className="relative h-full origin-top border-t border-bone/15" style={{ scale: last ? 1 : scale }}>
        <div className="gutter grid h-full grid-cols-1 gap-8 py-[10vh] md:grid-cols-12 md:gap-6 md:py-[9vh]">
          {/* text column */}
          <div className="flex flex-col md:col-span-5">
            <p className="t-label text-bone/50">
              Case {pad(i + 1)} / {pad(total)}
            </p>
            <h3 id={`case-${c.id}`} className="mt-3 uppercase">
              <span
                className="block font-semibold leading-[0.82] tracking-[-0.065em]"
                // fit the sector name to the column: short words go huge, long words step down
                style={{ fontSize: `min(8.6vw, ${(36 / (c.sector.length * 0.62)).toFixed(2)}vw, 10rem)` }}
              >
                {c.sector}
              </span>
            </h3>
            <p className="t-label mt-4 text-bone/55">
              {c.client}
              {c.placeholder && <span className="ml-3 text-signal">Illustrative · placeholder</span>}
            </p>

            <p className="mt-6 max-w-[44ch] text-[0.98rem] leading-snug text-bone/80">{c.summary}</p>

            {c.quote && (
              <figure className="mt-6 border-l border-signal pl-5">
                <blockquote className="text-[clamp(1rem,1.25vw,1.25rem)] leading-snug tracking-[-0.015em] text-bone">&ldquo;{c.quote.text}&rdquo;</blockquote>
                <figcaption className="t-label mt-3 text-bone/50">
                  {c.quote.author}, {c.quote.role}
                </figcaption>
              </figure>
            )}

            <dl className="mt-10 grid grid-cols-3 gap-4 md:mt-auto md:pt-8">
              {c.metrics.map((m, k) => (
                <div key={m.label} className="border-t border-bone/20 pt-3">
                  <dt className="sr-only">{m.label}</dt>
                  <dd>
                    <span className="block overflow-hidden">
                      <motion.span
                        className="block text-[clamp(1.75rem,3.4vw,3.75rem)] font-semibold leading-none tracking-[-0.05em]"
                        initial={{ y: "100%" }}
                        animate={inView ? { y: "0%" } : undefined}
                        transition={{ duration: 1.1, ease: EASE_EXPO, delay: 0.25 + k * 0.1 }}
                      >
                        {m.value}
                      </motion.span>
                    </span>
                    <span aria-hidden="true" className="t-label mt-2 block text-bone/55">
                      {m.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* image column */}
          <motion.div
            className="relative min-h-[46svh] overflow-hidden md:col-span-7 md:col-start-6 md:min-h-0"
            initial={{ clipPath: "inset(12% 0% 12% 18%)" }}
            animate={inView ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
            transition={{ duration: 1.5, ease: EASE_EXPO }}
          >
            <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
              <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width:768px) 58vw, 100vw" className="object-cover" placeholder="blur" />
            </motion.div>
            <span aria-hidden="true" className="t-outline absolute bottom-[-0.12em] right-3 text-[clamp(5rem,13vw,15rem)] font-semibold leading-none tracking-[-0.06em] text-bone/70">
              {pad(i + 1)}
            </span>
          </motion.div>
        </div>
        <motion.div className="pointer-events-none absolute inset-0 hidden bg-ink md:block" style={{ opacity: last ? 0 : shade }} />
      </motion.div>
    </article>
  );
}

export default function CaseStudies() {
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] });
  return (
    <section id="cases" aria-labelledby="cases-title" className="relative bg-ink text-bone">
      <div className="gutter grid grid-cols-1 gap-8 pb-[8vh] pt-[16vh] md:grid-cols-12 md:gap-6">
        <RevealLines
          as="h2"
          className="uppercase md:col-span-9"
          lineClassName="text-[clamp(3rem,8.2vw,10rem)] font-semibold leading-[0.84] tracking-[-0.06em]"
          lines={["Consistency", <>is the product<span key="d" className="text-signal">.</span></>]}
        />
        <span id="cases-title" className="sr-only">
          Case studies: consistency is the product
        </span>
        <div className="flex flex-col justify-end md:col-span-3 md:col-start-10">
          <p className="t-lead text-bone/75">The proof isn&apos;t in a brochure. It&apos;s in the numbers that don&apos;t move.</p>
          {hasPlaceholderCases && (
            <p className="t-label mt-4 text-bone/40">Case studies below are illustrative placeholders pending client approval.</p>
          )}
        </div>
      </div>
      <div ref={stackRef} className="relative">
        {site.caseStudies.map((c, i) => (
          <Spread key={c.id} c={c} i={i} total={site.caseStudies.length} p={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
