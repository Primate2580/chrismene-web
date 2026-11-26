// Page layout model — shared by the public site and Admin → Developer → Page layout.
//
// settings.layout = {
//   sections: { home: [item, item, …], about: [...], "p-my-page": [...] },
//   pages:    [{ slug: "my-page", title: "My page", menu: true }]
// }
//
// An item is either
//   { uid, kind: "builtin", key: "testimonials", hidden?, flip? }
//   { uid, kind: "custom",  type: "media", hidden?, anchor?, data: { … } }
//
// When a page has no saved list, the original order below is used.

export const PAGE_LABELS = {
  home: "Home",
  about: "About",
  programs: "Programs",
  events: "Events",
  platforms: "Platforms",
  resources: "Resources",
  store: "Store",
  connect: "Connect",
};

export const PAGE_PATHS = {
  home: "/",
  about: "/about",
  programs: "/programs",
  events: "/events",
  platforms: "/platforms",
  resources: "/resources",
  store: "/store",
  connect: "/connect",
};

/** Ready-made sections that already exist on the site. */
export const BUILTIN = {
  programs: { label: "Programme cards", edit: "site" },
  events: { label: "Upcoming events", edit: "events" },
  live: { label: "Leadership Live", edit: "content:home" },
  testimonials: { label: "Testimonials", edit: "content:home" },
  book: { label: "Featured book", edit: "content:home" },
  org: { label: "Featured organisation", edit: "content:home" },
  story: { label: "About Chris (story + gallery)", edit: "content:about", flip: true },
  mission: { label: "Mission & Vision", edit: "content:about" },
  values: { label: "What matters (four values)", edit: "content:about" },
  stage: { label: "On stage / speaking", edit: "content:about", flip: true },
  articles: { label: "Articles", edit: "articles" },
  videos: { label: "Videos", edit: "videos" },
  podcast: { label: "Podcast", edit: "podcasts" },
  audio: { label: "Audio", edit: "audio" },
  books: { label: "Store books", edit: "content:store" },
  form: { label: "Contact form", edit: "content:connect" },
};

export const PAGE_DEFAULTS = {
  home: ["programs", "events", "live", "testimonials", "book", "org"],
  about: ["story", "mission", "values", "stage"],
  programs: ["programs"],
  events: ["events", "live"],
  platforms: ["live", "testimonials"],
  resources: ["articles", "videos", "podcast", "audio"],
  store: ["books"],
  connect: ["form"],
};

/** The kinds of new section an editor can add. */
export const CUSTOM_TYPES = {
  media: { label: "Image & text", desc: "A picture next to, above or below your words. Choose which side, size and shape." },
  text: { label: "Text", desc: "A heading and paragraphs, with an optional button." },
  gallery: { label: "Image gallery", desc: "A grid of pictures in the order you choose." },
  cta: { label: "Call to action", desc: "A bold banner with a message and a button." },
  video: { label: "Video", desc: "Upload a video or paste a YouTube / Vimeo link." },
  quote: { label: "Quote", desc: "A large pull-quote with a name." },
  spacer: { label: "Spacer", desc: "Empty space (or a thin line) between sections." },
};

export const THEMES = [
  ["light", "Light"],
  ["dark", "Dark"],
  ["gold", "Gold accent"],
  ["soft", "Soft grey"],
  ["custom", "My own colour"],
];

export const SPACING = [
  ["none", "None"],
  ["small", "Small"],
  ["medium", "Medium"],
  ["large", "Large"],
];

export const SHAPES = [
  ["square", "Square corners"],
  ["rounded", "Rounded corners"],
  ["pill", "Very round"],
  ["circle", "Circle (square photo)"],
  ["arch", "Arch"],
];

export const RATIOS = [
  ["auto", "Original shape"],
  ["1 / 1", "Square"],
  ["4 / 3", "Landscape 4:3"],
  ["3 / 2", "Landscape 3:2"],
  ["16 / 9", "Wide 16:9"],
  ["3 / 4", "Portrait 3:4"],
  ["2 / 3", "Tall portrait 2:3"],
];

