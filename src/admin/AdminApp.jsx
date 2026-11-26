import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api, logout, whenAuthReady } from "../api.js";
import { img, youtubeThumb } from "../components/util.jsx";
import ContentManager from "./ContentManager.jsx";
import { GalleryField, LinksField, MediaField, TextArea, TextField } from "./fields.jsx";
import { Inbox, PopupEditor, SiteEditor } from "./Editors.jsx";
import { PageContent, ThemeEditor } from "./Developer.jsx";
import { PageLayout } from "./PageBuilder.jsx";
import { MediaLibrary } from "./MediaLibrary.jsx";
import "./admin.css";

const today = () => new Date().toISOString().slice(0, 10);

/* ----------------------------------------------------- content type setups */
const ArticlesPage = () => (
  <ContentManager
    collection="articles"
    title="Articles"
    singular="article"
    blank={{ title: "", excerpt: "", body: "", cover: "", videoUrl: "", gallery: [], date: today(), status: "published" }}
    thumb={(a) => img(a.cover)}
    subtitle={(a) => (a.videoUrl ? "Has video" : "")}
    renderFields={({ item, set }) => (
      <>
        <TextField label="Title" value={item.title} onChange={set("title")} wide />
        <TextField label="Date" type="date" value={item.date} onChange={set("date")} />
        <TextArea label="Short summary" rows={2} value={item.excerpt} onChange={set("excerpt")} hint="Shown at the top of the article." />
        <MediaField label="Cover image" kind="image" value={item.cover} onChange={set("cover")} hint="The picture shown on the card. If empty, a text card is drawn from the title." />
        <MediaField label="Video (optional)" kind="video" value={item.videoUrl} onChange={set("videoUrl")} hint="Upload a video file or paste a YouTube / Vimeo link." />
        <TextArea
          label="Article text"
          rows={14}
          value={item.body}
          onChange={set("body")}
          hint="Leave a blank line between paragraphs. Start a line with ## for a heading, or - for a bullet list."
        />
        <GalleryField label="More images (optional)" value={item.gallery} onChange={set("gallery")} hint="Shown at the bottom of the article." />
      </>
    )}
  />
);

const PodcastsPage = () => (
  <ContentManager
    collection="podcasts"
    title="Podcast episodes"
    singular="episode"
    blank={{ title: "", description: "", cover: "", audioUrl: "", links: [], date: today(), status: "published" }}
    thumb={(p) => img(p.cover)}
    subtitle={(p) => (p.audioUrl ? "Audio uploaded" : `${(p.links || []).length} link(s)`)}
    renderFields={({ item, set }) => (
      <>
        <TextField label="Episode title" value={item.title} onChange={set("title")} wide />
        <TextField label="Date" type="date" value={item.date} onChange={set("date")} />
        <MediaField label="Cover image" kind="image" value={item.cover} onChange={set("cover")} />
        <MediaField label="Audio file (optional)" kind="audio" value={item.audioUrl} onChange={set("audioUrl")} hint="Upload an MP3/M4A so visitors can play it on the site." />
        <LinksField label="Listen links" value={item.links} onChange={set("links")} hint="Apple Podcasts, Spotify, YouTube … Each one appears as an underlined link under the cover." />
        <TextArea label="Description (optional)" rows={3} value={item.description} onChange={set("description")} />
      </>
    )}
  />
);

const VideosPage = () => (
  <ContentManager
    collection="videos"
    title="Videos"
    singular="video"
    blank={{ title: "", description: "", url: "", thumbnail: "", date: today(), status: "published" }}
    thumb={(v) => img(v.thumbnail) || youtubeThumb(v.url)}
    subtitle={(v) => (v.url?.startsWith("/uploads") ? "Uploaded file" : v.url ? "Link" : "No video yet")}
    renderFields={({ item, set }) => (
      <>
        <TextField label="Title" value={item.title} onChange={set("title")} wide />
        <TextField label="Date" type="date" value={item.date} onChange={set("date")} />
        <MediaField label="Video" kind="video" value={item.url} onChange={set("url")} hint="Upload a video file, or paste a YouTube / Vimeo link." />
        <MediaField label="Thumbnail (optional)" kind="image" value={item.thumbnail} onChange={set("thumbnail")} hint="YouTube links get their thumbnail automatically." />
        <TextArea label="Description (optional)" rows={3} value={item.description} onChange={set("description")} />
      </>
    )}
  />
);

const AudioPage = () => (
  <ContentManager
    collection="audio"
    title="Audio"
    singular="audio"
    blank={{ title: "", description: "", audioUrl: "", cover: "", date: today(), status: "published" }}
    thumb={(a) => img(a.cover)}
    subtitle={(a) => (a.audioUrl ? "" : "No audio yet")}
    renderFields={({ item, set }) => (
      <>
        <TextField label="Title" value={item.title} onChange={set("title")} wide />
        <TextField label="Date" type="date" value={item.date} onChange={set("date")} />
        <MediaField label="Audio file" kind="audio" value={item.audioUrl} onChange={set("audioUrl")} hint="Upload an MP3/M4A/WAV or paste a direct link." />
        <MediaField label="Cover image (optional)" kind="image" value={item.cover} onChange={set("cover")} />
        <TextArea label="Description (optional)" rows={3} value={item.description} onChange={set("description")} />
      </>
    )}
  />
);

