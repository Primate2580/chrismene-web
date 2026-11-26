import { SmartLink, img } from "./util.jsx";

/**
 * One hero used on every page so they all share the reference layout.
 *
 *   lead    – italic serif word(s), e.g. "Hi,"
 *   after   – plain words on the same line, e.g. " I'm"
 *   title   – second line, e.g. "Chris Mene"
 *   variant – "cutout": transparent portrait standing on the black background (home)
 *             "blend":  wide photo that fades into the black background (inner pages)
 *
 * There is intentionally no signature/scribble graphic behind the portrait.
 */
export default function Hero({ lead, after = "", title, description, buttons = [], image, variant = "blend", focus }) {
  return (
    <section className={`hero hero--${variant}`}>
      {variant === "blend" && image && (
        <div
          className="hero__bg"
          style={{ backgroundImage: `url("${img(image)}")`, backgroundPosition: focus || "72% 15%" }}
          role="img"
          aria-label=""
        />
      )}

      <div className="hero__inner">
        <div className="hero__copy">
          <h1 className="hero__title">
            {lead && <em>{lead}</em>}
            {after}
            {(lead || after) && <br />}
            {title}
          </h1>

          {description && <p className="hero__desc">{description}</p>}

          {buttons.length > 0 && (
            <div className="hero__buttons">
              {buttons.map((b) => (
                <SmartLink key={b.label} to={b.to} className="hero__btn">
                  {b.label} <span aria-hidden="true">→</span>
                </SmartLink>
              ))}
            </div>
          )}
        </div>

        {variant === "cutout" && image && (
          <div className="hero__visual">
            <img src={img(image)} alt="" className="hero__person" />
          </div>
        )}
      </div>
    </section>
  );
}
