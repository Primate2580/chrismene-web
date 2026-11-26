import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useC, useSettings } from "../context/SiteContext.jsx";
import { img } from "./util.jsx";
import { extraPages } from "../../shared/layout.js";

const buildNav = (c) => [
  {
    label: c("nav.meet"),
    to: "/about",
    children: [
      { label: "About Chris", to: "/about" },
      { label: "Mission & Vision", to: "/about#mission" },
      { label: "Speaking", to: "/about#speaking" },
    ],
  },
  { label: c("nav.programs"), to: "/programs" },
  { label: c("nav.events"), to: "/events" },
  { label: c("nav.platforms"), to: "/platforms" },
  { label: c("nav.resources"), to: "/resources" },
  { label: c("nav.connect"), to: "/connect" },
  {
    label: c("nav.store"),
    to: "/store",
    children: [
      { label: "Books", to: "/store#store-items" },
      { label: "All Products", to: "/store" },
    ],
  },
];

function Caret() {
  return (
    <svg className="hdr__caret" width="9" height="6" viewBox="0 0 9 6" aria-hidden="true">
      <path d="M1 1l3.5 3.5L8 1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Items with a sub-menu become a titled group, plain items stay together. */
function groupNav(nav) {
  const groups = [];
  for (const item of nav) {
    if (item.children) groups.push({ title: item.label, items: item.children });
    else if (groups.length && !groups[groups.length - 1].title) groups[groups.length - 1].items.push(item);
    else groups.push({ title: "", items: [item] });
  }
  return groups;
}

export default function Header() {
  const { settings } = useSettings();
  const c = useC();
  const NAV = [...buildNav(c), ...extraPages(settings).filter((p) => p.menu).map((p) => ({ label: p.title, to: `/p/${p.slug}` }))];
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("no-scroll");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const goSubscribe = (e) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth" });
  };

  const brand = settings.logoUrl ? (
    <img src={img(settings.logoUrl)} alt={settings.siteName} className="hdr__logo-img" />
  ) : (
    <span className="hdr__wordmark">{settings.siteName}</span>
  );

  return (
    <>
      <header className="hdr">
        <div className="hdr__inner">
          <Link to="/" className="hdr__brand" aria-label={`${settings.siteName} home`}>
            {brand}
          </Link>

          <nav className="hdr__nav" aria-label="Main">
            {NAV.map((item) =>
              item.children ? (
                <div className="hdr__item hdr__item--has-menu" key={item.label}>
                  <NavLink to={item.to} className="hdr__link">
                    {item.label} <Caret />
                  </NavLink>
                  <div className="hdr__menu">
                    {item.children.map((c) => (
                      <Link key={c.label} to={c.to}>
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="hdr__item" key={item.label}>
                  <NavLink to={item.to} className="hdr__link">
                    {item.label}
                  </NavLink>
                </div>
              )
            )}
          </nav>

          <div className="hdr__tools">
            <a href="#newsletter" className="hdr__cta" onClick={goSubscribe}>
              {c("nav.cta")} <span aria-hidden="true">→</span>
            </a>
            <button
              type="button"
              className="hdr__burger"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <div className={"mscrim" + (open ? " is-open" : "")} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside id="mobile-menu" className={"mside" + (open ? " is-open" : "")} aria-hidden={!open} aria-label="Menu">
        <Link to="/" className="mside__brand" tabIndex={open ? 0 : -1}>
          {brand}
        </Link>
        <nav onClick={(e) => e.target.closest("a") && setOpen(false)}>
          {groupNav(NAV).map((g) => (
            <div className="mside__group" key={g.title || g.items[0].label}>
              {g.title && <span className="mside__title">{g.title}</span>}
              {g.items.map((l) =>
                l.to.includes("#") ? (
                  <Link key={l.label + l.to} to={l.to} className="mside__link" tabIndex={open ? 0 : -1}>
                    {l.label}
                  </Link>
                ) : (
                  <NavLink key={l.label + l.to} to={l.to} end className="mside__link" tabIndex={open ? 0 : -1}>
                    {l.label}
                  </NavLink>
                )
              )}
            </div>
          ))}
        </nav>
        <div className="mside__foot">
          <a href="#newsletter" className="mside__cta" onClick={goSubscribe} tabIndex={open ? 0 : -1}>
            {c("nav.cta")} <span>→</span>
          </a>
        </div>
      </aside>
    </>
  );
}
