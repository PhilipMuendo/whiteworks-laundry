import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name}: the laundry behind your business`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: site.brand.ink,
          color: site.brand.bone,
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7 }}>
          <span>{site.wordmark}</span>
          <span>Commercial laundry · Textile care</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 128, fontWeight: 700, lineHeight: 0.86, letterSpacing: -6, textTransform: "uppercase" }}>
          <span>The laundry</span>
          <span style={{ color: "transparent", WebkitTextStroke: `2px ${site.brand.bone}` }}>behind</span>
          <span style={{ display: "flex" }}>
            your business<span style={{ color: site.brand.accent }}>.</span>
          </span>
        </div>
      </div>
    ),
    size,
  );
}
