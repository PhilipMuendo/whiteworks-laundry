"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { site, type ProcessStep } from "@/config/site";
import { usePrefersReducedMotion, useViewport } from "@/lib/useMedia";
import { pad } from "@/lib/utils";
import { RevealLines } from "./ui/Reveal";

/*
 * FROM DIRTY TO READY.
 *
 * Desktop: a pinned horizontal run through the plant. One continuous line
 * threads all seven stations; an orange garment tag rides it. The track is
 * painted dark on the left and bone on the right, so travelling through the
 * process is literally travelling from dirty to clean. All text uses
 * mix-blend-difference and inverts automatically as the zones change.
 *
 * Mobile / reduced motion: the same story told vertically.
 */

const STEPS = site.process;
const INTRO = 100; // vw
const STATION = 62; // vw
const OUTRO = 100; // vw
const TRACK = INTRO + STEPS.length * STATION + OUTRO; // vw
const DIRTY = "#15130f";
const CLEAN = "#F5F5F0";
const CONDITION = ["Soiled", "Sorted", "Washing", "Drying", "Finishing", "Inspected", "Ready"];

// the "clean zone" begins as the tag reaches the inspection station
const CLEAN_AT = (INTRO + 5 * STATION - 8) / TRACK;

function waveY(xPx: number, vw: number, vh: number) {
  const A = vh * 0.055;
  const L = (STATION * vw) / 100;
  return A * Math.sin((xPx / L) * Math.PI * 2);
}

function Station({ step, i, vw, vh, worldTag }: { step: ProcessStep; i: number; vw: number; vh: number; worldTag: MotionValue<number> }) {
  const left = ((INTRO + i * STATION) * vw) / 100;
  const nodeX = left + (vw * 4) / 100;
  const reached = useTransform(worldTag, (x) => (x >= nodeX ? 1 : 0));
  const imgX = useTransform(worldTag, (x) => `${Math.max(-8, Math.min(8, ((nodeX - x) / vw) * 10))}%`);
  const imageTop = i % 2 === 0;
  const nodeY = waveY(nodeX, vw, vh);

  return (
    <div className="relative h-full shrink-0" style={{ width: `${STATION}vw` }}>
      {/* station node on the line */}
      <div className="absolute left-[4vw] top-1/2 z-10 -translate-x-1/2 -translate-y-1/2" style={{ marginTop: nodeY }}>
        <span className="block h-3.5 w-3.5 rounded-full border border-bone mix-blend-difference" />
        <motion.span className="absolute inset-0 rounded-full bg-signal" style={{ opacity: reached }} />
      </div>
      {/* vertical datum */}
      <div className="absolute bottom-[8vh] left-[4vw] top-[8vh] w-px bg-bone/15 mix-blend-difference" />

      {/* giant numeral */}
      <p aria-hidden="true" className="t-outline absolute right-[5vw] text-[19vw] font-semibold leading-none tracking-[-0.06em] text-bone/40 mix-blend-difference" style={imageTop ? { bottom: "4vh" } : { top: "4vh" }}>
        {pad(i + 1)}
      </p>

      {/* image */}
      <div
        className="absolute left-[6.5vw] h-[34vh] w-[24vw] overflow-hidden"
        style={imageTop ? { top: "9vh" } : { bottom: "9vh" }}
      >
        <motion.div className="absolute inset-[-10%]" style={{ x: imgX }}>
          <Image src={step.image.src} alt={step.image.alt} fill sizes="30vw" loading="eager" className="object-cover" placeholder="blur" />
        </motion.div>
      </div>

      {/* copy */}
      <div className="absolute left-[6.5vw] w-[30vw] text-bone mix-blend-difference" style={imageTop ? { top: "58vh" } : { top: "11vh" }}>
        <p className="t-label opacity-70">
          Stage {pad(i + 1)} · {step.title}
        </p>
        <h3 className="mt-3 text-[clamp(3rem,6.2vw,7.5rem)] font-semibold uppercase leading-[0.85] tracking-[-0.06em]">{step.verb}</h3>
        <p className="mt-4 max-w-[34ch] text-[0.95rem] leading-snug opacity-80">{step.body}</p>
        <p className="t-label mt-4 opacity-55">{step.spec}</p>
      </div>
    </div>
  );
}

