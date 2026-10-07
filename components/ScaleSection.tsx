"use client";

import { usePrefersReducedMotion } from "@/lib/useMedia";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { site, hasPlaceholderStats, type Stat } from "@/config/site";
import { EASE_EXPO, pad } from "@/lib/utils";

/** Mechanical odometer: each digit rolls through a full revolution before landing. */
function Odometer({ value, prefix, suffix, className }: { value: string; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = usePrefersReducedMotion();
  const chars = value.split("");
  const digits = Array.from({ length: 20 }, (_, i) => i % 10);

  return (
    <span ref={ref} className={`inline-flex items-start leading-none ${className ?? ""}`} aria-label={`${prefix ?? ""}${value}${suffix ?? ""}`}>
      {prefix && <span aria-hidden="true">{prefix}</span>}
      {chars.map((c, i) => {
        const d = Number(c);
        if (Number.isNaN(d))
          return (
            <span key={i} aria-hidden="true">
              {c}
            </span>
          );
        return (
          <span key={i} aria-hidden="true" className="relative inline-block h-[1em] overflow-hidden">
            <motion.span
              className="flex flex-col"
              initial={{ y: "0em" }}
              animate={inView || reduce ? { y: `-${10 + d}em` } : undefined}
              transition={{ duration: 2.4 + i * 0.25, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.08 }}
            >
              {digits.map((n, j) => (
                <span key={j} className="block h-[1em]">
                  {n}
                </span>
              ))}
            </motion.span>
            {/* reserves width */}
            <span className="invisible block h-0">{c}</span>
          </span>
        );
      })}
      {suffix && (
        <motion.span
          aria-hidden="true"
          className="text-ash"
          initial={{ opacity: 0, x: -12 }}
          animate={inView || reduce ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 1, ease: EASE_EXPO, delay: 1.6 }}
        >
          {suffix}
        </motion.span>
      )}
    </span>
  );
}

function StatBlock({ stat, index, className }: { stat: Stat; index: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-px origin-left bg-ink/25"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : undefined}
        transition={{ duration: 1.4, ease: EASE_EXPO }}
      />
      <div className="t-label mt-3 flex justify-between text-ink/50">
        <span>({pad(index + 1)})</span>
        <span>{stat.placeholder ? "Demo figure*" : ""}</span>
      </div>
      <Odometer
        value={stat.value}
        prefix={stat.prefix}
        suffix={stat.suffix}
        className="mt-4 text-[clamp(3.75rem,8.6vw,10rem)] font-semibold tracking-[-0.06em]"
      />
      <p className="t-label mt-4 text-ink/70">{stat.label}</p>
    </div>
  );
}

export default function ScaleSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const cleanX = useTransform(scrollYProgress, [0, 1], ["4vw", "-8vw"]);
  const scaleX = useTransform(scrollYProgress, [0, 1], ["-4vw", "8vw"]);
  const atY = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);
  const [s0, s1, s2, s3] = site.stats;

  return (
    <section ref={ref} id="scale" aria-labelledby="scale-title" className="relative overflow-hidden bg-bone pb-[10vh] pt-[14vh] text-ink">
      <h2 id="scale-title" className="sr-only">
        Clean at scale
      </h2>

      <div className="gutter relative grid grid-cols-4 gap-x-4 md:grid-cols-12 md:gap-x-6">
        {/* CLEAN */}
        <motion.p aria-hidden="true" className="t-mega col-span-4 uppercase md:col-span-9" style={{ x: cleanX }}>
          Clean
        </motion.p>
        {s0 && <StatBlock stat={s0} index={0} className="col-span-4 mt-10 md:col-span-3 md:mt-[4vw] md:self-end" />}

        {/* row 2 */}
        {s1 && <StatBlock stat={s1} index={1} className="col-span-4 mt-14 md:col-span-3 md:mt-[6vw]" />}
        <motion.p
          aria-hidden="true"
          className="t-mega col-span-4 mt-10 text-right uppercase italic text-ink/15 md:col-span-4 md:col-start-6 md:mt-[2vw] md:text-center"
          style={{ y: atY }}
        >
          At
        </motion.p>
        <div className="col-span-4 mt-10 hidden md:col-span-3 md:col-start-10 md:mt-[6vw] md:block">
          <p className="t-lead max-w-[24ch] text-ink/80">
            Built for volume. Run by schedule. Measured by what never goes wrong.
          </p>
        </div>

        {/* SCALE. */}
        <motion.p aria-hidden="true" className="t-mega col-span-4 mt-10 text-right uppercase md:col-span-12 md:mt-[3vw]" style={{ x: scaleX }}>
          Scale<span className="text-signal">.</span>
        </motion.p>

        {/* row 4 */}
        {s2 && <StatBlock stat={s2} index={2} className="col-span-4 mt-14 md:col-span-3 md:col-start-2 md:mt-[5vw]" />}
        {s3 && <StatBlock stat={s3} index={3} className="col-span-4 mt-14 md:col-span-3 md:col-start-6 md:mt-[9vw]" />}
        <div className="col-span-4 mt-14 md:col-span-3 md:col-start-10 md:mt-[5vw]">
          <p className="t-lead max-w-[26ch] text-ink/80 md:hidden">
            Built for volume. Run by schedule. Measured by what never goes wrong.
          </p>
          <p className="mt-6 max-w-[34ch] text-[0.95rem] leading-relaxed text-ink/60 md:mt-0">
            Behind every made bed, clean apron and folded towel is an operation that has to work every single day. That operation is ours, so it never has to be yours.
          </p>
        </div>
      </div>

      {hasPlaceholderStats && (
        <p className="gutter t-label mt-16 text-ink/40">* Demo figures, shown for layout. To be replaced with verified operating data.</p>
      )}
    </section>
  );
}