const BLANKS = {
  media: {
    eyebrow: "",
    heading: "Your *heading* here",
    body: "Write your text here. Leave a blank line between paragraphs.",
    buttonText: "",
    buttonLink: "",
    images: [],
    position: "right", // left | right | top | bottom  (where the picture sits)
    imageWidth: 48, // % of the row
    vAlign: "center", // start | center | end   (side layouts)
    hAlign: "center", // left | center | right (top / bottom layouts)
    textAlign: "left",
    arrange: "grid", // grid | stack | overlap (when there are several pictures)
    shape: "rounded",
    ratio: "auto",
    nudgeX: 0,
    nudgeY: 0,
    theme: "light",
    bgColor: "#f4efe6",
    padTop: "medium",
    padBottom: "medium",
  },
  text: {
    eyebrow: "",
    heading: "Your *heading* here",
    body: "Write your text here. Leave a blank line between paragraphs.",
    buttonText: "",
    buttonLink: "",
    textAlign: "left",
    width: "medium", // narrow | medium | wide
    theme: "light",
    bgColor: "#f4efe6",
    padTop: "medium",
    padBottom: "medium",
  },
  gallery: {
    heading: "",
    images: [],
    columns: 3,
    gap: "medium",
    shape: "rounded",
    ratio: "4 / 3",
    theme: "light",
    bgColor: "#f4efe6",
    padTop: "medium",
    padBottom: "medium",
  },
  cta: {
    heading: "Ready to *begin*?",
    body: "A short line that invites people to take the next step.",
    buttonText: "Get in touch",
    buttonLink: "/connect",
    textAlign: "center",
    theme: "dark",
    bgColor: "#102a43",
    padTop: "large",
    padBottom: "large",
  },
  video: {
    heading: "",
    url: "",
    caption: "",
    width: "medium",
    theme: "light",
    bgColor: "#f4efe6",
    padTop: "medium",
    padBottom: "medium",
  },
  quote: {
    quote: "A short quote that deserves to stand out.",
    name: "",
    textAlign: "center",
    theme: "soft",
    bgColor: "#f4efe6",
    padTop: "large",
    padBottom: "large",
  },
  spacer: {
    height: 60,
    line: false,
    theme: "light",
    bgColor: "#ffffff",
  },
};

export const uid = () => "x" + Math.random().toString(36).slice(2, 9);

export const blankBlock = (type) => ({
  uid: uid(),
  kind: "custom",
  type,
  anchor: "",
  data: structuredClone(BLANKS[type]),
});

export const builtinItem = (key) => ({ uid: key, kind: "builtin", key });

/** Letters, numbers and dashes only — used for #links and /p/ page addresses. */
export const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const valid = (it) =>
  it &&
  typeof it === "object" &&
  ((it.kind === "builtin" && BUILTIN[it.key]) || (it.kind === "custom" && CUSTOM_TYPES[it.type] && it.data && typeof it.data === "object"));

/** The list of sections to show on a page — saved by the editor, or the original order. */
export function resolveLayout(settings, page) {
  const saved = settings?.layout?.sections?.[page];
  if (Array.isArray(saved)) {
    const seen = new Set();
    return saved
      .filter(valid)
      .map((it) => (it.kind === "builtin" ? { ...it, uid: it.key } : { ...it, data: { ...BLANKS[it.type], ...it.data } }))
      .filter((it) => (seen.has(it.uid) ? false : seen.add(it.uid)));
  }
  return (PAGE_DEFAULTS[page] || []).map(builtinItem);
}

export const extraPages = (settings) =>
  (Array.isArray(settings?.layout?.pages) ? settings.layout.pages : []).filter((p) => p && p.slug && p.title);

export const pageKey = (slug) => `p-${slug}`;

/** Black or white, whichever is easier to read on this colour. */
export function readableOn(hex = "#ffffff") {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#111111";
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#111111" : "#ffffff";
}
