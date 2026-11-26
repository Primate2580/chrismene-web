import { useState } from "react";
import { api } from "../api.js";
import { useC, useSettings } from "../context/SiteContext.jsx";
import { img } from "./util.jsx";

export default function Newsletter() {
  const { settings } = useSettings();
  const c = useC();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    setState({ status: "loading", message: "" });
    try {
      await api.subscribe(firstName, email);
      setFirstName("");
      setEmail("");
      setState({ status: "ok", message: "Thank you — you're on the list." });
    } catch (err) {
      setState({ status: "error", message: err.message });
    }
  };

  return (
    <section className="news" id="newsletter">
      {/* The photo is a full-bleed layer, positioned with a focus point so the
          head is never cropped on large screens. Adjust it in Admin → Site. */}
      <div className="news__photo" aria-hidden="true">
        <img src={img(c("news.image"))} alt="" style={{ objectPosition: settings.newsletter.focus || "70% 12%" }} />
      </div>

      <div className="news__inner">
        <div className="news__copy">
          <h2 className="news__heading">
            <em>{c("news.l1i")}</em> {c("news.l1")}
            <br />
            <em>{c("news.l2i")}</em> {c("news.l2")}
          </h2>
          <p className="news__text">{c("news.text")}</p>

          <form className="news__form" onSubmit={submit}>
            <input
              type="text"
              name="first_name"
              placeholder={c("news.ph1")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-label="First name"
              autoComplete="given-name"
            />
            <input
              type="email"
              name="email"
              placeholder={c("news.ph2")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              autoComplete="email"
              required
            />
            <button type="submit" disabled={state.status === "loading"}>
              {state.status === "loading" ? "Sending…" : c("news.btn")}
            </button>
          </form>

          {state.message && (
            <p className={"news__msg news__msg--" + state.status} role="status">
              {state.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