const EventsPage = () => (
  <ContentManager
    collection="events"
    title="Events"
    singular="event"
    blank={{ title: "", date: "", image: "", image2: "", badge: "", link: "", status: "published" }}
    thumb={(e) => img(e.image)}
    subtitle={(e) => e.date || "Coming soon"}
    renderFields={({ item, set }) => (
      <>
        <TextField label="Event title" value={item.title} onChange={set("title")} wide hint="Use Enter in a longer title? Keep it short — it is shown large, e.g. “The SHIFT Conference”." />
        <TextField label="Date" type="date" value={item.date} onChange={set("date")} hint="Leave empty to show no date." />
        <TextField label="Badge letters" value={item.badge} onChange={set("badge")} hint="Letters in the little badge on the small photo, e.g. SHIFT (optional)." />
        <TextField label="Link" value={item.link} onChange={set("link")} hint="Where the round arrow goes, e.g. /events or a full https:// link." />
        <MediaField label="Large photo (right)" kind="image" value={item.image} onChange={set("image")} hint="The big rounded photo. Landscape works best (about 1300×1150)." />
        <MediaField label="Small photo (bottom-left)" kind="image" value={item.image2} onChange={set("image2")} hint="The second, smaller photo under the title (about 900×650)." />
      </>
    )}
  />
);

/* -------------------------------------------------------------- dashboard */
function Dashboard() {
  const [counts, setCounts] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const [articles, podcasts, videos, audio, events, inbox] = await Promise.all([
          api.list("articles", true),
          api.list("podcasts", true),
          api.list("videos", true),
          api.list("audio", true),
          api.list("events", true),
          api.inbox(),
        ]);
        setCounts({ articles: articles.length, podcasts: podcasts.length, videos: videos.length, audio: audio.length, events: events.length, subscribers: inbox.subscribers.length, messages: inbox.messages.length });
      } catch { /* ignore */ }
    })();
  }, []);
  const tiles = [
    ["articles", "Articles", "articles"],
    ["videos", "Videos", "videos"],
    ["podcasts", "Podcast episodes", "podcasts"],
    ["audio", "Audio", "audio"],
    ["events", "Events", "events"],
    ["inbox", "Subscribers", "subscribers"],
    ["inbox", "Messages", "messages"],
  ];
  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Dashboard</h1>
          <p>Add and edit everything that appears on the website.</p>
        </div>
        <Link className="btn" to="/" target="_blank">
          View website ↗
        </Link>
      </div>
      <div className="tiles">
        {tiles.map(([to, label, key]) => (
          <Link to={to} className="tile" key={label}>
            <strong>{counts ? counts[key] : "–"}</strong>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ login */
function Login({ onDone }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.login(email, password);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="login">
      <form onSubmit={submit} className="login__box">
        <h1>Admin sign in</h1>
        <p>Sign in with your admin email and password to manage the website.</p>
        <input className="ai" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoFocus autoComplete="username" />
        <input className="ai" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
        {error && <p className="af__error">{error}</p>}
        <button className="btn btn--primary" disabled={busy || !email || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <Link to="/" className="login__back">
          ← Back to website
        </Link>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ shell */
const MENU = [
  {
    items: [
      ["", "Dashboard", true],
      ["articles", "Articles"],
      ["videos", "Videos"],
      ["podcasts", "Podcast"],
      ["audio", "Audio"],
      ["events", "Events"],
      ["popup", "Pop-up"],
      ["site", "Site & images"],
      ["media", "Media library"],
      ["inbox", "Subscribers & messages"],
    ],
  },
  {
    title: "Developer",
    items: [
      ["developer/layout", "Page layout"],
      ["developer/content", "Page content"],
      ["developer/theme", "Theme & buttons"],
    ],
  },
];

function Shell({ onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="admin">
      <aside className={"side" + (open ? " is-open" : "")}>
        <Link to="/admin" className="side__brand">
          Admin
        </Link>
        <nav onClick={() => setOpen(false)}>
          {MENU.map((group) => (
            <div className="side__group" key={group.title || "main"}>
              {group.title && <span className="side__title">{group.title}</span>}
              {group.items.map(([to, label, end]) => (
                <NavLink key={label} to={to ? `/admin/${to}` : "/admin"} end={!!end} className="side__link">
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="side__foot">
          <Link to="/" target="_blank">
            View website ↗
          </Link>
          <button onClick={onLogout}>Sign out</button>
        </div>
      </aside>
      <button className="admin__burger" onClick={() => setOpen((v) => !v)} aria-label="Menu">
        ☰
      </button>
      <section className="admin__main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="podcasts" element={<PodcastsPage />} />
          <Route path="audio" element={<AudioPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="popup" element={<PopupEditor />} />
          <Route path="site" element={<SiteEditor />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="developer/layout" element={<PageLayout />} />
          <Route path="developer/content" element={<PageContent />} />
          <Route path="developer/theme" element={<ThemeEditor />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </section>
    </div>
  );
}

export default function AdminApp() {
  const [state, setState] = useState("checking");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin";
    whenAuthReady().then((u) => setState(u ? "in" : "out"));
  }, []);

  // a rejected save (expired or invalid session) sends the user back to the login screen
  useEffect(() => {
    const out = () => { logout(); setState("out"); };
    window.addEventListener("cm-unauthorized", out);
    return () => window.removeEventListener("cm-unauthorized", out);
  }, []);

  if (state === "checking") return <div style={{ padding: 40 }}>Loading…</div>;
  if (state === "out") return <Login onDone={() => { setState("in"); navigate("/admin"); }} />;
  return <Shell onLogout={() => { logout(); setState("out"); }} />;
}
