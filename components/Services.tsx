"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { site } from "@/config/site";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/useMedia";
import { EASE_EXPO, pad } from "@/lib/utils";

const INK = "#080808";
const BONE = "#F5F5F0";

/**
 * SERVICES: an oversized typographic index. On desktop, hovering a word floods
 * the section to ink, the word steps forward and its photograph trails the
 * cursor, skewing with pointer velocity. On touch, rows expand in place.
 */
export default function Services() {
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // cursor-follow preview
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 160, damping: 22, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 160, damping: 22, mass: 0.5 });
  const vx = useVelocity(sx);
  const rotate = useTransform(vx, [-2500, 0, 2500], [-9, 0, 9], { clamp: true });
  const skewX = useTransform(vx, [-2500, 0, 2500], [7, 0, -7], { clamp: true });

  const active = fine ? hover : null;
  const dark = active !== null;

  return (
    <motion.section
      ref={sectionRef}
      id="services"
      aria-labelledby="services-title"
      className="relative overflow-hidden py-[14vh]"
      initial={false}
      animate={{ backgroundColor: dark ? INK : BONE, color: dark ? BONE : INK }}
      transition={{ duration: 0.7, ease: EASE_EXPO }}
      onPointerMove={(e) => {
        if (!fine || !sectionRef.current) return;
        const r = sectionRef.current.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => setHover(null)}
    >
      <div className="gutter mb-[8vh] grid grid-cols-4 gap-6 md:grid-cols-12">
        <h2 id="services-title" className="t-label col-span-2 md:col-span-3">
          Services <span className="opacity-50">({pad(site.services.length)})</span>
        </h2>
        <p className="t-lead col-span-4 max-w-[30ch] md:col-span-5 md:col-start-8">
          Seven ways we take laundry off your plate. One operation behind all of them.
        </p>
      </div>

      <ul className="relative z-10" role="list">
        {site.services.map((s, i) => {
          const isActive = active === i;
          const isDim = active !== null && !isActive;
          const isOpen = !fine && open === i;
          return (
            <li key={s.id} className="relative">
              <div className="gutter">
                <motion.div
                  className="h-px origin-left bg-current"
                  initial={{ scaleX: 0, opacity: 0.2 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 1 }}
                  transition={{ duration: 1.2, ease: EASE_EXPO, delay: i * 0.05 }}
                />
              </div>
              <button
                type="button"
                aria-expanded={fine ? isActive : isOpen}
                aria-controls={`svc-${s.id}`}
                onPointerEnter={() => fine && setHover(i)}
                onFocus={() => fine && setHover(i)}
                onBlur={() => fine && setHover(null)}
                onClick={() => !fine && setOpen(open === i ? null : i)}
                className="gutter group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-[1.4vh] text-left outline-offset-[-2px] md:grid-cols-12 md:gap-6 md:py-[0.6vh]"
              >
                <span className="t-label self-start pt-[1.6vw] opacity-50 md:col-span-1">{pad(i + 1)}</span>
                <motion.span
                  className="block text-[clamp(3rem,10.4vw,12.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.06em] md:col-span-8"
                  animate={{
                    x: isActive && !reduce ? "2.2vw" : "0vw",
                    opacity: isDim ? 0.18 : 1,
                  }}
                  transition={{ duration: 0.7, ease: EASE_EXPO }}
                >
                  {s.name}
                  {isActive && <span className="text-signal">.</span>}
                </motion.span>
                {/* desktop: description fades in on the right */}
                <motion.span
                  id={fine ? `svc-${s.id}` : undefined}
                  className="hidden max-w-[28ch] self-center text-[0.95rem] leading-snug md:col-span-3 md:block"
                  animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
                  transition={{ duration: 0.6, ease: EASE_EXPO }}
                >
                  {s.description}
                </motion.span>
                {/* touch: plus/minus */}
                <span aria-hidden="true" className="relative h-5 w-5 md:hidden">
                  <span className="absolute left-0 top-1/2 h-px w-5 bg-current" />
                  <motion.span className="absolute left-1/2 top-0 h-5 w-px bg-current" animate={{ scaleY: isOpen ? 0 : 1 }} />
                </span>
              </button>

              {/* touch: inline expansion */}
              {!fine && (
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`svc-${s.id}`}
                      className="gutter overflow-hidden"
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.7, ease: EASE_EXPO }}
                    >
                      <div className="pb-6 pt-2">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image src={s.image.src} alt={s.image.alt} fill sizes="100vw" className="object-cover" placeholder="blur" />
                        </div>
                        <p className="mt-4 max-w-[36ch] text-base leading-snug">{s.description}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </li>
          );
        })}
        <li aria-hidden="true" className="gutter">
          <div className="h-px bg-current opacity-20" />
        </li>
      </ul>

      {/* cursor-follow preview (desktop) */}
      {fine && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-20 h-[min(34vw,30rem)] w-[min(26vw,23rem)]"
          style={{ x: sx, y: sy, rotate: reduce ? 0 : rotate, skewX: reduce ? 0 : skewX, translateX: "-50%", translateY: "-58%" }}
          initial={false}
          animate={{ scale: active !== null ? 1 : 0, opacity: active !== null ? 1 : 0 }}
          transition={{ duration: 0.55, ease: EASE_EXPO }}
        >
          {site.services.map((s, i) => (
            <motion.div
              key={s.id}
              className="absolute inset-0 overflow-hidden"
              initial={false}
              animate={{ clipPath: active === i ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
              transition={{ duration: 0.75, ease: EASE_EXPO }}
              style={{ zIndex: active === i ? 2 : 1 }}
            >
              <motion.div className="absolute inset-0" animate={{ scale: active === i ? 1 : 1.3 }} transition={{ duration: 1.1, ease: EASE_EXPO }}>
                <Image src={s.image.src} alt="" fill sizes="26vw" className="object-cover" />
              </motion.div>
            </motion.div>
          ))}
          <span className="t-label absolute -bottom-6 left-0 text-bone/70">{active !== null && `Fig. ${pad(active + 1)} · ${site.services[active].name}`}</span>
        </motion.div>
      )}
    </motion.section>
  );
}
