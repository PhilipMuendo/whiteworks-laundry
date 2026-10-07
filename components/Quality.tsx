"use client";

import { usePrefersReducedMotion } from "@/lib/useMedia";
import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";
import { site } from "@/config/site";
import { EASE_EXPO, pad } from "@/lib/utils";
import { RevealLines } from "./ui/Reveal";

/*
 * ENGINEERED FOR CONSISTENCY.
 * A spec-sheet, not a feature grid: a sticky engineering drawing of a washer
 * drum on the left, six specification rows on the right, each with its own
 * minimal line diagram that draws itself in.
 */

/** round SVG coordinates so server and client markup match exactly */
const r2 = (n: number) => Math.round(n * 100) / 100;

const draw = (inView: boolean, delay = 0) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: inView ? { pathLength: 1, opacity: 1 } : undefined,
  transition: { duration: 1.6, ease: EASE_EXPO, delay },
});

function Diagram({ id, inView }: { id: string; inView: boolean }) {
  const reduce = usePrefersReducedMotion();
  const loop = !reduce && inView;
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };
  let body: ReactNode = null;

  switch (id) {
    case "equipment":
      body = (
        <>
          <motion.circle cx="48" cy="48" r="38" {...common} {...draw(inView)} />
          <motion.circle cx="48" cy="48" r="30" {...common} strokeDasharray="2 3" {...draw(inView, 0.2)} />
          <motion.g
            style={{ originX: "48px", originY: "48px" }}
            animate={loop ? { rotate: 360 } : undefined}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          >
            {[0, 120, 240].map((a) => (
              <line key={a} x1="48" y1="18" x2="48" y2="26" {...common} transform={`rotate(${a} 48 48)`} className="text-signal" stroke="currentColor" strokeWidth={2} />
            ))}
          </motion.g>
          <circle cx="48" cy="48" r="2" fill="currentColor" />
        </>
      );
      break;
    case "processing":
      body = (
        <>
          <motion.path d="M10 84 H88 M10 84 V10" {...common} opacity={0.4} {...draw(inView)} />
          <motion.path d="M10 76 L24 76 L30 52 L48 52 L54 30 L72 30 L78 70 L88 70" {...common} {...draw(inView, 0.2)} />
          <motion.circle
            r="3"
            className="text-signal"
            fill="currentColor"
            animate={loop ? { cx: [10, 24, 30, 48, 54, 72, 78, 88], cy: [76, 76, 52, 52, 30, 30, 70, 70] } : { cx: 10, cy: 76 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </>
      );
      break;
    case "inspection":
      body = (
        <>
          {[20, 32, 44, 56, 68, 80].map((v) => (
            <motion.path key={v} d={`M16 ${v} H80`} {...common} opacity={0.25} {...draw(inView, v / 200)} />
          ))}
          <motion.rect x="16" y="16" width="64" height="64" {...common} {...draw(inView)} />
          <motion.g animate={loop ? { y: [0, 48, 0] } : undefined} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
            <line x1="10" y1="24" x2="86" y2="24" className="text-signal" stroke="currentColor" strokeWidth={1.5} />
          </motion.g>
          <path d="M48 8 V16 M48 80 V88 M8 48 H16 M80 48 H88" {...common} />
        </>
      );
      break;
    case "care":
      body = (
        <>
          {[22, 38, 54, 70].map((y, r) => (
            <motion.path key={`h${y}`} d={`M12 ${y} H84`} {...common} {...draw(inView, r * 0.1)} />
          ))}
          {[22, 38, 54, 70].map((x, c) =>
            [22, 38, 54, 70].map((y, r) =>
              (r + c) % 2 === 0 ? (
                <motion.rect
                  key={`${x}-${y}`}
                  x={x - 3}
                  y={y - 5}
                  width="6"
                  height="10"
                  fill="currentColor"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : undefined}
                  transition={{ delay: 0.6 + (r + c) * 0.06 }}
                />
              ) : null,
            ),
          )}
          {[22, 38, 54, 70].map((x, c) => (
            <motion.path key={`v${x}`} d={`M${x} 12 V84`} {...common} strokeDasharray="10 6" {...draw(inView, 0.3 + c * 0.1)} />
          ))}
        </>
      );
      break;
    case "schedule":
      body = (
        <>
          <motion.circle cx="48" cy="48" r="36" {...common} {...draw(inView)} />
          {Array.from({ length: 7 }).map((_, k) => {
            const a = (k / 7) * Math.PI * 2 - Math.PI / 2;
            const on = k % 2 === 0;
            return (
              <line
                key={k}
                x1={r2(48 + Math.cos(a) * 30)}
                y1={r2(48 + Math.sin(a) * 30)}
                x2={r2(48 + Math.cos(a) * 40)}
                y2={r2(48 + Math.sin(a) * 40)}
                stroke="currentColor"
                strokeWidth={on ? 2.5 : 1}
                className={on ? "text-signal" : undefined}
              />
            );
          })}
          <motion.line
            x1="48"
            y1="48"
            x2="48"
            y2="22"
            stroke="currentColor"
            strokeWidth={1.25}
            style={{ originX: "48px", originY: "48px" }}
            animate={loop ? { rotate: 360 } : undefined}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          />
          <circle cx="48" cy="48" r="2" fill="currentColor" />
        </>
      );
      break;
    case "delivery":
      body = (
        <>
          <motion.path d="M12 74 C30 74 28 30 48 30 S66 66 84 22" {...common} opacity={0.3} {...draw(inView)} />
          <motion.path
            d="M12 74 C30 74 28 30 48 30 S66 66 84 22"
            {...common}
            strokeWidth={1.5}
            strokeDasharray="4 6"
            animate={loop ? { strokeDashoffset: [0, -40] } : undefined}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          />
          <rect x="8" y="70" width="8" height="8" fill="currentColor" />
          <rect x="80" y="18" width="8" height="8" className="text-signal" fill="currentColor" />
        </>
      );
      break;
  }

  return (
    <svg viewBox="0 0 96 96" className="h-20 w-20 md:h-24 md:w-24" aria-hidden="true">
      {body}
    </svg>
  );
}

