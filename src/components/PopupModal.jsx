import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "../context/SiteContext.jsx";
import { Emphasis, SmartLink, img } from "./util.jsx";

const SEEN_KEY = "cm_popup_seen";

/**
 * Pop-up modal shown on every public page.
 * Controlled from Admin → Pop-up (image, text, button, delay, how often).
 */
export default function PopupModal() {
  const { settings, ready } = useSettings();
  const popup = settings.popup || {};
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    if (!ready || !popup.enabled) return;
    if (popup.frequency === "session") {
      try {
        if (sessionStorage.getItem(SEEN_KEY)) return;
      } catch { /* ignore */ }
    }
    const t = setTimeout(() => setOpen(true), Math.max(0, Number(popup.delay) || 0));
    return () => clearTimeout(t);
  }, [pathname, ready, popup.enabled, popup.frequency, popup.delay]);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("no-scroll");
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("no-scroll");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="popup" role="dialog" aria-modal="true" aria-label={popup.title} onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="popup__panel">
        <button type="button" className="popup__close" aria-label="Close" onClick={close}>
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <div className="popup__media">
          {popup.image ? (
            <img src={img(popup.image)} alt="" />
          ) : (
            <div className="popup__poster">
              <span>{settings.siteName}</span>
              <strong>{(popup.title || "").replace(/\*/g, "")}</strong>
            </div>
          )}
        </div>

        <div className="popup__body">
          <h2 className="popup__title">
            <Emphasis text={popup.title} />
          </h2>
          {popup.subtitle && <p className="popup__sub">{popup.subtitle}</p>}
          {popup.buttonText && (
            <SmartLink to={popup.buttonLink} className="popup__btn" onClick={close}>
              {popup.buttonText}
            </SmartLink>
          )}
        </div>
      </div>
    </div>
  );
}
