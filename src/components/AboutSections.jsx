import { useRef } from "react";
import { Link } from "react-router-dom";
import { useC, useSettings } from "../context/SiteContext.jsx";
import { Rich, SmartLink, img } from "./util.jsx";

/* ------------------------------------------------------ About / The Story */
export function AboutStory() {
  const { settings } = useSettings();
  const c = useC();
  const gallery = settings.images.gallery || [];
  const ref = useRef(null);
  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    const item = el.querySelector(".cm-about2__gallery-item");
    el.scrollBy({ left: dir * ((item ? item.offsetWidth : 150) + 18) * 2, behavior: "smooth" });
  };

  return (
    <section className="cm-about2" id="about-chris">
      <div className="cm-about2__top">
        <div className="cm-about2__left">
          <p className="cm-about2__label">{c("story.label")}</p>
          <h2 className="cm-about2__heading">
            {c("story.heading")}<span>.</span>
          </h2>
          <p className="cm-about2__intro">{c("story.intro")}</p>
          <p className="cm-about2__text">{c("story.text")}</p>
        </div>
        <div className="cm-about2__right">
          <div className="cm-about2__photo-wrap">
            <div className="cm-about2__blob" />
            {c("story.image") && (
              <img className="cm-about2__photo" src={img(c("story.image"))} alt="Chris Mene portrait" />
            )}
          </div>
        </div>
      </div>

      {gallery.length > 0 && (
        <>
          <div className="cm-about2__divider" />
          <div className="cm-about2__gallery-wrap">
            <button className="cm-about2__arrow" onClick={() => scroll(-1)} aria-label="Scroll left" type="button">
              &#8592;
            </button>
            <div className="cm-about2__gallery" ref={ref}>
              {gallery.map((src, i) => (
                <div className="cm-about2__gallery-item" key={i}>
                  <img src={img(src)} alt={`Gallery photo ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
            <button className="cm-about2__arrow" onClick={() => scroll(1)} aria-label="Scroll right" type="button">
              &#8594;
            </button>
          </div>
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------ Mission & Vision */
export function MissionVision() {
  const c = useC();
  return (
    <section className="cm-mission-vision" id="mission">
      <div className="cm-mission-vision__image" />
      <div className="cm-mission-vision__container">
        <div className="cm-mission-vision__content">
          <div className="cm-mission-vision__block cm-mission-vision__block--mission">
            <h2 className="cm-mission-vision__heading">
              <Rich text={c("mv.mh")} />
            </h2>
            <p className="cm-mission-vision__text">{c("mv.mt")}</p>
          </div>
          <div className="cm-mission-vision__block cm-mission-vision__block--vision">
            <h2 className="cm-mission-vision__heading">
              <Rich text={c("mv.vh")} />
            </h2>
            <p className="cm-mission-vision__text">{c("mv.vt")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- What matters */
const VALUE_META = [
  { tag: "Foundation", symbol: "✦" },
  { tag: "Direction", symbol: "◇" },
  { tag: "Influence", symbol: "+" },
  { tag: "Connection", symbol: "○" },
];

export function WhatMatters() {
  const c = useC();
  return (
    <section className="cm-about-values">
      <div className="cm-about-values__inner">
        <div className="cm-about-values__header">
          <div>
            <p className="cm-about-values__label">{c("val.label")}</p>
            <h2 className="cm-about-values__heading">
              <Rich text={c("val.heading")} />
            </h2>
          </div>
          <p className="cm-about-values__intro">{c("val.intro")}</p>
        </div>
        <div className="cm-about-values__grid">
          {VALUE_META.map((v, i) => (
            <article className="cm-value-card" key={i}>
              <span className="cm-value-card__number">{String(i + 1).padStart(2, "0")}</span>
              <div className="cm-value-card__top">
                <span className="cm-value-card__tag">{v.tag}</span>
                <span className="cm-value-card__symbol">{v.symbol}</span>
              </div>
              <div>
                <h3 className="cm-value-card__title">
                  <em>{c(`val.t${i + 1}`)}</em>
                </h3>
                <p className="cm-value-card__description">{c(`val.d${i + 1}`)}</p>
              </div>
              <div className="cm-value-card__bottom">
                <span className="cm-value-card__line" />
                <span className="cm-value-card__arrow">&#8599;</span>
              </div>
            </article>
          ))}
        </div>
        <div className="cm-about-values__statement">
          <p>&#8220;{c("val.quote")}&#8221;</p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Stage */
export function Stage() {
  const c = useC();
  return (
    <section className="cm-stage-section" id="speaking">
      <div className="cm-stage-container">
        <div className="cm-stage-left">
          <div className="cm-stage-card">
            <div className="cm-stage-arrow">↗</div>
            <h2 className="cm-stage-title">
              {c("stage.title")}
              <em>{c("stage.em")}</em>
            </h2>
          </div>
          <p className="cm-stage-eyebrow">{c("stage.eyebrow")}</p>
          <p className="cm-stage-description">{c("stage.desc")}</p>
          {c("stage.btn") && (
            <SmartLink to={c("stage.btnLink")} className="cm-stage-button">
              {c("stage.btn")}
              <span style={{ marginLeft: 8 }}>→</span>
            </SmartLink>
          )}
        </div>
        <div className="cm-stage-media">
          {c("stage.image") && <img className="cm-stage-image" src={img(c("stage.image"))} alt="" />}
          <div className="cm-stage-play" />
          <div className="cm-stage-media-label">{c("stage.label")}</div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Store books */
const BOOKS = [
  ["The Power of Purpose", "Discover practical principles for living with clarity, direction, and intention. A thoughtful guide for anyone seeking to make their life count.", "Leadership"],
  ["Becoming", "A journey of growth, identity, and transformation designed to help you understand who you are and who you are becoming.", "Growth"],
  ["Lead With Vision", "Learn how to turn ideas into direction and direction into meaningful action. Built for emerging leaders and purposeful people.", "Leadership"],
  ["Faith In Action", "Move beyond inspiration into intentional action. Explore practical ways to live out your faith in everyday life.", "Faith"],
  ["The Next Chapter", "When one season ends, another begins. Learn how to embrace change, release the past, and step confidently into what comes next.", "Purpose"],
  ["Becoming More", "A practical reflection on personal development, discipline, character, and the small decisions that shape a meaningful life.", "Personal Growth"],
];

export function StoreBooks() {
  const c = useC();
  return (
    <section className="cm-books-section" id="store-items">
      <div className="cm-books-container">
        <div className="cm-books-header">
          <h2 className="cm-books-heading">
            <Rich text={c("books.heading")} />
          </h2>
          <a href="#" className="cm-books-view-all">
            {c("books.viewall")}
          </a>
        </div>
        <div className="cm-books-grid">
          {BOOKS.map(([title, desc, cat], i) => (
            <article className="cm-book-card" key={title}>
              <div className={`cm-book-cover cm-book-cover-${i + 1}`}>
                <div className="cm-book-cover-content">
                  <span className="cm-book-category">BOOK</span>
                  <h3>{title}</h3>
                  <p>Chris Mene</p>
                </div>
              </div>
              <div className="cm-book-info">
                <span className="cm-book-number">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="cm-book-title">{title}</h3>
                <p className="cm-book-description">{desc}</p>
                <div className="cm-book-meta">
                  <span>Paperback</span>
                  <span>•</span>
                  <span>{cat}</span>
                </div>
                <SmartLink to="#" className="cm-book-buy">
                  {c("books.buy")}
                </SmartLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
