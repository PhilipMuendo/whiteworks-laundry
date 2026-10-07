"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const ROW_A = ["Consistency is the product", "Your linen. Our operation", "Built for volume"];
const ROW_B = ["The laundry should never be the problem", "From dirty to ready", "Every day. On schedule"];

function Row({ items, from, to, outline }: { items: string[]; from: string; to: string; outline?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [from, to]);
  const seq = [...items, ...items];
  return (
    <div ref={ref} className="overflow-hidden">
      <motion.p style={{ x }} className="flex w-max items-center whitespace-nowrap uppercase will-change-transform">
        {seq.map((t, i) => (
          <span key={i} className="flex items-center">
            <span className={`text-[clamp(2.75rem,7.5vw,8.5rem)] font-semibold leading-[1.05] tracking-[-0.055em] ${outline ? "t-outline text-bone/60" : ""}`}>{t}</span>
            <span aria-hidden="true" className="mx-[3vw] inline-block h-[0.9vw] min-h-2 w-[0.9vw] min-w-2 bg-signal" />
          </span>
        ))}
      </motion.p>
    </div>
  );
}

/** Scroll-linked claims. Two rows drift in opposite directions as you pass. */
export default function ClaimStrip() {
  return (
    <section aria-label="What we stand for" className="relative overflow-hidden border-y border-bone/10 bg-ink py-[6vh] text-bone">
      <Row items={ROW_A} from="0%" to="-35%" />
      <Row items={ROW_B} from="-40%" to="-5%" outline />
    </section>
  );
}
