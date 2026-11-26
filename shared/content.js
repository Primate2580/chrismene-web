// Registry of every piece of content that can be edited from
// Admin → Developer → Page content.
//
//  type: "text" | "textarea" | "link" | "image"
//  btn:  true  = this is a button label (also listed on the "All buttons" tab)
//  from: for images/text whose normal value lives in the Site settings
//        (e.g. "images.hero") — used as the default until it is edited here.
//
// In headings, put *stars* around words to make them italic and press Enter
// for a new line.

const t = (key, label, def = "", o = {}) => ({ key, label, type: "text", def, ...o });
const ta = (key, label, def = "", o = {}) => ({ key, label, type: "textarea", def, ...o });
const bt = (key, label, def = "", o = {}) => ({ key, label, type: "text", def, btn: true, ...o });
const lk = (key, label, def = "", o = {}) => ({ key, label, type: "link", def, ...o });
const im = (key, label, from, o = {}) => ({ key, label, type: "image", def: "", from, ...o });

function hero(p, { lead, after = "", title, desc, b1 = "", b1l = "", b2 = "", b2l = "", image = "images.innerHero", home = false }) {
  return {
    id: "hero",
    label: "Hero (top of page)",
    fields: [
      t(`${p}.hero.lead`, "Italic first word(s)", lead),
      t(`${p}.hero.after`, "Plain words after it (same line)", after),
      t(`${p}.hero.title`, "Second line", title),
      ta(`${p}.hero.desc`, "Description", desc, { rows: 3 }),
      bt(`${p}.hero.b1`, "Button 1 text (empty = hidden)", b1),
      lk(`${p}.hero.b1l`, "Button 1 link", b1l),
      ...(home ? [bt(`${p}.hero.b2`, "Button 2 text (empty = hidden)", b2), lk(`${p}.hero.b2l`, "Button 2 link", b2l)] : []),
      im(`${p}.hero.image`, home ? "Hero portrait (cut-out)" : "Hero photo", image),
    ],
  };
}

