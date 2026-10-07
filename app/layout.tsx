import type { Metadata, Viewport } from "next";
import { Inter_Tight, Geist_Mono } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import "./globals.css";
import { site } from "@/config/site";
import { SmoothScroll } from "@/lib/smooth-scroll";

const display = Inter_Tight({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["400", "500", "600", "700"] });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.seo.title, template: `%s | ${site.name}` },
  description: site.seo.description,
  keywords: [...site.seo.keywords],
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
    locale: "en",
  },
  twitter: { card: "summary_large_image", title: site.seo.title, description: site.seo.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: site.brand.ink,
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DryCleaningOrLaundry",
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  telephone: site.contact.phone,
  email: site.contact.email,
  description: site.seo.description,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.contact.address.street,
    addressLocality: site.contact.address.locality,
    postalCode: site.contact.address.postalCode,
    addressCountry: site.contact.address.country || undefined,
  },
  sameAs: site.social.map((s) => s.href),
  areaServed: site.contact.address.locality,
  knowsAbout: [...site.seo.keywords],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Commercial laundry services",
    itemListElement: site.services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: `${s.name} service`, description: s.description },
    })),
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const brandVars = {
    "--brand-ink": site.brand.ink,
    "--brand-bone": site.brand.bone,
    "--brand-ash": site.brand.ash,
    "--brand-accent": site.brand.accent,
  } as CSSProperties;

  return (
    <html lang={site.locale} className={`${display.variable} ${mono.variable}`} style={brandVars}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll>{children}</SmoothScroll>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
