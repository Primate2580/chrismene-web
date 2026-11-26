import { Link } from "react-router-dom";
import { useC } from "../context/SiteContext.jsx";
import { Lines, Rich, SmartLink } from "./util.jsx";

/* ---------------------------------------------------------------- Footer */
export function Footer({ siteName }) {
  const c = useC();
  return (
    <footer className="pg-foot">
      <div className="pg-foot-top">
        <div className="pg-foot-col">
          <Link to="/" className="pg-foot-brand">
            {siteName}
          </Link>
          <p className="pg-foot-tag">{c("foot.tag")}</p>
        </div>
        <div className="pg-foot-col">
          <h4 className="pg-foot-heading">Quick Links</h4>
          <ul className="pg-foot-list">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/programs">Programs</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/platforms">Platforms</Link></li>
            <li><Link to="/resources">Resources</Link></li>
            <li><Link to="/store">Store</Link></li>
          </ul>
        </div>
        <div className="pg-foot-col">
          <h4 className="pg-foot-heading">Legal</h4>
          <ul className="pg-foot-list">
            <li><a href="#">Terms &amp; Conditions</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Cookie Policy</a></li>
            <li><a href="#">Press</a></li>
          </ul>
          <div className="pg-foot-socials">
            <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
            <a href="#" aria-label="X"><i className="fa-brands fa-x-twitter" /></a>
            <a href="mailto:hello@example.com" aria-label="Email"><i className="fa-solid fa-envelope" /></a>
            <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a>
            <a href="#" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" /></a>
          </div>
        </div>
      </div>
      <div className="pg-foot-bottom">
        <p>&copy; {new Date().getFullYear()} {c("foot.copy")}</p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------- Leadership Live */
export function LeadershipLive() {
  const c = useC();
  return (
    <section className="pg-live">
      <h2 className="pg-live-heading">
        {c("live.l1")} <em>{c("live.em")}</em>
        <br />
        {c("live.l2")}
      </h2>
      <p className="pg-live-sub">{c("live.sub")}</p>

      <div className="pg-live-card">
        <div className="pg-live-inner">
          <div className="pg-live-left">
            <h3 className="pg-live-title">
              <Lines text={c("live.title")} />
            </h3>
            <p className="pg-live-time">{c("live.time")}</p>
            <div className="pg-live-socials">
              <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube" /></a>
              <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a>
              <a href="#" aria-label="X"><i className="fa-brands fa-x-twitter" /></a>
              <a href="#" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" /></a>
              <a href="#" className="ig" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
            </div>
          </div>
          <div className="pg-live-center">
            <Link to="/resources#videos" className="pg-live-play" aria-label="Watch Leadership Live">
              <i className="fa-solid fa-play" />
            </Link>
          </div>
        </div>
      </div>

      <SmartLink to={c("live.prevLink")} className="pg-live-prev">
        {c("live.prev")} <i className="fa-solid fa-arrow-right" />
      </SmartLink>
    </section>
  );
}

/* ---------------------------------------------------------- Testimonials */
export function Testimonials() {
  const c = useC();
  const items = [1, 2, 3].map((n) => ({ quote: c(`testi.q${n}`), name: c(`testi.n${n}`) }));
  return (
    <section className="pg-testi">
      <div className="pg-testi-top">
        <p className="pg-testi-label">{c("testi.label")}</p>
        <h2 className="pg-testi-heading">
          <Rich text={c("testi.heading")} />
        </h2>
        <div className="pg-testi-line" />
      </div>
      <div className="pg-testi-grid">
        {items.map((t, i) => (
          <div className="pg-testi-item" key={i}>
            <p className="pg-testi-quote">{t.quote}</p>
            <p className="pg-testi-name">{t.name}</p>
          </div>
        ))}
      </div>
      <div className="pg-testi-dots">
        <span className="active" />
        <span />
        <span />
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Featured book */
export function FeaturedBook() {
  const c = useC();
  const steps = c("book.steps")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0 ? [l.slice(0, i + 1), l.slice(i + 1).trim()] : ["", l];
    });
  return (
    <section className="pg-books">
      <div className="pg-books-top">
        <h2 className="pg-books-heading">
          <Rich text={c("book.heading")} />
        </h2>
        <Link to="/store" className="pg-books-viewall">{c("book.viewall")}</Link>
      </div>
      <div className="pg-books-row">
        <div className="pg-books-cover-wrap"><div className="pg-books-cover" /></div>
        <div className="pg-books-content">
          <h3 className="pg-books-title">{c("book.title")}</h3>
          <p className="pg-books-text">{c("book.text1")}</p>
          <p className="pg-books-text">{c("book.text2")}</p>
          <ol className="pg-books-list">
            {steps.map(([bold, rest], i) => (
              <li key={i}>
                {bold && <b>{bold}</b>} {rest}
              </li>
            ))}
          </ol>
          <p className="pg-books-text">{c("book.text3")}</p>
          <SmartLink to={c("book.ctaLink")} className="pg-books-cta">{c("book.cta")}</SmartLink>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------- Featured organisation */
export function FeaturedOrg() {
  return (
    <section className="pg-feat">
      <div className="bgimg" />
      <div className="overlay" />
      <div className="logos">
        <div className="logo-text logo-forbes">Forbes</div>
        <div className="logo-text logo-horasis">
          <div className="h1">Horasis</div>
          <div className="h2">The Global Visions Community</div>
        </div>
        <div className="logo-text logo-wef">
          WORLD
          <br />
          ECONOMIC
          <br />
          FORUM
        </div>
        <div className="logo-text logo-guardian">theguardian</div>
      </div>
    </section>
  );
}
