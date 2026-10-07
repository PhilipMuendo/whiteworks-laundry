/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION: the single source of truth for all client content.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Everything a client might want to change lives here: name, contact details,
 *  colours, statistics, industries, services, case studies and testimonials.
 *
 *  ⚠ PLACEHOLDERS
 *  Any item with `placeholder: true` is demo content, NOT a verified claim.
 *  While at least one placeholder statistic or case study is shown, the site
 *  renders a small "demo figures" footnote. Replace the value, then set
 *  `placeholder: false` (or delete the key) and the footnote disappears.
 *
 *  🖼  IMAGES
 *  Photography lives in /assets/images. To swap a photo, either overwrite the
 *  file with the same name, or import a new file below and point to it.
 *  All images are graded to a consistent monochrome look; see /IMAGES.md.
 */

import type { StaticImageData } from "next/image";

import hotel from "@/assets/images/hotel.jpg";
import hotelRoom from "@/assets/images/hotel-room.jpg";
import kitchen from "@/assets/images/kitchen.jpg";
import chef from "@/assets/images/chef.jpg";
import hospital from "@/assets/images/hospital.jpg";
import hospitalCorridor from "@/assets/images/hospital-corridor.jpg";
import gym from "@/assets/images/gym.jpg";
import spa from "@/assets/images/spa.jpg";
import corporate from "@/assets/images/corporate.jpg";
import sheets from "@/assets/images/sheets.jpg";
import shirts from "@/assets/images/shirts.jpg";
import shirtsRack from "@/assets/images/shirts-rack.jpg";
import towelsRolled from "@/assets/images/towels-rolled.jpg";
import linenGrey from "@/assets/images/linen-grey.jpg";
import linenCart from "@/assets/images/linen-cart.jpg";
import van from "@/assets/images/van.jpg";
import vanOpen from "@/assets/images/van-open.jpg";
import collectCart from "@/assets/images/collect-cart.jpg";
import sorting from "@/assets/images/sorting.jpg";
import drum from "@/assets/images/drum.jpg";
import dryers from "@/assets/images/dryers.jpg";
import pressing from "@/assets/images/pressing.jpg";
import folding from "@/assets/images/folding.jpg";
import machineHall from "@/assets/images/machine-hall.jpg";
import facilityHall from "@/assets/images/facility-hall.jpg";
import washerBank from "@/assets/images/washer-bank.jpg";
import washerRow from "@/assets/images/washer-row.jpg";
import pipes from "@/assets/images/pipes.jpg";
import finishingLine from "@/assets/images/finishing-line.jpg";
import workerLoad from "@/assets/images/worker-load.jpg";
import drumSteel from "@/assets/images/drum-steel.jpg";

export type Img = { src: StaticImageData; alt: string };

export type Stat = {
  /** Numeric part, animated by the odometer. */
  value: string;
  prefix?: string;
  suffix?: string;
  label: string;
  note?: string;
  placeholder?: boolean;
};

export type Industry = {
  id: string;
  name: string;
  line: string;
  items: string[];
  image: Img;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  image: Img;
};

export type ProcessStep = {
  id: string;
  verb: string;
  title: string;
  body: string;
  spec: string;
  image: Img;
};

