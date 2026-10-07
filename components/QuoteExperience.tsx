"use client";

import { usePrefersReducedMotion } from "@/lib/useMedia";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { site } from "@/config/site";
import { EASE_EXPO, pad } from "@/lib/utils";
import { RevealLines } from "./ui/Reveal";
import Arrow from "./ui/Arrow";

/*
 * HOW MUCH CAN WE TAKE OFF YOUR PLATE?
 * A conversational brief, one question at a time. Answers assemble into a
 * plain-English sentence on the left, so the visitor can see their own
 * request being written. Keyboard: 1–6 to pick, Enter to continue.
 */

type Data = {
  business: string;
  needs: string[];
  volume: string;
  location: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string; // honeypot
};

const STEPS = ["Business", "Needs", "Volume", "Location", "Contact"] as const;
const EMPTY: Data = { business: "", needs: [], volume: "", location: "", name: "", company: "", email: "", phone: "", website: "" };
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function Option({
  index,
  label,
  hint,
  selected,
  multi,
  onSelect,
  name,
}: {
  index: number;
  label: string;
  hint?: string;
  selected: boolean;
  multi?: boolean;
  onSelect: () => void;
  name: string;
}) {
  return (
    <motion.label
      className="group relative flex cursor-pointer items-center gap-4 border-t border-ink/15 py-4 md:gap-6 md:py-5"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE_EXPO, delay: 0.15 + index * 0.05 }}
    >
      <input
        type={multi ? "checkbox" : "radio"}
        name={name}
        checked={selected}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-left bg-ink transition-transform duration-500 ease-[var(--ease-expo)]"
        style={{ transform: `scaleX(${selected ? 1 : 0})` }}
      />
      <span
        aria-hidden="true"
        className={`relative z-10 ml-2 grid h-7 w-7 shrink-0 place-items-center border font-mono text-[11px] transition-colors duration-300 md:ml-3 ${
          selected ? "border-bone text-bone" : "border-ink/30 text-ink/60 group-hover:border-ink"
        }`}
      >
        {index + 1}
      </span>
      <span
        className={`relative z-10 text-[clamp(1.6rem,3.2vw,3.25rem)] font-semibold uppercase leading-none tracking-[-0.045em] transition-[color,transform] duration-500 ease-[var(--ease-expo)] group-hover:translate-x-2 ${
          selected ? "text-bone" : "text-ink"
        }`}
      >
        {label}
      </span>
      {hint && <span className={`t-label relative z-10 ml-auto hidden md:block ${selected ? "text-bone/60" : "text-ink/45"}`}>{hint}</span>}
      <span
        aria-hidden="true"
        className={`relative z-10 mr-3 h-3 w-3 shrink-0 transition-colors duration-300 ${hint ? "md:ml-4" : "ml-auto"} ${
          selected ? "bg-signal" : multi ? "border border-ink/30" : "rounded-full border border-ink/30"
        }`}
      />
    </motion.label>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
  error,
  big,
  autoFocus,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  big?: boolean;
  autoFocus?: boolean;
  inputMode?: "text" | "email" | "tel";
}) {
  const id = useId();
  return (
    <div className="relative">
      <label htmlFor={id} className="t-label text-ink/55">
        {label}
        {required ? "" : " (optional)"}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        required={required}
        autoFocus={autoFocus}
        inputMode={inputMode}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`peer mt-2 block w-full rounded-none border-0 border-b bg-transparent pb-2 font-semibold tracking-[-0.04em] text-ink outline-none placeholder:text-ink/20 focus:border-ink focus-visible:outline-none ${
          big ? "text-[clamp(2rem,5vw,4.5rem)] leading-none" : "text-[clamp(1.35rem,2.2vw,2rem)]"
        } ${error ? "border-signal" : "border-ink/25"}`}
      />
      <span className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-[var(--ease-expo)] peer-focus:scale-x-100" />
      {error && (
        <p id={`${id}-err`} className="t-label absolute -bottom-6 left-0 text-signal" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function QuoteExperience() {
  const reduce = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<Data>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusedStep = useRef(0);
  const advanceTimer = useRef<number | null>(null);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setData((d) => ({ ...d, [k]: v }));

  const valid = useMemo(() => {
    switch (step) {
      case 0: return !!data.business;
      case 1: return data.needs.length > 0;
      case 2: return !!data.volume;
      case 3: return data.location.trim().length > 1;
      case 4: return data.name.trim().length > 1 && emailOk(data.email);
      default: return false;
    }
  }, [step, data]);

  const go = useCallback((to: number) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setDir(to > step ? 1 : -1);
    setTouched(false);
    setStep(to);
  }, [step]);

  const submit = useCallback(async () => {
    setStatus("sending");
    try {
      const volume = site.quote.volumes.find((v) => v.id === data.volume);
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, volume: volume ? `${volume.label} ${volume.hint}` : data.volume }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      setDir(1);
      setStep(5);
    } catch {
      setStatus("error");
    }
  }, [data]);

  const next = useCallback(() => {
    setTouched(true);
    if (!valid) return;
    if (step === 4) void submit();
    else go(step + 1);
  }, [valid, step, go, submit]);

  // number keys pick options on choice steps
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = sectionRef.current;
      if (!el || !el.contains(document.activeElement) || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).tagName === "INPUT" && (e.target as HTMLInputElement).type !== "radio" && (e.target as HTMLInputElement).type !== "checkbox") return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1) return;
      if (step === 0 && site.quote.businessTypes[n - 1]) pickBusiness(site.quote.businessTypes[n - 1]);
      if (step === 1 && site.quote.needs[n - 1]) toggleNeed(site.quote.needs[n - 1]);
      if (step === 2 && site.quote.volumes[n - 1]) pickVolume(site.quote.volumes[n - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const autoAdvance = (to: number) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => go(to), reduce ? 0 : 420);
  };
  const pickBusiness = (b: string) => {
    set("business", b);
    autoAdvance(1);
  };
  const toggleNeed = (n: string) => set("needs", data.needs.includes(n) ? data.needs.filter((x) => x !== n) : [...data.needs, n]);
  const pickVolume = (v: string) => {
    set("volume", v);
    autoAdvance(3);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    next();
  };

  // the brief, written as a sentence
  const vol = site.quote.volumes.find((v) => v.id === data.volume);
  const brief: ReactNode[] = [];
  const mark = (t: string, k: string) => (
    <motion.span key={k} className="text-ink" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {t}
    </motion.span>
  );
  brief.push(<span key="a">A </span>, data.business ? mark(data.business.toLowerCase().replace("other", "business"), "b") : <span key="b" className="text-ink/25">______</span>);
  brief.push(<span key="c"> needing </span>, data.needs.length ? mark(data.needs.join(", ").toLowerCase(), "n") : <span key="n" className="text-ink/25">______</span>);
  brief.push(<span key="d">, around </span>, vol ? mark(vol.id === "unknown" ? "an unknown volume" : `${vol.label} a week`, "v") : <span key="v" className="text-ink/25">___ kg</span>);
  brief.push(<span key="e">, in </span>, data.location ? mark(data.location, "l") : <span key="l" className="text-ink/25">______</span>, <span key="f">.</span>);

  const questions = [
    "What kind of business do you run?",
    "What do you need help with?",
    "Approximate volume?",
    "Where are you located?",
    "Who should we send the quote to?",
  ];

  const variants = {
    enter: (d: number) => ({ opacity: 0, y: reduce ? 0 : d * 60 }),
    center: { opacity: 1, y: 0 },
    exit: (d: number) => ({ opacity: 0, y: reduce ? 0 : d * -40 }),
  };

  return (
    <section ref={sectionRef} id="quote" aria-labelledby="quote-title" className="relative bg-bone pb-[12vh] pt-[16vh] text-ink">
      <div className="gutter">
        <RevealLines
          as="h2"
          className="uppercase"
          lineClassName="t-display"
          lines={["How much", "can we", "take off", <>your plate<span key="q" className="text-signal">?</span></>]}
        />
        <span id="quote-title" className="sr-only">
          Request a quote: how much can we take off your plate?
        </span>
      </div>

      <div className="gutter mt-[10vh] grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-6">
        {/* left: progress + live brief */}
        <aside className="md:col-span-4">
          <div className="md:sticky md:top-[14vh]">
            <ol className="flex gap-2 md:block md:space-y-2" aria-label="Quote progress">
              {STEPS.map((s, i) => {
                const state = step > i ? "done" : step === i ? "current" : "todo";
                return (
                  <li key={s} className="t-label flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-3" aria-current={state === "current" ? "step" : undefined}>
                    <span className="relative block h-[2px] w-full bg-ink/15 md:h-px md:w-10">
                      <motion.span
                        className="absolute inset-0 origin-left bg-ink"
                        initial={false}
                        animate={{ scaleX: state === "todo" ? 0 : 1, backgroundColor: state === "current" ? site.brand.accent : site.brand.ink }}
                        transition={{ duration: 0.6, ease: EASE_EXPO }}
                      />
                    </span>
                    <span className={`hidden md:inline ${state === "todo" ? "text-ink/35" : "text-ink"}`}>
                      {pad(i + 1)} {s}
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-10 hidden md:block">
              <p className="t-label text-ink/45">Your brief</p>
              <p className="t-heading mt-4 max-w-[18ch] text-ink/45" aria-live="polite">
                {brief}
              </p>
            </div>
          </div>
        </aside>

        {/* right: the question */}
        <div className="md:col-span-8">
          <form onSubmit={onSubmit} noValidate className="relative min-h-[34rem]">
            {/* honeypot */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website <input tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => set("website", e.target.value)} />
              </label>
            </div>

            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={step}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: EASE_EXPO }}
                // move focus to the new question once it has entered (not the outgoing one),
                // so keyboard shortcuts and screen readers follow the conversation
                onAnimationComplete={(def) => {
                  if (def !== "center" || focusedStep.current === step) return;
                  focusedStep.current = step;
                  // never steal focus from someone who is already typing
                  const a = document.activeElement as HTMLElement | null;
                  if (a && a.isConnected && a.tagName === "INPUT" && a.getAttribute("type") !== "radio" && a.getAttribute("type") !== "checkbox") return;
                  headingRef.current?.focus({ preventScroll: true });
                }}
              >
                {step < 5 && (
                  <>
                    <p className="t-label text-ink/50">
                      Question {pad(step + 1)} / {pad(STEPS.length)}
                    </p>
                    <h3 ref={headingRef} tabIndex={-1} className="mt-4 max-w-[18ch] text-[clamp(2.25rem,4.6vw,5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.05em] outline-none">
                      {questions[step]}
                    </h3>
                  </>
                )}

                {step === 0 && (
                  <fieldset className="mt-10">
                    <legend className="sr-only">{questions[0]}</legend>
                    {site.quote.businessTypes.map((b, i) => (
                      <Option key={b} index={i} label={b} name="business" selected={data.business === b} onSelect={() => pickBusiness(b)} />
                    ))}
                  </fieldset>
                )}

                {step === 1 && (
                  <fieldset className="mt-10">
                    <legend className="sr-only">{questions[1]} Select all that apply.</legend>
                    <p className="t-label -mt-6 mb-6 text-ink/50">Select all that apply</p>
                    {site.quote.needs.map((n, i) => (
                      <Option key={n} index={i} label={n} name="needs" multi selected={data.needs.includes(n)} onSelect={() => toggleNeed(n)} />
                    ))}
                  </fieldset>
                )}

                {step === 2 && (
                  <fieldset className="mt-10">
                    <legend className="sr-only">{questions[2]}</legend>
                    {site.quote.volumes.map((v, i) => (
                      <Option key={v.id} index={i} label={v.label} hint={v.hint} name="volume" selected={data.volume === v.id} onSelect={() => pickVolume(v.id)} />
                    ))}
                  </fieldset>
                )}

                {step === 3 && (
                  <div className="mt-14 max-w-2xl">
                    <Field
                      label="City or area"
                      value={data.location}
                      onChange={(v) => set("location", v)}
                      autoComplete="address-level2"
                      required
                      big
                      error={touched && data.location.trim().length < 2 ? "Tell us where you're based" : undefined}
                    />
                  </div>
                )}

                {step === 4 && (
                  <div className="mt-14 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
                    <Field label="Your name" value={data.name} onChange={(v) => set("name", v)} autoComplete="name" required error={touched && data.name.trim().length < 2 ? "Please add your name" : undefined} />
                    <Field label="Company" value={data.company} onChange={(v) => set("company", v)} autoComplete="organization" />
                    <Field label="Email" type="email" inputMode="email" value={data.email} onChange={(v) => set("email", v)} autoComplete="email" required error={touched && !emailOk(data.email) ? "Enter a valid email" : undefined} />
                    <Field label="Phone" type="tel" inputMode="tel" value={data.phone} onChange={(v) => set("phone", v)} autoComplete="tel" />
                  </div>
                )}

                {step === 5 && (
                  <div className="py-6" role="status">
                    <p className="t-label text-ink/50">Brief received</p>
                    <h3 ref={headingRef} tabIndex={-1} className="t-display mt-4 uppercase outline-none">
                      Consider it<br />handled<span className="text-signal">.</span>
                    </h3>
                    <p className="t-lead mt-8 max-w-[38ch] text-ink/75">
                      Thanks{data.name ? `, ${data.name.split(" ")[0]}` : ""}. We&apos;ll review your brief and come back with a quote within {site.quote.responseTime}.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* controls */}
            {step < 5 && (
              <div className="mt-12 flex items-center justify-between gap-4 border-t border-ink/15 pt-6">
                <button
                  type="button"
                  onClick={() => go(step - 1)}
                  disabled={step === 0}
                  className="t-label inline-flex items-center gap-2 py-2 text-ink transition-opacity disabled:pointer-events-none disabled:opacity-0"
                >
                  <Arrow dir="left" className="h-3.5 w-3.5" /> Back
                </button>
                <div className="flex items-center gap-5">
                  <span className="t-label hidden text-ink/40 md:inline">
                    {step <= 2 ? "Press 1–" + (step === 0 ? site.quote.businessTypes.length : step === 1 ? site.quote.needs.length : site.quote.volumes.length) : "Press Enter ↵"}
                  </span>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    aria-disabled={!valid}
                    className={`group relative inline-flex h-14 items-center gap-3 overflow-hidden px-6 text-[0.85rem] font-semibold uppercase tracking-[0.06em] transition-colors duration-300 md:h-16 md:px-8 ${
                      valid ? "bg-ink text-bone" : "bg-ink/10 text-ink/40"
                    }`}
                  >
                    <span className="absolute inset-0 origin-bottom scale-y-0 bg-signal transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-y-100" style={{ display: valid ? undefined : "none" }} />
                    <span className="relative">{step === 4 ? (status === "sending" ? "Sending…" : "Get my quote") : "Continue"}</span>
                    <Arrow className="relative h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}
            {status === "error" && (
              <p className="t-label mt-4 text-signal" role="alert">
                Something went wrong sending your brief. Please email{" "}
                <a className="underline" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>{" "}
                or try again.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
