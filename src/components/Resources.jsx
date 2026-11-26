import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useC, useCollection, useSettings } from "../context/SiteContext.jsx";
import { embedUrl, formatDate, img, youtubeThumb } from "./util.jsx";

/* ------------------------------------------------ show only two rows */
/** Counts how many columns the grid currently has (changes with screen size). */
function useColumns(ref) {
  const [cols, setCols] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setCols(Math.max(1, getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return cols;
}

/**
 * A grid that shows two rows (on any screen size) and hides the rest
 * behind a "View all" button.
 */
function CollapsibleGrid({ items, className, render, moreLabel, lessLabel, rows = 2 }) {
  const ref = useRef(null);
  const cols = useColumns(ref);
  const [open, setOpen] = useState(false);
  const limit = cols * rows;
  const shown = open ? items : items.slice(0, limit);
  return (
    <>
      <div className={className} ref={ref}>
        {shown.map(render)}
      </div>
      {items.length > limit && (
        <div className="more">
          <button type="button" className="more__btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? lessLabel : `${moreLabel} (${items.length})`}
          </button>
        </div>
      )}
    </>
  );
}

/** A video from YouTube/Vimeo (embedded) or an uploaded/direct file (<video>). */
export function VideoPlayer({ url, poster, autoPlay = false }) {
  const embed = embedUrl(url);
  if (embed) {
    return (
      <div className="rvideo">
        <iframe
          src={embed + (autoPlay ? "?autoplay=1" : "")}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <video className="rvideo rvideo--file" src={img(url)} poster={img(poster)} controls autoPlay={autoPlay} playsInline preload="metadata" />
  );
}

/* --------------------------------------------------------------- Articles */
function ArticleCover({ a }) {
  const { settings } = useSettings();
  if (a.cover) return <img src={img(a.cover)} alt="" loading="lazy" />;
  // no image uploaded yet: draw a text card like the reference
  return (
    <div className="acover">
      <span className="acover__rule" />
      <strong>{a.title}</strong>
      <span className="acover__rule acover__rule--short" />
      <small>{settings.siteName.toUpperCase()}</small>
    </div>
  );
}

export function ArticleCard({ a }) {
  return (
    <article className="acard">
      <Link to={`/articles/${a.slug || a.id}`} className="acard__media" tabIndex={-1} aria-hidden="true">
        <ArticleCover a={a} />
        {a.videoUrl && <span className="acard__badge">▶ Video</span>}
      </Link>
      <div className="acard__body">
        <Link to={`/articles/${a.slug || a.id}`} className="acard__title">
          {a.title}
        </Link>
      </div>
    </article>
  );
}

export function ArticlesSection({ limit }) {
  const { items, loading } = useCollection("articles");
  const c = useC();
  const list = limit ? items.slice(0, limit) : items;
  return (
    <section className="rsec" id="articles">
      <div className="rsec__inner">
        <h2 className="rsec__heading">{c("res.articles")}</h2>
        {!loading && !list.length && <p className="rsec__empty">No articles yet — check back soon.</p>}
        <div className="agrid">
          {list.map((a) => (
            <ArticleCard a={a} key={a.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Videos */
export function VideosSection() {
  const { items, loading } = useCollection("videos");
  const c = useC();
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!active) return;
    document.body.classList.add("no-scroll");
    const onKey = (e) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("no-scroll");
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <section className="rsec rsec--grey" id="videos">
      <div className="rsec__inner">
        <h2 className="rsec__heading">{c("res.videos")}</h2>
        {!loading && !items.length && <p className="rsec__empty">No videos yet — check back soon.</p>}
        <CollapsibleGrid
          className="vgrid"
          items={items}
          moreLabel={c("res.moreVideos")}
          lessLabel={c("res.less")}
          render={(v) => {
            const thumb = v.thumbnail || youtubeThumb(v.url);
            return (
              <button type="button" className="vcard" key={v.id} onClick={() => v.url && setActive(v)}>
                <span className="vcard__media">
                  {thumb ? <img src={img(thumb)} alt="" loading="lazy" /> : <span className="vcard__blank" />}
                  <span className="vcard__play" aria-hidden="true">
                    <i className="fa-solid fa-play" />
                  </span>
                </span>
                <span className="vcard__title">{v.title}</span>
                {v.description && <span className="vcard__desc">{v.description}</span>}
              </button>
            );
          }}
        />
      </div>

      {active && (
        <div className="vmodal" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && setActive(null)}>
          <div className="vmodal__box">
            <button type="button" className="vmodal__close" onClick={() => setActive(null)} aria-label="Close video">
              ×
            </button>
            <VideoPlayer url={active.url} poster={active.thumbnail} autoPlay />
            <h3>{active.title}</h3>
          </div>
        </div>
      )}
    </section>
  );
}

/* --------------------------------------------------------------- Podcast */
const TILE_STYLES = ["tile--dark", "tile--smoke", "tile--blue", "tile--ink", "tile--indigo", "tile--indigo", "tile--indigo", "tile--indigo"];

function PodcastTile({ p, i }) {
  const { settings } = useSettings();
  const [playing, setPlaying] = useState(false);
  const links = (p.links || []).filter((l) => l.label);
  return (
    <div className="pod">
      <div className={"pod__tile " + (p.cover ? "" : TILE_STYLES[i % TILE_STYLES.length])}>
        {p.cover ? (
          <img src={img(p.cover)} alt="" loading="lazy" />
        ) : (
          <>
            <span className="pod__rule" />
            <strong>{p.title}</strong>
            <small>{settings.siteName.toUpperCase()}</small>
          </>
        )}
        {p.audioUrl && (
          <button type="button" className="pod__play" onClick={() => setPlaying((v) => !v)} aria-label={playing ? "Hide player" : "Play episode"}>
            <i className={"fa-solid " + (playing ? "fa-xmark" : "fa-play")} />
          </button>
        )}
      </div>

      {playing && p.audioUrl && <audio className="pod__audio" src={img(p.audioUrl)} controls autoPlay />}

      <div className="pod__links">
        {links.map((l) => (
          <a key={l.label + l.url} href={l.url} target={l.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
            {l.label}
          </a>
        ))}
        {!links.length && <span>{p.title}</span>}
      </div>
    </div>
  );
}

export function PodcastSection() {
  const { items, loading } = useCollection("podcasts");
  const c = useC();
  return (
    <section className="rsec" id="podcasts">
      <div className="rsec__inner">
        <h2 className="rsec__heading">{c("res.podcast")}</h2>
        {!loading && !items.length && <p className="rsec__empty">No podcast episodes yet — check back soon.</p>}
        <CollapsibleGrid
          className="pgrid"
          items={items}
          moreLabel={c("res.morePodcast")}
          lessLabel={c("res.less")}
          render={(p, i) => <PodcastTile p={p} i={i} key={p.id} />}
        />
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Audio */
export function AudioSection() {
  const { items, loading } = useCollection("audio");
  const c = useC();
  return (
    <section className="rsec rsec--grey" id="audio">
      <div className="rsec__inner">
        <h2 className="rsec__heading">{c("res.audio")}</h2>
        {!loading && !items.length && <p className="rsec__empty">No audio yet — check back soon.</p>}
        <CollapsibleGrid
          className="audlist"
          items={items}
          moreLabel={c("res.moreAudio")}
          lessLabel={c("res.less")}
          render={(a) => (
            <div className="aud" key={a.id}>
              <div className="aud__cover">{a.cover ? <img src={img(a.cover)} alt="" loading="lazy" /> : <i className="fa-solid fa-headphones" />}</div>
              <div className="aud__body">
                <h3>{a.title}</h3>
                {a.date && <small>{formatDate(a.date)}</small>}
                {a.description && <p>{a.description}</p>}
                {a.audioUrl && <audio src={img(a.audioUrl)} controls preload="none" />}
              </div>
            </div>
          )}
        />
      </div>
    </section>
  );
}
