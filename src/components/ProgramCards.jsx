import { useC, useSettings } from "../context/SiteContext.jsx";
import { Lines, SmartLink, img } from "./util.jsx";

/**
 * The "Main Program" section — heading plus the three cards together in ONE
 * section. Used on both the Home and Programs pages so they always match.
 * Cards are edited in Admin → Site → Programme cards.
 */
export default function ProgramCards({ withBackground = false }) {
  const { settings } = useSettings();
  const c = useC();
  const bg = withBackground ? settings.images.programsBg : "";

  return (
    <section
      className={"progs" + (bg ? " progs--photo" : "")}
      id="programs"
      style={bg ? { backgroundImage: `linear-gradient(rgba(255,255,255,.88), rgba(255,255,255,.88)), url("${img(bg)}")` } : undefined}
    >
      <h2 className="progs__heading">
        <em>{c("progs.em")}</em>
        <span>{c("progs.title")}</span>
      </h2>

      <div className="progs__grid">
        {settings.programs.map((p, i) => (
          <SmartLink to={p.link} className="pcard" key={i}>
            <img className="pcard__img" src={img(p.image)} alt="" loading="lazy" />
            <span className="pcard__shade" />
            <span className="pcard__text">
              <span className="pcard__title">
                <Lines text={p.title} />
              </span>
              {p.description && <span className="pcard__desc">{p.description}</span>}
            </span>
            <span className="pcard__arrow" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M5 15L15 5M7 5h8v8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </SmartLink>
        ))}
      </div>
    </section>
  );
}