function DesktopProcess() {
  const ref = useRef<HTMLElement>(null);
  const vp = useViewport();
  const vw = vp?.w ?? 1440;
  const vh = vp?.h ?? 900;
  const trackPx = (TRACK * vw) / 100;
  const travel = trackPx - vw;
  const height = travel * 0.82 + vh;

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const trackX = useTransform(p, (v) => -v * travel);
  const tagScreenX = vw * 0.3;
  const worldTag = useTransform(trackX, (x) => tagScreenX - x);
  const tagY = useTransform(worldTag, (x) => waveY(x, vw, vh));
  const tagRot = useTransform(worldTag, (x) => {
    const A = vh * 0.055, L = (STATION * vw) / 100;
    return (Math.atan(((A * 2 * Math.PI) / L) * Math.cos((x / L) * Math.PI * 2)) * 180) / Math.PI;
  });
  const drawn = useTransform(worldTag, (x) => Math.max(0, x));

  const [stage, setStage] = useState(-1);
  useMotionValueEvent(worldTag, "change", (x) => {
    const s = Math.floor((x - ((INTRO - 4) * vw) / 100) / ((STATION * vw) / 100));
    const c = Math.max(-1, Math.min(STEPS.length - 1, s));
    if (c !== stage) setStage(c);
  });
  const hudBar = useTransform(p, [0.08, 0.92], [0, 1]);

  const path = useMemo(() => {
    let d = `M0 ${vh / 2 + waveY(0, vw, vh)}`;
    for (let x = 16; x <= trackPx; x += 16) d += ` L${x} ${(vh / 2 + waveY(x, vw, vh)).toFixed(1)}`;
    return d;
  }, [vw, vh, trackPx]);

  const bg = `linear-gradient(to right, ${DIRTY} 0%, ${DIRTY} ${(CLEAN_AT - 0.05) * 100}%, ${CLEAN} ${(CLEAN_AT + 0.035) * 100}%, ${CLEAN} 100%)`;

  return (
    <section ref={ref} aria-labelledby="process-title" className="relative" style={{ height, background: DIRTY }}>
      <div className="sticky top-0 h-screen overflow-hidden" style={{ background: DIRTY }}>
        <motion.div className="relative flex h-full will-change-transform" style={{ x: trackX, width: trackPx, background: bg }}>
          {/* the line */}
          <svg className="pointer-events-none absolute inset-0 h-full mix-blend-difference" width={trackPx} height={vh} aria-hidden="true">
            <path d={path} fill="none" stroke="#F5F5F0" strokeOpacity="0.2" strokeWidth="1" />
          </svg>
          <motion.div className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden mix-blend-difference" style={{ width: drawn }} aria-hidden="true">
            <svg className="absolute inset-0 h-full" width={trackPx} height={vh}>
              <path d={path} fill="none" stroke="#F5F5F0" strokeWidth="2" />
            </svg>
          </motion.div>

          {/* intro: always in the dirty zone */}
          <div className="relative h-full shrink-0 text-bone" style={{ width: `${INTRO}vw` }}>
            <h2 id="process-title" className="gutter absolute left-0 top-[16vh] uppercase">
              <span className="block text-[clamp(2.5rem,6vw,7rem)] font-semibold leading-[0.85] tracking-[-0.06em]">From</span>
              <span className="t-mega block text-ash">Dirty</span>
              <span className="sr-only">to ready</span>
            </h2>
            <p className="gutter t-lead absolute bottom-[12vh] left-0 max-w-[34ch]">
              Seven stages. One continuous line. Follow the tag from the moment it leaves your site to the moment it&apos;s back on the shelf.
            </p>
          </div>

          {STEPS.map((s, i) => (
            <Station key={s.id} step={s} i={i} vw={vw} vh={vh} worldTag={worldTag} />
          ))}

          {/* outro: always in the clean zone */}
          <div className="relative h-full shrink-0 text-ink" style={{ width: `${OUTRO}vw` }}>
            <p aria-hidden="true" className="absolute right-[var(--gutter)] top-[14vh] text-right uppercase">
              <span className="block text-[clamp(2.5rem,6vw,7rem)] font-semibold leading-[0.85] tracking-[-0.06em]">To</span>
              <span className="t-mega block">
                Ready<span className="text-signal">.</span>
              </span>
            </p>
            <p className="t-lead absolute bottom-[12vh] right-[var(--gutter)] max-w-[30ch] text-right">
              Counted, packed and back on your shelves, ready before you need it.
            </p>
          </div>
        </motion.div>

        {/* the tag */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/2 z-20"
          style={{ x: tagScreenX, y: tagY, rotate: tagRot }}
        >
          <div className="-translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2 bg-signal px-2.5 py-1.5 text-ink shadow-[0_0_0_1px_rgba(8,8,8,0.15)]">
              <span className="block h-1.5 w-1.5 rounded-full bg-ink" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em]">Tag 004172</span>
            </div>
          </div>
        </motion.div>

        {/* HUD */}
        <div className="gutter pointer-events-none absolute inset-x-0 bottom-[var(--gutter)] z-20 flex items-end justify-between text-bone mix-blend-difference">
          <div className="t-label flex gap-8">
            <span>
              Stage <span className="tabular-nums">{stage < 0 ? "00" : pad(stage + 1)}</span> / {pad(STEPS.length)}
            </span>
            <span>
              Condition: <span>{stage < 0 ? "Soiled" : CONDITION[stage]}</span>
            </span>
          </div>
          <div className="h-px w-[22vw] bg-bone/25">
            <motion.div className="h-px origin-left bg-bone" style={{ scaleX: hudBar }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function VerticalProcess() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const split = 5; // stations from this index sit in the clean zone

  return (
    <section ref={ref} aria-labelledby="process-title-m" className="relative" style={{ background: DIRTY }}>
      {/* rail */}
      <div className="absolute bottom-0 left-[calc(var(--gutter)+0.25rem)] top-0 w-px bg-bone/15 mix-blend-difference" aria-hidden="true" />
      <motion.div
        className="absolute left-[calc(var(--gutter)+0.25rem)] top-0 h-full w-px origin-top bg-signal"
        style={{ scaleY: scrollYProgress }}
        aria-hidden="true"
      />

      <div className="relative pl-[calc(var(--gutter)+2rem)] pr-[var(--gutter)] pt-[14vh] text-bone">
        <RevealLines
          as="h2"
          className="uppercase"
          lines={[
            <span key="a" className="text-[13vw] font-semibold leading-[0.85] tracking-[-0.06em]">From</span>,
            <span key="b" className="text-[22vw] font-semibold leading-[0.8] tracking-[-0.065em] text-ash">Dirty</span>,
          ]}
        />
        <span id="process-title-m" className="sr-only">From dirty to ready</span>
        <p className="t-lead mt-8 max-w-[30ch] text-bone/80">Seven stages. One continuous line. Follow it from your site and back again.</p>
      </div>

      <ol className="relative mt-[10vh]">
        {STEPS.map((s, i) => {
          const clean = i >= split;
          return (
            <li key={s.id} className="relative">
              {i === split && <div aria-hidden="true" className="h-[30vh]" style={{ background: `linear-gradient(${DIRTY}, ${CLEAN})` }} />}
              <div
                className="pb-[10vh] pl-[calc(var(--gutter)+2rem)] pr-[var(--gutter)]"
                style={{ background: clean ? CLEAN : DIRTY, color: clean ? "#080808" : CLEAN }}
              >
                <span
                  aria-hidden="true"
                  className="absolute left-[calc(var(--gutter)+0.25rem)] mt-1 h-3 w-3 -translate-x-1/2 rounded-full border border-current"
                  style={{ background: clean ? "#080808" : DIRTY }}
                />
                <p className="t-label opacity-70">
                  Stage {pad(i + 1)} · {s.title}
                </p>
                <h3 className="mt-3 text-[16vw] font-semibold uppercase leading-[0.85] tracking-[-0.06em]">{s.verb}</h3>
                <div className="relative mt-6 aspect-[4/3] overflow-hidden">
                  <Image src={s.image.src} alt={s.image.alt} fill sizes="90vw" className="object-cover" placeholder="blur" />
                </div>
                <p className="mt-5 max-w-[36ch] text-base leading-snug opacity-85">{s.body}</p>
                <p className="t-label mt-3 opacity-55">{s.spec}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="px-[var(--gutter)] pb-[14vh] text-right text-ink" style={{ background: CLEAN }}>
        <p aria-hidden="true" className="uppercase">
          <span className="block text-[13vw] font-semibold leading-[0.85] tracking-[-0.06em]">To</span>
          <span className="block text-[22vw] font-semibold leading-[0.8] tracking-[-0.065em]">
            Ready<span className="text-signal">.</span>
          </span>
        </p>
      </div>
    </section>
  );
}

export default function Process() {
  const reduce = usePrefersReducedMotion();
  return (
    <div id="process">
      <div className={reduce ? "hidden" : "hidden md:block"}>
        <DesktopProcess />
      </div>
      <div className={reduce ? "block" : "md:hidden"}>
        <VerticalProcess />
      </div>
    </div>
  );
}