export const PAGES = [
  {
    id: "global",
    label: "Site-wide (header, newsletter, footer)",
    sections: [
      {
        id: "header",
        label: "Header menu",
        fields: [
          bt("nav.cta", "Subscribe button", "Subscribe Now"),
          t("nav.meet", "Menu: Meet", "Meet Chris"),
          t("nav.programs", "Menu: Programs", "Programs"),
          t("nav.events", "Menu: Events", "Events"),
          t("nav.platforms", "Menu: Platforms", "Platforms"),
          t("nav.resources", "Menu: Resources", "Resources"),
          t("nav.connect", "Menu: Connect", "Connect"),
          t("nav.store", "Menu: Store", "Store"),
        ],
      },
      {
        id: "newsletter",
        label: "Newsletter (every page)",
        fields: [
          t("news.l1i", "Line 1 — italic word", "Lead"),
          t("news.l1", "Line 1 — rest", "Better."),
          t("news.l2i", "Line 2 — italic word", "Live"),
          t("news.l2", "Line 2 — rest", "Deeper."),
          ta("news.text", "Text under the headline", "", { rows: 2, from: "newsletter.text" }),
          t("news.ph1", "First-name box placeholder", "First Name"),
          t("news.ph2", "Email box placeholder", "Email Address"),
          bt("news.btn", "Button text", "Subscribe Now"),
          im("news.image", "Newsletter photo", "images.newsletter"),
        ],
      },
      {
        id: "footer",
        label: "Footer",
        fields: [
          t("foot.tag", "Tagline", "Faith · Purpose · People"),
          t("foot.copy", "Copyright name", "Chris Sola Mene. All Rights Reserved"),
        ],
      },
    ],
  },
  {
    id: "home",
    label: "Home",
    sections: [
      hero("home", {
        lead: "Hi,",
        after: " I'm",
        title: "Chris Mene",
        desc: "A global speaker, strategic leadership expert and author, who is focused on shifting people's mindsets so they can see possibilities and become those possibilities.",
        b1: "Book A Discovery Call",
        b1l: "/connect",
        b2: "Watch Chris Speak",
        b2l: "/resources#videos",
        image: "images.hero",
        home: true,
      }),
      {
        id: "programs",
        label: "Main Program heading",
        fields: [t("progs.em", "Italic word", "Main"), t("progs.title", "Second word", "Program")],
      },
      {
        id: "events",
        label: "Upcoming events heading",
        fields: [t("ev.em", "Italic word", "Upcoming"), t("ev.title", "Second word", "Events")],
      },
      {
        id: "live",
        label: "Leadership Live",
        fields: [
          t("live.l1", "Heading line 1", "Leadership Live"),
          t("live.em", "Italic word", "with"),
          t("live.l2", "Heading line 2", "Chris Mene"),
          t("live.sub", "Sub-heading", "Let’s discuss all things leadership and more…"),
          ta("live.title", "Card title", "Leadership\nLive", { rows: 2 }),
          t("live.time", "Show times", "4PM EST | 9PM UK | NIG"),
          bt("live.prev", "Button text", "Watch Previous Episodes"),
          lk("live.prevLink", "Button link", "/resources#videos"),
        ],
      },
      {
        id: "testimonials",
        label: "Testimonials",
        fields: [
          t("testi.label", "Small label", "TESTIMONIALS"),
          ta("testi.heading", "Heading", "*Great* people saying *great* things", { rows: 2 }),
          ta("testi.q1", "Quote 1", "The impact has been life-changing—spiritually, emotionally, and professionally.", { rows: 2 }),
          t("testi.n1", "Name 1", "Michael O. – Toronto, Canada"),
          ta("testi.q2", "Quote 2", "My mindset shifted completely. I now live with clarity, faith, and confidence.", { rows: 2 }),
          t("testi.n2", "Name 2", "Sophia E. – Johannesburg, South Africa"),
          ta("testi.q3", "Quote 3", "I now approach life and leadership with renewed vision and purpose.", { rows: 2 }),
          t("testi.n3", "Name 3", "Tunde B. – Accra, Ghana"),
        ],
      },
      {
        id: "book",
        label: "Featured book",
        fields: [
          t("book.heading", "Heading", "*Featured* Books"),
          bt("book.viewall", "View-all link text", "View All →"),
          ta("book.title", "Book title", "SHIFTS: 6 Steps to Transform Your Mindset and Elevate Your Leadership 1st Edition", { rows: 2 }),
          ta("book.text1", "Paragraph 1", "Your step-by-step guide to master the art of transformational leadership. SHIFTS provides a step-by-step blueprint for leaders to create lasting positive change, drawing on decades of leadership coaching experience and teaching the importance of personal development, cultural awareness, and leading effectively in a globalized world.", { rows: 5 }),
          ta("book.text2", "Paragraph 2", "This essential read introduces the SHIFTS framework, a unique methodology that guides leaders through six transformative steps:", { rows: 3 }),
          ta("book.steps", "Numbered list (one per line, “Word: text”)", "See: Cultivate vision to recognize opportunities and challenges.\nHear: Listen deeply to understand spoken and unspoken messages.\nInsight: Synthesize information to gain clear perspectives for decision-making.\nFormulate: Develop innovative and practical strategies from insights.\nTransform: Implement strategies to drive change and achieve goals.\nSucceed: Sustain positive change and inspire continuous growth.", { rows: 7 }),
          ta("book.text3", "Closing paragraph", "SHIFTS is a must-have for current and aspiring leaders seeking to develop essential leadership skills applicable to any role and industry.", { rows: 3 }),
          bt("book.cta", "Button text", "Get the Book Now →"),
          lk("book.ctaLink", "Button link", "/store"),
        ],
      },
    ],
  },
  {
    id: "about",
    label: "About",
    sections: [
      hero("about", {
        lead: "Meet",
        title: "Chris Mene",
        desc: "A teacher, communicator, and voice for purposeful living — passionate about helping people discover who they are, grow in faith, and live with intention.",
        b1: "Discover My Story",
        b1l: "#about-chris",
      }),
      {
        id: "story",
        label: "The Story",
        fields: [
          t("story.label", "Small label", "The Story"),
          t("story.heading", "Heading", "About"),
          ta("story.intro", "Intro", "Chris Mene is passionate about helping people discover purpose, deepen their faith, and become intentional about the lives they are building.", { rows: 3 }),
          ta("story.text", "Paragraph", "Through teaching, speaking, writing, and ministry work, Chris creates spaces where people can think deeply, ask honest questions, and grow into who they were created to become.", { rows: 4 }),
          im("story.image", "Portrait", "images.aboutPortrait"),
        ],
      },
      {
        id: "mission",
        label: "Mission & Vision",
        fields: [
          t("mv.mh", "Mission heading", "My *Mission*"),
          ta("mv.mt", "Mission text", "To help people discover purpose, deepen their faith, and become intentional about the lives they are building. I believe meaningful change begins with the way we think, live, and relate with others.", { rows: 4 }),
          t("mv.vh", "Vision heading", "My *Vision*"),
          ta("mv.vt", "Vision text", "To see a generation of people living with clarity, faith, courage, and purpose — becoming who they were created to be and making a meaningful difference wherever they are.", { rows: 4 }),
        ],
      },
      {
        id: "values",
        label: "What matters",
        fields: [
          t("val.label", "Small label", "What I'm About"),
          ta("val.heading", "Heading", "*What*\nmatters.", { rows: 2 }),
          ta("val.intro", "Intro", "The things I believe in shape the way I teach, speak, lead, create, and relate with people. These are some of the ideas at the heart of my work and my life.", { rows: 3 }),
          t("val.t1", "Card 1 title", "Faith"),
          ta("val.d1", "Card 1 text", "Faith is more than something we profess. It shapes how we see ourselves, understand our world, navigate uncertainty, and live with conviction.", { rows: 3 }),
          t("val.t2", "Card 2 title", "Purpose"),
          ta("val.d2", "Card 2 text", "I believe every person carries something meaningful to contribute. Purpose begins with understanding who you are and grows through intentional action.", { rows: 3 }),
          t("val.t3", "Card 3 title", "Leadership"),
          ta("val.d3", "Card 3 text", "Leadership begins with responsibility. It is about becoming the kind of person whose choices, character, and example create room for others to grow.", { rows: 3 }),
          t("val.t4", "Card 4 title", "People"),
          ta("val.d4", "Card 4 text", "Growth happens in relationship. I care about honest conversations, meaningful connections, and creating spaces where people feel seen, challenged, and encouraged.", { rows: 3 }),
          ta("val.quote", "Closing quote", "The goal is not simply to live a successful life, but to live a meaningful one.", { rows: 2 }),
        ],
      },
      {
        id: "stage",
        label: "On stage",
        fields: [
          t("stage.title", "Title", "Chris Mene"),
          t("stage.em", "Italic line", "on stage"),
          t("stage.eyebrow", "Small label", "Speaking & Teaching"),
          ta("stage.desc", "Description", "Chris creates thoughtful spaces for people to explore faith, purpose, leadership, and the realities of everyday life. Through speaking and teaching, he brings ideas to life in ways that encourage people to think, grow, and take action.", { rows: 4 }),
          bt("stage.btn", "Button text", "Invite Chris to Speak"),
          lk("stage.btnLink", "Button link", "/connect"),
          t("stage.label", "Photo caption", "Watch Chris Speak"),
          im("stage.image", "On-stage photo", "images.stage"),
        ],
      },
    ],
  },
  {
    id: "programs",
    label: "Programs",
    sections: [hero("programs", { lead: "Explore", title: "Programs", desc: "Programs designed to help you grow in leadership, purpose and faith." })],
  },
  {
    id: "events",
    label: "Events",
    sections: [hero("events", { lead: "Upcoming", title: "Events", desc: "Gatherings, conferences and teaching moments to join." })],
  },
  {
    id: "platforms",
    label: "Platforms",
    sections: [hero("platforms", { lead: "Our", title: "Platforms", desc: "Where to watch, listen and learn with Chris every week." })],
  },
  {
    id: "resources",
    label: "Resources",
    sections: [
      hero("resources", { lead: "Explore", title: "Resources", desc: "Articles, videos, podcast episodes and audio to help you lead better and live deeper." }),
      {
        id: "headings",
        label: "Section headings & buttons",
        fields: [
          t("res.articles", "Articles heading", "Articles"),
          t("res.videos", "Videos heading", "Videos"),
          t("res.podcast", "Podcast heading", "Podcast"),
          t("res.audio", "Audio heading", "Audio"),
          bt("res.moreVideos", "Videos: “view all” button", "View all videos"),
          bt("res.morePodcast", "Podcast: “view all” button", "View all episodes"),
          bt("res.moreAudio", "Audio: “view all” button", "View all audio"),
          bt("res.less", "“Show less” button", "Show less"),
        ],
      },
    ],
  },
  {
    id: "store",
    label: "Store",
    sections: [
      hero("store", { lead: "Browse", title: "the Store", desc: "Books, resources, and materials created to inspire growth, faith, and purposeful living.", b1: "Explore Store", b1l: "#store-items" }),
      {
        id: "books",
        label: "Books section",
        fields: [t("books.heading", "Heading", "*Featured* books"), bt("books.viewall", "View-all link text", "View All →"), bt("books.buy", "Buy button text", "Buy Now →")],
      },
    ],
  },
  {
    id: "connect",
    label: "Connect",
    sections: [
      hero("connect", { lead: "Let's", title: "Connect", desc: "Book a discovery call, invite Chris to speak, or simply say hello." }),
      {
        id: "form",
        label: "Contact form",
        fields: [t("contact.heading", "Heading", "*Send* a message"), bt("contact.btn", "Button text", "Send message"), t("contact.ok", "Success message", "Thank you — your message has been sent.")],
      },
    ],
  },
];

