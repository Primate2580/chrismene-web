import "../styles/custom-sections.css";
import { Rich, SmartLink, embedUrl, img } from "./util.jsx";
import { readableOn, slugify } from "../../shared/layout.js";

/** Blank line = new paragraph, single Enter = line break. */
function Paras({ text = "" }) {
  return String(text)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => (
      <p key={i}>
        <Rich text={p} />
      </p>
    ));
}

function Pic({ src, shape, ratio, eager }) {
  return (
    <img
      className={`cmx__pic cmx__pic--r-${shape || "rounded"}`}
      style={ratio && ratio !== "auto" ? { aspectRatio: ratio } : undefined}
      src={img(src)}
      alt=""
      loading={eager ? "eager" : "lazy"}
    />
  );
}

const cls = (...a) => a.filter(Boolean).join(" ");

/** Wrapper that gives every section its background, text colour and spacing. */
function Frame({ item, name, extra = "", style, children }) {
  const d = item.data;
  const custom = d.theme === "custom";
  const fg = custom ? readableOn(d.bgColor) : null;
  return (
    <section
      id={slugify(item.anchor || "") || undefined}
      className={cls(
        "cmx",
        `cmx-${name}`,
        d.theme && !custom && `cmx--${d.theme}`,
        custom && (fg === "#ffffff" ? "cmx--custom-dark" : "cmx--custom-light"),
        d.padTop && `cmx--pt-${d.padTop}`,
        d.padBottom && `cmx--pb-${d.padBottom}`,
        d.textAlign && `cmx--ta-${d.textAlign}`,
        extra
      )}
      style={{ ...(custom ? { "--cx-bg": d.bgColor, "--cx-fg": fg } : null), ...style }}
    >
      {children}
    </section>
  );
}

function Button({ d }) {
  return d.buttonText ? (
    <SmartLink to={d.buttonLink} className="cmx__btn">
      {d.buttonText} <span aria-hidden="true">→</span>
    </SmartLink>
  ) : null;
}

function TextBlock({ d }) {
  return (
    <div className="cmx__text">
      {d.eyebrow && <p className="cmx__eyebrow">{d.eyebrow}</p>}
      {d.heading && (
        <h2 className="cmx__heading">
          <Rich text={d.heading} />
        </h2>
      )}
      {d.body && (
        <div className="cmx__body">
          <Paras text={d.body} />
        </div>
      )}
      <Button d={d} />
    </div>
  );
}

function Media({ item }) {
  const d = item.data;
  const pics = (d.images || []).filter(Boolean);
  const arrange = pics.length > 1 ? d.arrange : "single";
  const v = { start: "flex-start", center: "center", end: "flex-end" }[d.vAlign] || "center";
  const h = { left: "flex-start", center: "center", right: "flex-end" }[d.hAlign] || "center";
  const side = d.position === "left" || d.position === "right";
  return (
    <Frame
      item={item}
      name="media"
      extra={`cmx-media--${d.position}`}
      style={{ "--cx-iw": Number(d.imageWidth) || 48, "--cx-v": v, "--cx-h": h, "--cx-nx": Number(d.nudgeX) || 0, "--cx-ny": Number(d.nudgeY) || 0 }}
    >
      <div className="cmx__inner">
        <div className="cmx-media__row">
          {pics.length > 0 && (
            <div className="cmx-media__fig" style={!side ? { width: `${Number(d.imageWidth) || 100}%` } : undefined}>
              <div className="cmx-media__nudge">
                <div className={`cmx-imgs cmx-imgs--${arrange === "single" ? "grid" : arrange}`}>
                  {pics.map((src, i) => (
                    <Pic key={src + i} src={src} shape={d.shape} ratio={d.ratio} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="cmx-media__text">
            <TextBlock d={d} />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Gallery({ item }) {
  const d = item.data;
  const pics = (d.images || []).filter(Boolean);
  const gap = { small: 8, medium: 20, large: 34 }[d.gap] ?? 20;
  return (
    <Frame item={item} name="gallery" style={{ "--cx-cols": Number(d.columns) || 3, "--cx-gap": `${gap}px` }}>
      <div className="cmx__inner">
        {d.heading && (
          <div className="cmx-gallery__head">
            <h2 className="cmx__heading">
              <Rich text={d.heading} />
            </h2>
          </div>
        )}
        <div className="cmx-gallery__grid">
          {pics.map((src, i) => (
            <Pic key={src + i} src={src} shape={d.shape} ratio={d.ratio} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

function Video({ item }) {
  const d = item.data;
  const embed = embedUrl(d.url);
  return (
    <Frame item={item} name="video" extra={`cmx-video--${d.width}`}>
      <div className="cmx__inner">
        {d.heading && (
          <h2 className="cmx__heading" style={{ textAlign: "center" }}>
            <Rich text={d.heading} />
          </h2>
        )}
        {d.url ? (
          <div className="cmx-video__frame">
            {embed ? <iframe src={embed} title={d.heading || "Video"} allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" /> : <video src={img(d.url)} controls preload="metadata" />}
          </div>
        ) : (
          <p className="cmx-video__empty">Add a video in the admin.</p>
        )}
        {d.caption && <p className="cmx-video__cap">{d.caption}</p>}
      </div>
    </Frame>
  );
}

/** One custom section, chosen by its type. */
export function CustomSection({ item }) {
  const d = item.data;
  switch (item.type) {
    case "media":
      return <Media item={item} />;
    case "text":
      return (
        <Frame item={item} name="text" extra={`cmx-text--${d.width}`}>
          <div className="cmx__inner">
            <TextBlock d={d} />
          </div>
        </Frame>
      );
    case "gallery":
      return <Gallery item={item} />;
    case "cta":
      return (
        <Frame item={item} name="cta">
          <div className="cmx__inner">
            <TextBlock d={d} />
          </div>
        </Frame>
      );
    case "video":
      return <Video item={item} />;
    case "quote":
      return (
        <Frame item={item} name="quote">
          <div className="cmx__inner cmx__text">
            <blockquote className="cmx-quote__q" style={{ margin: 0 }}>
              &#8220;{d.quote}&#8221;
            </blockquote>
            {d.name && <p className="cmx-quote__n">{d.name}</p>}
          </div>
        </Frame>
      );
    case "spacer":
      return (
        <Frame item={item} name="spacer" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div style={{ height: Math.max(0, Number(d.height) || 0), display: "flex", alignItems: "center" }}>
            {d.line && <hr className="cmx-spacer__line" style={{ width: "100%" }} />}
          </div>
        </Frame>
      );
    default:
      return null;
  }
}
