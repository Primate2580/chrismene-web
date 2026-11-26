import { useState } from "react";
import { api } from "../api.js";
import { useC } from "../context/SiteContext.jsx";
import { Rich } from "./util.jsx";

/** The "Connect" contact form — a section like any other. */
export default function ContactForm() {
  const c = useC();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState({ status: "idle", message: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setState({ status: "loading", message: "" });
    try {
      await api.contact(form);
      setForm({ name: "", email: "", message: "" });
      setState({ status: "ok", message: c("contact.ok") });
    } catch (err) {
      setState({ status: "error", message: err.message });
    }
  };

  return (
    <section className="contact" id="contact-form">
      <div className="contact__inner">
        <h2>
          <Rich text={c("contact.heading")} />
        </h2>
        <form onSubmit={submit}>
          <label>
            Name
            <input value={form.name} onChange={set("name")} required autoComplete="name" />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
          </label>
          <label>
            Message
            <textarea rows="6" value={form.message} onChange={set("message")} required />
          </label>
          <button type="submit" disabled={state.status === "loading"}>
            {state.status === "loading" ? "Sending…" : c("contact.btn")}
          </button>
          {state.message && <p className={"contact__msg contact__msg--" + state.status}>{state.message}</p>}
        </form>
      </div>
    </section>
  );
}
