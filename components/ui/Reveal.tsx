"use client";

import { usePrefersReducedMotion } from "@/lib/useMedia";
import { motion, useInView } from "motion/react";
import { useRef, type ElementType, type ReactNode } from "react";
import { EASE_EXPO } from "@/lib/utils";

/**
 * Masked line reveal. Each entry in `lines` slides up from behind a clip.
 * The full text stays in the DOM for screen readers and search engines.
 */
export function RevealLines({
  lines,
  as: Tag = "div",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.08,
  once = true,
  amount = 0.4,
}: {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  amount?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount });
  const reduce = usePrefersReducedMotion();
  return (
    <Tag ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className={`block overflow-hidden pb-[0.06em] -mb-[0.06em] ${lineClassName ?? ""}`}>
          <motion.span
            className="block will-change-transform"
            initial={{ y: "105%" }}
            animate={inView || reduce ? { y: "0%" } : { y: "105%" }}
            transition={{ duration: 1.1, ease: EASE_EXPO, delay: delay + i * stagger }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Simple fade + rise on enter. */
export function FadeIn({ children, className, delay = 0, y = 24 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = usePrefersReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView || reduce ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1, ease: EASE_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}