/* ---- lookups ---------------------------------------------------------- */
export const FIELDS = {};
for (const p of PAGES) for (const s of p.sections) for (const f of s.fields) FIELDS[f.key] = f;

const dig = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

/** The value a field has when nothing has been edited. */
export function defaultFor(key, settings) {
  const f = FIELDS[key];
  if (!f) return "";
  if (f.from) {
    const v = dig(settings, f.from);
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return f.def ?? "";
}

/** Edited value if there is one, otherwise the default. */
export function contentValue(key, settings) {
  const v = settings?.content?.[key];
  return v !== undefined ? v : defaultFor(key, settings);
}

/* ---- theme ------------------------------------------------------------ */
export const THEME_DEFAULTS = {
  primary: "#050505",
  onPrimary: "#ffffff",
  secondary: "#ffffff",
  onSecondary: "#111111",
  tertiary: "#b89652",
  quaternary: "#224c4a",
  surface: "#f4f4f4",
  ink: "#111111",
  buttonBg: "#ffffff",
  buttonText: "#000000",
  buttonAltBg: "#000000",
  buttonAltText: "#ffffff",
  buttonRadius: "999px",
};

export const THEME_VARS = {
  primary: "--c-primary",
  onPrimary: "--c-on-primary",
  secondary: "--c-secondary",
  onSecondary: "--c-on-secondary",
  tertiary: "--c-tertiary",
  quaternary: "--c-quaternary",
  surface: "--c-surface",
  ink: "--c-ink",
  buttonBg: "--btn-bg",
  buttonText: "--btn-text",
  buttonAltBg: "--btn-alt-bg",
  buttonAltText: "--btn-alt-text",
  buttonRadius: "--btn-radius",
};
