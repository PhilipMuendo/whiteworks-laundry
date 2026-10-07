export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const pad = (n: number, l = 2) => String(n).padStart(l, "0");
/** Map v from [a,b] to [0,1], clamped. */
export const progress = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_QUINT = [0.83, 0, 0.17, 1] as const;
