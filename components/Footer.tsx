"use client";

import { usePrefersReducedMotion } from "@/lib/useMedia";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { site } from "@/config/site";
import { useScrollTo } from "@/lib/smooth-scroll";
import { EASE_EXPO } from "@/lib/utils";
import Arrow from "./ui/Arrow";

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = usePrefersReducedMotion();
  const scrollTo = useScrollTo();
  const year = new Date().getFullYear();
  const a = site.contact.address;

  return (
    <footer className="relative overflow-hidden bg-bone pt-[12vh] text-ink" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        {site.name}: contact and information
      </h2>
      <div className="gutter grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12">
        <p className="t-heading col-span-2 max-w-[16ch] uppercase md:col-span-5">
          The laundry should never be the problem<span className="text-signal">.</span>
        </p>

        <div className="t-label space-y-2 md:col-span-2 md:col-start-7">
          <p className="text-ink/45">Contact</p>
          <a className="block hover:text-signal" href={site.contact.phoneHref}>{site.contact.phone}</a>
          <a className="block break-all hover:text-signal" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
        </div>

        <address className="t-label space-y-2 not-italic md:col-span-2">
          <p className="text-ink/45">Plant</p>
          <p>{a.street}</p>
          <p>
            {a.locality} {a.postalCode}
          </p>
          <p className="text-ink/55">{site.contact.hours}</p>
        </address>

        <nav aria-label="Footer" className="t-label space-y-2 md:col-span-1">
          <p className="text-ink/45">Explore</p>
          {site.nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(n.href);
              }}
              className="block hover:text-signal"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="t-label flex flex-col items-start justify-between gap-6 md:col-span-1 md:items-end">
          <div className="space-y-2 md:text-right">
            <p className="text-ink/45">Follow</p>
            {site.social.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="block hover:text-signal">
                {s.label}
              </a>
            ))}
          </div>
          <button type="button" onClick={() => scrollTo(0)} className="group inline-flex items-center gap-2">
            Top <Arrow dir="up" className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* wordmark */}
      <div ref={ref} aria-hidden="true" className="mt-[10vh] overflow-hidden px-[calc(var(--gutter)*0.5)]">
        <p className="flex justify-between text-[15.4vw] font-semibold uppercase leading-[0.78] tracking-[-0.07em]">
          {site.wordmark.split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ y: "100%" }}
              animate={inView || reduce ? { y: "0%" } : undefined}
              transition={{ duration: 1.2, ease: EASE_EXPO, delay: i * 0.04 }}
            >
              {ch}
            </motion.span>
          ))}
        </p>
      </div>

      <div className="gutter t-label flex flex-col gap-2 border-t border-ink/15 py-5 text-ink/55 md:flex-row md:justify-between">
        <p>
          © {year} {site.legalName}
        </p>
        <p className="max-w-[60ch]">Commercial laundry services · Hotel linen services · Uniform laundry · Laundry pickup &amp; delivery</p>
        <a href="#" className="hover:text-ink">
          Privacy
        </a>
      </div>
    </footer>
  );
}
