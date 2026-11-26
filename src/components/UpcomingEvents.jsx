import { useEffect, useState } from "react";
import { useC, useCollection } from "../context/SiteContext.jsx";
import { Lines, SmartLink, formatDate, img } from "./util.jsx";

/**
 * Upcoming-event card, matching the reference composition:
 * black title block (title + round arrow) top-left, a large rounded photo on
 * the right and a second, smaller rounded photo bottom-left with the event badge.
 * Events come from Admin → Events.
 */
export default function UpcomingEvents() {
  const { items: events, loading } = useCollection("events");
  const c = useC();
  const [i, setI] = useState(0);

  useEffect(() => setI(0), [events.length]);

  if (loading) return <section className="ev" />;

  if (!events.length) {
    return (
      <section className="ev">
        <h2 className="ev__heading">
          <em>{c("ev.em")}</em> {c("ev.title")}
        </h2>
        <p className="ev__empty">No upcoming event…</p>
      </section>
    );
  }

  const e = events[i] || events[0];
  const go = (d) => setI((x) => (x + d + events.length) % events.length);
  const badge = (e.badge || "").toUpperCase().slice(0, 8);

  return (
    <section className="ev" id="upcoming-events">
      <div className="ev__card" key={e.id}>
        <div className="ev__big" style={e.image ? { backgroundImage: `url("${img(e.image)}")` } : undefined} />

        <div className="ev__title">
          <h3>
            <Lines text={e.title} />
            {e.date && <small>{formatDate(e.date)}</small>}
          </h3>
          <SmartLink to={e.link} className="ev__go" aria-label={`Open ${e.title}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 12L12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </SmartLink>
        </div>

        <div className="ev__small" style={e.image2 ? { backgroundImage: `url("${img(e.image2)}")` } : undefined}>
          {badge && (
            <div className="ev__badge" aria-hidden="true">
              <span className="ev__badge-icon">▲</span>
              {badge.split("").map((c, n) => (
                <span className="ev__badge-letter" key={n}>
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="ev__row">
        <h2 className="ev__heading">
          <em>{c("ev.em")}</em> {c("ev.title")}
        </h2>
        {events.length > 1 && (
          <div className="ev__nav">
            <button type="button" onClick={() => go(-1)} aria-label="Previous event">
              ←
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next event">
              →
            </button>
          </div>
        )}
      </div>
      {events.length > 1 && (
        <p className="ev__count">
          {i + 1} / {events.length}
        </p>
      )}
    </section>
  );
}
