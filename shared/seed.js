// Default content. The server seeds its database with this the first time it
// runs, and the front end falls back to it when the API cannot be reached.

import { THEME_DEFAULTS } from "./content.js";

const IMG = "https://chrismene.org/wp-content/uploads/2026/09";

export const defaultSettings = {
  // colours + button style (Admin → Developer → Theme & buttons)
  theme: { ...THEME_DEFAULTS },
  // edited texts/images (Admin → Developer → Page content). Empty = defaults.
  content: {},
  siteName: "Chris Mene",
  logoUrl: "",
  images: {
    // Home hero: a cut-out portrait that sits on the black background
    hero: `${IMG}/11-1.webp`,
    // Inner-page heroes: a wider photo that blends into the black background
    innerHero: `${IMG}/Gemini_Generated_Image_914hlv914hlv914h.jpg`,
    // Newsletter section photo (shown full-bleed on the right)
    newsletter: `${IMG}/Gemini_Generated_Image_3qanii3qanii3qan.webp`,
    // Optional photo behind the three programme cards on the Programs page
    programsBg: "",
    // About page
    aboutPortrait: `${IMG}/PRI_0274__1_-removebg-preview.png`,
    stage: "",
    gallery: [],
  },
  newsletter: {
    text:
      "Sign up for leadership insights, spiritual growth content, and program updates from Pastor Chris.",
    // CSS object-position for the newsletter photo. Change this from the
    // admin panel if the head is ever cropped.
    focus: "70% 12%",
  },
  popup: {
    enabled: true,
    image: "",
    title: "Leadership *Live* with Chris Mene",
    subtitle: "Let's discuss all things leadership and more…",
    buttonText: "Join the live broadcast now",
    buttonLink: "/platforms",
    delay: 800,
    // "everyPage" = opens on every page load / page change
    // "session"   = opens once, then stays closed until the browser is closed
    frequency: "everyPage",
  },
  programs: [
    {
      title: "Chris Mene\nMastermind",
      image: `${IMG}/11-1.webp`,
      description:
        "A close circle of leaders working through vision, strategy and personal growth together.",
      link: "/programs",
    },
    {
      title: "Leadership\nDevelopment",
      image: `${IMG}/PRI_0278.webp`,
      description:
        "Practical coaching and training that turns leadership principles into daily practice.",
      link: "/programs",
    },
    {
      title: "Personal\nTransformation",
      image: `${IMG}/Gemini_Generated_Image_wdke7cwdke7cwdke.webp`,
      description:
        "A guided journey of faith, purpose and mindset change for people ready to grow.",
      link: "/programs",
    },
  ],
};

const today = new Date().toISOString().slice(0, 10);

export const defaultContent = {
  articles: [
    {
      title: "Why Leaders Hit a Growth Ceiling and How to Break Through",
      excerpt: "The habits that got you here are rarely the ones that take you further.",
      body:
        "Every leader eventually reaches a point where effort alone stops producing growth.\n\n## Name the ceiling\nThe first step is to describe it honestly. Is it a capacity problem, a people problem, or a clarity problem?\n\n## Change the question\nInstead of asking how to work harder, ask what must change in me for the next level to be possible.",
      cover: "",
      videoUrl: "",
      gallery: [],
      date: today,
      status: "published",
    },
    {
      title: "To Scale Your Business, You Must Scale Your People",
      excerpt: "Systems and strategy matter, but growth is carried by people.",
      body:
        "Organisations grow at the speed of their people.\n\nInvest in the development of the team before you invest in the next campaign.",
      cover: "",
      videoUrl: "",
      gallery: [],
      date: today,
      status: "published",
    },
    {
      title: "Operating Systems Don't Write Themselves",
      excerpt: "Clear ways of working do not appear by accident.",
      body:
        "Culture is the operating system of an organisation, and somebody has to write it.\n\nDecide what you want to be true, write it down, and model it every day.",
      cover: "",
      videoUrl: "",
      gallery: [],
      date: today,
      status: "published",
    },
  ],
  podcasts: [
    "Start Before You Are Ready",
    "How to Reprogram Your Mind & Lead Your Family Like a Boss",
    "The Courage to Make Shifts in Leadership",
    "Love, Trust and Influence: Leadership Insights",
    "6 Steps to Transform Your Mindset and Elevate Your Leadership",
    "Leadership Secrets: From Self-Doubt to Confidence",
    "Talking the Talk: Four Things Every Employer Brand Needs to Say",
    "The Visionary Leadership: Empowering Through Uncertainty",
  ].map((title, i) => ({
    title,
    description: "",
    cover: "",
    audioUrl: "",
    links:
      i === 1
        ? [
            { label: "Apple Podcasts", url: "#" },
            { label: "Spotify", url: "#" },
            { label: "Youtube", url: "#" },
          ]
        : [{ label: title, url: "#" }],
    date: today,
    status: "published",
  })),
  videos: [
    {
      title: "Leadership Live — Latest Episode",
      description: "Watch the latest conversation on leadership and purposeful living.",
      url: "",
      thumbnail: "",
      date: today,
      status: "published",
    },
  ],
  audio: [],
  events: [
    {
      title: "The SHIFT\nConference",
      date: "2026-12-06",
      image: "",
      image2: "",
      badge: "SHIFT",
      link: "/events",
      status: "published",
    },
  ],
};
