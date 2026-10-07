"use client";

import { usePrefersReducedMotion } from "@/lib/useMedia";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { useLenis, useScrollTo } from "@/lib/smooth-scroll";
import { EASE_EXPO, pad } from "@/lib/utils";
import Arrow from "./ui/Arrow";

/** Sections tracked by the running index in the header. */
const CHAPTERS = [
  { id: "top", label: "Intro" },
  { id: "scale", label: "Scale" },
  { id: "industries", label: "Industries" },
  { id: "services", label: "Services" },
  { id: "process", label: "Process" },
  { id: "facility", label: "Facility" },
  { id: "quality", label: "Quality" },
  { id: "cases", label: "Cases" },
  { id: "quote", label: "Quote" },
  { id: "final", label: "Fin" },
];

function Wordmark({ compact }: { compact: boolean }) {
  if (site.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={site.logo} alt={site.name} className="h-5 w-auto" />;
  }
  const word = site.wordmark;
  return (
    <span className="relative flex items-center gap-2 text-[0.95rem] font-semibold tracking-[-0.02em]" aria-label={site.name}>
      {/* mark: three folded layers */}
      <span aria-hidden="true" className="flex flex-col gap-[3px]">
        <span className="block h-[3px] w-4 bg-current" />
        <span className="block h-[3px] w-4 bg-current" />
        <span className="block h-[3px] w-4 bg-signal" />
      </span>
      <span aria-hidden="true" className="flex overflow-hidden">
        {word.split("").map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={false}
            animate={{ y: compact && i > 0 ? "-110%" : "0%", width: compact && i > 0 ? 0 : "auto" }}
            transition={{ duration: 0.6, ease: EASE_EXPO, delay: (compact ? i : word.length - i) * 0.015 }}
          >
            {ch}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

export default function Navigation() {
  const reduce = usePrefersReducedMotion();
  const scrollTo = useScrollTo();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [chapter, setChapter] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > window.innerHeight * 0.4));

  // running chapter index: whichever section spans the viewport midline
  useEffect(() => {
    const els = CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = CHAPTERS.findIndex((c) => c.id === e.target.id);
            if (i >= 0) setChapter(i);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // menu: lock scroll, close on Escape, keep focus inside
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = menuRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && menuRef.current) {
        const f = Array.from(menuRef.current.querySelectorAll<HTMLElement>("a,button"));
        if (!f.length) return;
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open, lenis]);

  const go = (href: string) => {
    setOpen(false);
    // let the menu start closing before travelling
    window.setTimeout(() => scrollTo(href), open ? 350 : 0);
  };

  const c = CHAPTERS[chapter];

  return (
    <>
      <a href="#scale" className="sr-only-focusable fixed left-4 top-4 z-[120] bg-bone px-4 py-2 text-ink">
        Skip to content
      </a>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] text-bone mix-blend-difference">
        <div className="gutter flex h-[4.5rem] items-center justify-between gap-6 md:grid md:grid-cols-12">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go("#top");
            }}
            className="pointer-events-auto md:col-span-3"
          >
            <Wordmark compact={scrolled && !open} />
          </a>

          {/* running index */}
          <div className="t-label hidden items-center gap-3 md:col-span-3 md:flex" aria-hidden="true">
            <span className="tabular-nums">({pad(chapter)})</span>
            <span className="relative block h-[1.2em] overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={c.id}
                  className="block"
                  initial={{ y: reduce ? 0 : "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: reduce ? 0 : "-100%" }}
                  transition={{ duration: 0.5, ease: EASE_EXPO }}
                >
                  {c.label}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>

          <nav aria-label="Primary" className="hidden md:col-span-3 md:block">
            <motion.ul
              className="t-label flex gap-6"
              animate={{ opacity: scrolled ? 0 : 1, y: scrolled ? -8 : 0 }}
              transition={{ duration: 0.5, ease: EASE_EXPO }}
              style={{ pointerEvents: scrolled ? "none" : "auto" }}
            >
              {site.nav.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    tabIndex={scrolled ? -1 : 0}
                    onClick={(e) => {
                      e.preventDefault();
                      go(n.href);
                    }}
                    className="group relative inline-block py-2"
                  >
                    {n.label}
                    <span className="absolute bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-expo)] group-hover:origin-left group-hover:scale-x-100" />
                  </a>
                </li>
              ))}
            </motion.ul>
          </nav>

          <div className="pointer-events-auto flex items-center justify-end gap-4 whitespace-nowrap md:col-span-3">
            <a
              href="#quote"
              onClick={(e) => {
                e.preventDefault();
                go("#quote");
              }}
              className="group hidden h-9 items-center gap-2 bg-bone px-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink md:inline-flex"
            >
              Request a quote
              <Arrow className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-0.5" />
            </a>
            <button
              ref={triggerRef}
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((o) => !o)}
              className={`flex h-9 items-center gap-2.5 px-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] ${scrolled ? "md:flex" : "md:hidden"}`}
            >
              <span>{open ? "Close" : "Menu"}</span>
              <span aria-hidden="true" className="relative block h-2.5 w-4">
                <motion.span className="absolute left-0 top-0 h-px w-full bg-current" animate={{ y: open ? 5 : 0, rotate: open ? 45 : 0 }} />
                <motion.span className="absolute bottom-0 left-0 h-px w-full bg-current" animate={{ y: open ? -4.5 : 0, rotate: open ? -45 : 0 }} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* full-screen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[95] flex flex-col bg-ink text-bone"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: reduce ? 0 : 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="h-[4.5rem]" />
            <nav aria-label="Menu" className="gutter flex flex-1 flex-col justify-center">
              <ul>
                {[...site.nav, { label: "Quality", href: "#quality" }, { label: "Get a quote", href: "#quote" }].map((n, i) => (
                  <li key={n.href} className="overflow-hidden border-b border-bone/10">
                    <motion.a
                      href={n.href}
                      onClick={(e) => {
                        e.preventDefault();
                        go(n.href);
                      }}
                      className="group flex items-baseline gap-4 py-2 md:py-1"
                      initial={{ y: "100%" }}
                      animate={{ y: "0%" }}
                      exit={{ y: "100%" }}
                      transition={{ duration: 0.9, ease: EASE_EXPO, delay: 0.25 + i * 0.05 }}
                    >
                      <span className="t-label w-8 text-bone/40">{pad(i + 1)}</span>
                      <span className="text-[clamp(2.5rem,min(8vw,10.5svh),7.5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.06em] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-x-3">
                        {n.label}
                      </span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="gutter grid grid-cols-2 gap-6 pb-[var(--gutter)] pt-8 md:grid-cols-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="t-label space-y-1.5 text-bone/60">
                <p className="text-bone">Contact</p>
                <a className="block hover:text-bone" href={site.contact.phoneHref}>{site.contact.phone}</a>
                <a className="block hover:text-bone" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              </div>
              <div className="t-label space-y-1.5 text-bone/60">
                <p className="text-bone">Plant</p>
                <p>{site.contact.address.street}</p>
                <p>{site.contact.address.locality}</p>
              </div>
              <div className="t-label space-y-1.5 text-bone/60">
                <p className="text-bone">Follow</p>
                {site.social.map((s) => (
                  <a key={s.href} className="block hover:text-bone" href={s.href} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