export type CaseStudy = {
  id: string;
  sector: string;
  client: string;
  image: Img;
  metrics: { value: string; label: string }[];
  summary: string;
  quote?: { text: string; author: string; role: string };
  placeholder?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  /** Company identity. `name` is used in the logo, footer and metadata. */
  name: "Whiteworks",
  legalName: "Whiteworks Commercial Laundry Ltd.", // placeholder
  wordmark: "WHITEWORKS",
  /** Optional: path to an SVG/PNG logo in /public. If null, the wordmark is typeset. */
  logo: null as string | null,
  url: "https://whiteworks-laundry.vercel.app", // set the client domain when it exists
  locale: "en",

  brand: {
    ink: "#080808",
    bone: "#F5F5F0",
    ash: "#A0A0A0",
    /** The one accent. Used sparingly: signals, active states, the process tag. */
    accent: "#FF4A1C",
  },

  contact: {
    phone: "+00 000 000 000", // placeholder
    phoneHref: "tel:+00000000000",
    email: "quotes@example.com", // placeholder
    address: {
      street: "00 Industrial Way", // placeholder
      locality: "Your City",
      region: "",
      postalCode: "00000",
      country: "",
    },
    hours: "Plant operating Mon–Sat · Collections 7 days", // placeholder
  },

  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Instagram", href: "https://www.instagram.com/" },
  ],

  nav: [
    { label: "Industries", href: "#industries" },
    { label: "Services", href: "#services" },
    { label: "Process", href: "#process" },
    { label: "Cases", href: "#cases" },
  ],

  seo: {
    title: "Whiteworks | Commercial Laundry & Linen Services",
    description:
      "Commercial laundry and textile care for hotels, restaurants, healthcare, gyms and spas. Hotel linen services, uniform laundry and scheduled pickup and delivery, built for volume.",
    keywords: [
      "commercial laundry",
      "commercial laundry services",
      "hotel laundry",
      "hotel linen services",
      "industrial laundry",
      "commercial linen services",
      "uniform laundry",
      "laundry pickup and delivery",
    ],
  },

  hero: {
    support:
      "Commercial laundry and textile care for businesses where consistency isn't optional.",
  },

  // ── Statistics (THE SCALE OF CLEAN) ──────────────────────────────────────────
  stats: [
    { value: "250", suffix: "K+", label: "Kilograms processed / month", placeholder: true },
    { value: "24", suffix: "H", label: "Standard turnaround", placeholder: true },
    { value: "100", suffix: "+", label: "Businesses supplied", placeholder: true },
    { value: "7", suffix: "/7", label: "Collection schedule", placeholder: true },
  ] satisfies Stat[] as Stat[],

  // ── Industries (WHO WE SERVE) ────────────────────────────────────────────────
  industries: [
    {
      id: "hotels",
      name: "Hotels",
      line: "Every room turned. Every bed made with linen that's ready on time.",
      items: ["Bed linen", "Bath towels", "Robes", "F&B napery"],
      image: { src: hotel, alt: "Crisp white pillows and duvet on a hotel bed against a dark headboard" },
    },
    {
      id: "restaurants",
      name: "Restaurants",
      line: "Whites for the line, napery for the floor, and a reliable supply of both.",
      items: ["Chef whites", "Aprons", "Tablecloths", "Kitchen cloths"],
      image: { src: kitchen, alt: "Steam rising in a dim commercial kitchen with stainless steel equipment" },
    },
    {
      id: "healthcare",
      name: "Healthcare",
      line: "Controlled processing for textiles where hygiene is non-negotiable.",
      items: ["Patient linen", "Scrubs", "Gowns", "Privacy curtains"],
      image: { src: hospital, alt: "A made hospital bed in a quiet, low-lit ward" },
    },
    {
      id: "gyms",
      name: "Gyms",
      line: "High-turn towel programmes that keep pace with peak hours.",
      items: ["Gym towels", "Staff uniforms", "Mat covers", "Robes"],
      image: { src: gym, alt: "Rows of equipment in a dark gym lit by a single light strip" },
    },
    {
      id: "spas",
      name: "Spas",
      line: "Soft hand, bright white, no compromises on the guest experience.",
      items: ["Treatment linen", "Robes", "Spa towels", "Slippers"],
      image: { src: spa, alt: "A minimal steam room glowing with warm light" },
    },
    {
      id: "corporate",
      name: "Corporate",
      line: "Uniforms and workwear handled on a schedule your team never thinks about.",
      items: ["Uniforms", "Workwear", "Washroom linen", "Event textiles"],
      image: { src: corporate, alt: "A long glass-walled corporate corridor" },
    },
  ] satisfies Industry[] as Industry[],

  // ── Services (typographic list) ──────────────────────────────────────────────
  services: [
    { id: "linen", name: "Linen", description: "Flatwork: sheets, duvet covers, pillowcases and napery, pressed and folded to spec.", image: { src: sheets, alt: "Soft folds of white bed linen" } },
    { id: "uniforms", name: "Uniforms", description: "Front-of-house and back-of-house uniforms, returned on hangers, tracked by wearer.", image: { src: shirts, alt: "White shirts on hangers against bright windows" } },
    { id: "towels", name: "Towels", description: "Bath, pool, spa and gym towels: high-volume programmes, consistent softness.", image: { src: towelsRolled, alt: "Close-up of rolled white towels" } },
    { id: "workwear", name: "Workwear", description: "Durable garments for kitchens, plants and service teams, repaired as needed.", image: { src: shirtsRack, alt: "A rack of pressed shirts" } },
    { id: "textiles", name: "Textiles", description: "Curtains, covers, mats and specialty items with care matched to the fibre.", image: { src: linenGrey, alt: "Grey linen textile with natural creases" } },
    { id: "pickup", name: "Pickup", description: "Scheduled collection in sealed carts. Soiled stock leaves your site on time.", image: { src: linenCart, alt: "A steel cart loaded with white linen" } },
    { id: "delivery", name: "Delivery", description: "Clean stock delivered to your par levels, counted and ready to use.", image: { src: van, alt: "A white delivery van at night" } },
  ] satisfies Service[] as Service[],

  // ── Process (FROM DIRTY TO READY) ────────────────────────────────────────────
  process: [
    { id: "collect", verb: "Collect", title: "Scheduled collection", body: "Soiled stock is collected to a fixed schedule in sealed, tagged carts.", spec: "Sealed carts · Tagged at source", image: { src: collectCart, alt: "Linen cart being loaded inside the plant" } },
    { id: "sort", verb: "Sort", title: "Sorted by type & soil", body: "Every load is sorted by fibre, colour and soil level before it touches water.", spec: "Fibre · Colour · Soil class", image: { src: sorting, alt: "Two operators sorting white linen" } },
    { id: "wash", verb: "Wash", title: "Controlled wash", body: "Industrial washer-extractors run programmes matched to each textile.", spec: "Programmed chemistry · Temperature", image: { src: drum, alt: "Inside the drum of an industrial washer" } },
    { id: "dry", verb: "Dry", title: "Conditioned drying", body: "Tumble and finish drying protects fibres and keeps hand-feel consistent.", spec: "Moisture-controlled cycles", image: { src: dryers, alt: "A bank of industrial dryers" } },
    { id: "finish", verb: "Finish", title: "Pressed & folded", body: "Flatwork is pressed and folded; garments are finished on hangers.", spec: "Pressed · Folded · Hung", image: { src: pressing, alt: "A white shirt being pressed" } },
    { id: "inspect", verb: "Inspect", title: "Inspected by hand", body: "Each piece is checked for stains, damage and fold before it's packed.", spec: "Visual QC · Rewash or reject", image: { src: folding, alt: "An operator folding inspected towels" } },
    { id: "deliver", verb: "Deliver", title: "Delivered to par", body: "Counted, packed and delivered back to your par levels, ready for service.", spec: "Counted · Packed · On schedule", image: { src: vanOpen, alt: "A delivery van with its rear doors open" } },
  ] satisfies ProcessStep[] as ProcessStep[],

  // ── Facility (THIS IS WHAT SCALE LOOKS LIKE) ─────────────────────────────────
  // Replace with the client's own plant photography as soon as possible.
  facility: [
    { src: machineHall, alt: "Industrial washer-extractors in the machine hall", caption: "Machine hall" },
    { src: facilityHall, alt: "A wide view of the processing floor", caption: "Processing floor" },
    { src: washerBank, alt: "A heavy-duty washer-extractor next to a linen cart", caption: "Washer-extractor" },
    { src: pipes, alt: "Polished steam and water pipework", caption: "Steam & water" },
    { src: finishingLine, alt: "Operators at the folding line under an overhead conveyor", caption: "Finishing line" },
    { src: workerLoad, alt: "Two operators loading a washer", caption: "Loading" },
    { src: washerRow, alt: "A row of industrial washers", caption: "Wash line" },
    { src: drumSteel, alt: "Steel washer doors in perspective", caption: "Drum" },
  ] satisfies (Img & { caption: string })[] as (Img & { caption: string })[],

  // ── Quality (ENGINEERED FOR CONSISTENCY) ─────────────────────────────────────
  quality: [
    { id: "equipment", title: "Industrial equipment", body: "Commercial washer-extractors, dryers and finishing lines built for continuous duty.", param: "Duty cycle", value: "Continuous" },
    { id: "processing", title: "Controlled processing", body: "Wash programmes set per textile: time, temperature and chemistry, repeated exactly.", param: "Programmes", value: "Per textile" },
    { id: "inspection", title: "Quality inspection", body: "Every item is inspected by hand. Anything below standard is rewashed or replaced.", param: "Inspection", value: "100% of items" },
    { id: "care", title: "Textile care", body: "Gentle handling and the right finish extend the working life of your linen.", param: "Finish", value: "Fibre-matched" },
    { id: "schedule", title: "Scheduled collection", body: "Fixed collection windows planned around your operation, not ours.", param: "Windows", value: "Agreed in advance" },
    { id: "delivery", title: "Reliable delivery", body: "Clean stock delivered to agreed par levels, counted and signed for.", param: "Delivery", value: "To par level" },
  ],

  // ── Case studies ─────────────────────────────────────────────────────────────
  caseStudies: [
    {
      id: "hotel",
      sector: "Hotel",
      client: "180-room city hotel", // placeholder
      image: { src: hotelRoom, alt: "A made hotel bed with crisp white linen" },
      metrics: [
        { value: "12,000+", label: "Pieces / month" },
        { value: "24H", label: "Turnaround" },
        { value: "0", label: "Missed collections" },
      ],
      summary:
        "Moved from an in-house laundry room to a fully managed linen programme, freeing a floor of back-of-house space and two FTEs for guest-facing roles.",
      quote: { text: "We stopped talking about linen in the morning meeting. That's the whole review.", author: "Name Surname", role: "Director of Operations" },
      placeholder: true,
    },
    {
      id: "healthcare",
      sector: "Healthcare",
      client: "Private clinic group, 3 sites", // placeholder
      image: { src: hospitalCorridor, alt: "A long hospital corridor with beds along the wall" },
      metrics: [
        { value: "3", label: "Sites on one schedule" },
        { value: "8,500+", label: "Pieces / month" },
        { value: "100%", label: "Items inspected" },
      ],
      summary:
        "Consolidated three suppliers into one controlled process with sealed collection, separated soiled handling and a single delivery schedule across sites.",
      quote: { text: "Consistent, documented, on time. Exactly what an audit wants to see.", author: "Name Surname", role: "Facilities Manager" },
      placeholder: true,
    },
    {
      id: "restaurant",
      sector: "Restaurant",
      client: "Restaurant group, 6 kitchens", // placeholder
      image: { src: chef, alt: "A chef in whites working at a stainless steel station" },
      metrics: [
        { value: "6", label: "Kitchens supplied" },
        { value: "2×", label: "Weekly deliveries" },
        { value: "48H", label: "Uniform turnaround" },
      ],
      summary:
        "Whites, aprons and napery delivered to par twice a week, with uniforms tracked by wearer so every shift starts in a clean set.",
      quote: { text: "The whites come back right. Every time. That used to be a daily argument.", author: "Name Surname", role: "Executive Chef" },
      placeholder: true,
    },
  ] satisfies CaseStudy[] as CaseStudy[],

  // ── Quote experience ─────────────────────────────────────────────────────────
  quote: {
    businessTypes: ["Hotel", "Restaurant", "Healthcare", "Gym / Spa", "Corporate", "Other"],
    needs: ["Linen", "Towels", "Uniforms", "Full Laundry Service", "Pickup & Delivery"],
    volumes: [
      { id: "s", label: "Under 250 kg", hint: "per week" },
      { id: "m", label: "250 – 1,000 kg", hint: "per week" },
      { id: "l", label: "1,000 – 5,000 kg", hint: "per week" },
      { id: "xl", label: "5,000 kg +", hint: "per week" },
      { id: "unknown", label: "Not sure yet", hint: "we'll help you estimate" },
    ],
    /** Shown on the confirmation screen. */
    responseTime: "one business day", // placeholder: confirm with the client
  },
} as const;

/** True while any visible statistic or case study is still demo content. */
export const hasPlaceholderStats = site.stats.some((s) => s.placeholder);
export const hasPlaceholderCases = site.caseStudies.some((c) => c.placeholder);