function SpecRow({ item, i }: { item: (typeof site.quality)[number]; i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.5 });
  const seen = useInView(ref, { once: true, amount: 0.5 });
  return (
    <li ref={ref} className="relative">
      <motion.div
        className="h-px origin-left bg-ink/30"
        initial={{ scaleX: 0 }}
        animate={seen ? { scaleX: 1 } : undefined}
        transition={{ duration: 1.4, ease: EASE_EXPO }}
      />
      <div className="grid grid-cols-[3rem_1fr_auto] gap-x-4 gap-y-3 py-8 md:grid-cols-[4rem_1fr_6.5rem_9rem] md:gap-x-8 md:py-10">
        <span className="t-label pt-1 text-ink/50">Q.{pad(i + 1)}</span>
        <div>
          <h3 className="t-heading uppercase">{item.title}</h3>
          <p className="mt-3 max-w-[40ch] text-[0.95rem] leading-snug text-ink/70">{item.body}</p>
        </div>
        <div className="row-span-2 text-ink md:row-span-1">
          <Diagram id={item.id} inView={inView || seen} />
        </div>
        <dl className="col-start-2 md:col-start-auto md:text-right">
          <dt className="t-label text-ink/45">{item.param}</dt>
          <dd className="t-label mt-1.5 text-ink">{item.value}</dd>
        </dl>
      </div>
    </li>
  );
}

