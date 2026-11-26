import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Hero from "../components/Hero.jsx";
import PageSections from "../components/PageSections.jsx";
import { VideoPlayer } from "../components/Resources.jsx";
import { api } from "../api.js";
import { useC, useSettings } from "../context/SiteContext.jsx";
import { defaultContent } from "../../shared/seed.js";
import { formatDate, img } from "../components/util.jsx";
import { extraPages, pageKey } from "../../shared/layout.js";

const useTitle = (t) =>
  useEffect(() => {
    document.title = t;
  }, [t]);

/* ------------------------------------------------------------------ Home */
export function Home() {
  const { settings } = useSettings();
  useTitle(`${settings.siteName} — Speaker, Leadership Expert & Author`);
  return (
    <>
      <PageHero p="home" home />
      <PageSections page="home" />
    </>
  );
}

/* ------------------------------------------------------------ page hero */
/** Every page hero reads its texts, buttons and photo from the editable content. */
function PageHero({ p, home = false }) {
  const c = useC();
  const buttons = [];
  if (c(`${p}.hero.b1`)) buttons.push({ label: c(`${p}.hero.b1`), to: c(`${p}.hero.b1l`) });
  if (home && c(`${p}.hero.b2`)) buttons.push({ label: c(`${p}.hero.b2`), to: c(`${p}.hero.b2l`) });
  return (
    <Hero
      variant={home ? "cutout" : "blend"}
      lead={c(`${p}.hero.lead`)}
      after={c(`${p}.hero.after`)}
      title={c(`${p}.hero.title`)}
      description={c(`${p}.hero.desc`)}
      buttons={buttons}
      image={c(`${p}.hero.image`)}
    />
  );
}

export function About() {
  useTitle("About — Chris Mene");
  return (
    <>
      <PageHero p="about" />
      <PageSections page="about" />
    </>
  );
}

export function Programs() {
  useTitle("Programs — Chris Mene");
  return (
    <>
      <PageHero p="programs" />
      <PageSections page="programs" />
    </>
  );
}

export function Events() {
  useTitle("Events — Chris Mene");
  return (
    <>
      <PageHero p="events" />
      <PageSections page="events" />
    </>
  );
}

export function Platforms() {
  useTitle("Platforms — Chris Mene");
  return (
    <>
      <PageHero p="platforms" />
      <PageSections page="platforms" />
    </>
  );
}

/* ------------------------------------------------------------- Resources */
export function Resources() {
  useTitle("Resources — Chris Mene");
  // Order: Articles → Videos → Podcast → Audio
  return (
    <>
      <PageHero p="resources" />
      <PageSections page="resources" />
    </>
  );
}

function RichText({ text = "" }) {
  const blocks = text.split(/\n{2,}/);
  return blocks.map((b, i) => {
    const t = b.trim();
    if (!t) return null;
    if (/^#{1,3}\s/.test(t)) return <h2 key={i}>{t.replace(/^#{1,3}\s/, "")}</h2>;
    if (t.split("\n").every((l) => /^[-*]\s/.test(l)))
      return (
        <ul key={i}>
          {t.split("\n").map((l, j) => (
            <li key={j}>{l.replace(/^[-*]\s/, "")}</li>
          ))}
        </ul>
      );
    // a "## heading" directly followed by text on the next line
    const m = t.match(/^(#{1,3}\s.+)\n([\s\S]+)$/);
    if (m)
      return (
        <div key={i}>
          <h2>{m[1].replace(/^#{1,3}\s/, "")}</h2>
          <p>{m[2]}</p>
        </div>
      );
    return <p key={i}>{t}</p>;
  });
}

export function ArticleDetail() {
  const { slug } = useParams();
  const { settings } = useSettings();
  const [a, setA] = useState(undefined);

  useEffect(() => {
    setA(undefined);
    api
      .get("articles", slug)
      .then(setA)
      .catch(() => {
        const fallback = defaultContent.articles.find((x) => x.title && (x.slug === slug || `s${defaultContent.articles.indexOf(x)}` === slug));
        setA(fallback || null);
      });
  }, [slug]);

  useTitle(a ? `${a.title} — ${settings.siteName}` : settings.siteName);

  if (a === undefined) return <div className="page-state">Loading…</div>;
  if (a === null)
    return (
      <div className="page-state">
        <h1>Article not found</h1>
        <Link to="/resources#articles">← Back to articles</Link>
      </div>
    );

  return (
    <article className="art">
      <div className="art__inner">
        <Link to="/resources#articles" className="art__back">
          ← All articles
        </Link>
        <h1 className="art__title">{a.title}</h1>
        <p className="art__meta">
          {settings.siteName}
          {a.date && <> · {formatDate(a.date)}</>}
        </p>
        {a.excerpt && <p className="art__lead">{a.excerpt}</p>}
        {a.cover && <img className="art__cover" src={img(a.cover)} alt="" />}
        {a.videoUrl && (
          <div className="art__video">
            <VideoPlayer url={a.videoUrl} poster={a.cover} />
          </div>
        )}
        <div className="art__body">
          <RichText text={a.body} />
        </div>
        {a.gallery?.length > 0 && (
          <div className="art__gallery">
            {a.gallery.map((g, i) => (
              <img key={i} src={img(g)} alt="" loading="lazy" />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------- Store */
export function Store() {
  useTitle("Store — Chris Mene");
  return (
    <>
      <PageHero p="store" />
      <PageSections page="store" />
    </>
  );
}

/* --------------------------------------------------------------- Connect */
export function Connect() {
  useTitle("Connect — Chris Mene");
  return (
    <>
      <PageHero p="connect" />
      <PageSections page="connect" />
    </>
  );
}

/* ---------------------------------------- pages created in Admin → Page layout */
export function CustomPage() {
  const { slug } = useParams();
  const { settings } = useSettings();
  const page = extraPages(settings).find((p) => p.slug === slug);
  useTitle(page ? `${page.title} — ${settings.siteName}` : settings.siteName);
  if (!page) return <NotFound />;
  return <PageSections page={pageKey(page.slug)} />;
}

export function NotFound() {
  useTitle("Page not found");
  return (
    <div className="page-state">
      <h1>Page not found</h1>
      <Link to="/">← Back home</Link>
    </div>
  );
}