/** Engineering drawing of a washer-extractor drum, dimensioned. */
function Drawing() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = usePrefersReducedMotion();
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };
  return (
    <svg ref={ref} viewBox="0 0 400 400" className="h-auto w-full max-w-[26rem] text-ink" aria-hidden="true">
      <motion.circle cx="200" cy="200" r="150" {...s} {...draw(inView)} />
      <motion.circle cx="200" cy="200" r="128" {...s} {...draw(inView, 0.15)} />
      <motion.circle cx="200" cy="200" r="70" {...s} strokeDasharray="3 5" {...draw(inView, 0.3)} />
      <motion.path d="M30 200 H370 M200 30 V370" {...s} opacity={0.35} strokeDasharray="12 4 2 4" {...draw(inView, 0.2)} />
      <motion.g
        style={{ originX: "200px", originY: "200px" }}
        animate={inView && !reduce ? { rotate: 360 } : undefined}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {[0, 120, 240].map((a) => (
          <path key={a} d="M188 72 L212 72 L206 104 L194 104 Z" fill="currentColor" transform={`rotate(${a} 200 200)`} />
        ))}
        {Array.from({ length: 36 }).map((_, k) => (
          <circle key={k} cx={r2(200 + Math.cos((k / 36) * Math.PI * 2) * 116)} cy={r2(200 + Math.sin((k / 36) * Math.PI * 2) * 116)} r="1.6" fill="currentColor" opacity="0.5" />
        ))}
      </motion.g>
      {/* dimension: drum diameter */}
      <motion.path d="M50 372 H350 M50 364 V380 M350 364 V380" {...s} {...draw(inView, 0.6)} />
      <text x="200" y="392" textAnchor="middle" className="fill-current font-mono text-[9px] uppercase tracking-[0.1em]">
        Ø Drum
      </text>
      {/* leader + callouts */}
      <motion.path d="M262 98 L318 42 H372" {...s} {...draw(inView, 0.8)} />
      <text x="372" y="36" textAnchor="end" className="fill-current font-mono text-[9px] uppercase tracking-[0.1em]">
        Lifter ×3
      </text>
      <motion.path d="M130 270 L72 330 H24" {...s} {...draw(inView, 0.9)} />
      <text x="24" y="324" className="fill-current font-mono text-[9px] uppercase tracking-[0.1em]">
        Perforated shell
      </text>
      <circle cx="200" cy="200" r="4" className="fill-signal" />
    </svg>
  );
}

export default function Quality() {
  return (
    <section id="quality" aria-labelledby="quality-title" className="blueprint-ink relative bg-bone py-[14vh] text-ink">
      <div className="gutter">
        <RevealLines
          as="h2"
          className="uppercase"
          lineClassName="text-[clamp(3rem,10.6vw,13rem)] font-semibold leading-[0.82] tracking-[-0.065em]"
          lines={[
            <span key="a" className="flex items-end justify-between gap-6">
              <span>Engineered</span>
              <span className="t-label mb-[1.2vw] hidden text-right font-normal tracking-[0.08em] text-ink/50 md:block">Spec. sheet · Q.01 – Q.06</span>
            </span>,
            <span key="b" className="block md:pl-[16vw]">for</span>,
            <span key="c">
              Consistency<span className="text-signal">.</span>
            </span>,
          ]}
        />
        <span id="quality-title" className="sr-only">
          Engineered for consistency
        </span>
      </div>

      <div className="gutter mt-[8vh] grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-[12vh]">
            <p className="t-lead max-w-[34ch] text-ink/75">
              Consistency isn&apos;t a promise. It&apos;s the output of equipment, programmes and checks that run the same way every time.
            </p>
            <div className="ticks relative mt-10 hidden p-6 text-ink/40 md:block">
              <div className="text-ink">
                <Drawing />
              </div>
              <p className="t-label mt-4 flex justify-between text-ink/50">
                <span>Fig. Q · Washer-extractor drum</span>
                <span>Not to scale</span>
              </p>
            </div>
          </div>
        </div>

        <ol className="md:col-span-6 md:col-start-7">
          {site.quality.map((q, i) => (
            <SpecRow key={q.id} item={q} i={i} />
          ))}
          <li aria-hidden="true" className="h-px bg-ink/30" />
        </ol>
      </div>
    </section>
  );
}
