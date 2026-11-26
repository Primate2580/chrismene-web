import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { FIELDS, PAGES, THEME_DEFAULTS, defaultFor } from "../../shared/content.js";
import { applyTheme, useSettings } from "../context/SiteContext.jsx";
import { Field, MediaField, SelectField, TextArea, TextField } from "./fields.jsx";

const PAGE_PATH = { global: "/", home: "/", about: "/about", programs: "/programs", events: "/events", platforms: "/platforms", resources: "/resources", store: "/store", connect: "/connect" };

/* ======================================================================
   PAGE CONTENT  — texts, links, button labels and images, page by page
====================================================================== */
export function PageContent() {
  const { settings, setSettings } = useSettings();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "home";
  const [query, setQuery] = useState("");
  const [overrides, setOverrides] = useState(() => ({ ...(settings.content || {}) }));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const saved = settings.content || {};
  const edited = useMemo(() => Object.keys(overrides).length, [overrides]);
  const dirty = JSON.stringify(overrides) !== JSON.stringify(saved);

  const flash = (message, type = "ok") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const valueOf = (key) => (key in overrides ? overrides[key] : defaultFor(key, settings));
  const setValue = (key, v) =>
    setOverrides((o) => {
      const next = { ...o };
      if (v === defaultFor(key, settings)) delete next[key];
      else next[key] = v;
      return next;
    });
  const reset = (key) =>
    setOverrides((o) => {
      const next = { ...o };
      delete next[key];
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.replaceSetting("content", overrides);
      setSettings((s) => ({ ...s, content: res }));
      flash("Saved — the website is updated.");
    } catch (e) {
      flash(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /* what to show */
  const q = query.trim().toLowerCase();
  let blocks; // [{ title, fields }]
  if (q) {
    const hits = Object.values(FIELDS).filter((f) => `${f.label} ${f.key} ${valueOf(f.key)}`.toLowerCase().includes(q));
    blocks = [{ title: `${hits.length} match${hits.length === 1 ? "" : "es"}`, fields: hits }];
  } else if (tab === "buttons") {
    blocks = PAGES.map((p) => ({ title: p.label, fields: p.sections.flatMap((s) => s.fields).filter((f) => f.btn) })).filter((b) => b.fields.length);
  } else {
    const page = PAGES.find((p) => p.id === tab) || PAGES[1];
    blocks = page.sections.map((s) => ({ title: s.label, fields: s.fields }));
  }
  const current = PAGES.find((p) => p.id === tab);

  const renderField = (f) => {
    const value = valueOf(f.key);
    const isEdited = f.key in overrides;
    const common = { label: f.label, value, onChange: (v) => setValue(f.key, v) };
    let input;
    if (f.type === "image") input = <MediaField {...common} kind="image" wide />;
    else if (f.type === "textarea") input = <TextArea {...common} rows={f.rows || 4} wide />;
    else input = <TextField {...common} wide={f.type === "link" || f.btn ? false : true} hint={f.type === "link" ? "/page, #section or a full https:// link" : undefined} />;
    return (
      <div className={"dfield" + (f.type === "image" || f.type === "textarea" ? " dfield--wide" : "") + (isEdited ? " is-edited" : "")} key={f.key}>
        {input}
        {isEdited && (
          <p className="dfield__meta">
            <span className="pill pill--draft">Edited</span>
            <button type="button" className="linkbtn" onClick={() => reset(f.key)}>
              Reset to default
            </button>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Page content</h1>
          <p>Change the texts, links, button labels and images on every page. {edited ? `${edited} item${edited === 1 ? "" : "s"} edited.` : "Nothing edited yet — the original content is showing."}</p>
        </div>
        {!q && current && (
          <Link className="btn" to={PAGE_PATH[tab] || "/"} target="_blank">
            View page ↗
          </Link>
        )}
      </div>

      {toast && <div className={"toast toast--" + toast.type}>{toast.message}</div>}

      <div className="dsearch">
        <input className="ai" placeholder="Search any text, label or setting…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {!q && (
        <div className="tabs" role="tablist">
          {PAGES.map((p) => (
            <button key={p.id} role="tab" aria-selected={tab === p.id} className={"tab" + (tab === p.id ? " is-active" : "")} onClick={() => setParams({ tab: p.id })}>
              {p.id === "global" ? "Site-wide" : p.label}
            </button>
          ))}
          <button role="tab" aria-selected={tab === "buttons"} className={"tab tab--accent" + (tab === "buttons" ? " is-active" : "")} onClick={() => setParams({ tab: "buttons" })}>
            All buttons
          </button>
        </div>
      )}

      {blocks.map((b) => (
        <div className="card editor" key={b.title}>
          <h2>{b.title}</h2>
          {!b.fields.length && <p className="muted">No matching fields.</p>}
          <div className="editor__grid dgrid">{b.fields.map(renderField)}</div>
        </div>
      ))}

      <div className={"savebar" + (dirty ? " is-visible" : "")}>
        <span>{dirty ? "You have unsaved changes" : "All changes saved"}</span>
        <div>
          <button className="btn btn--ghost" disabled={!dirty || saving} onClick={() => setOverrides({ ...saved })}>
            Discard
          </button>
          <button className="btn btn--primary" disabled={!dirty || saving} onClick={save}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================================================================
   THEME & BUTTONS — colours and button style, with a live preview
====================================================================== */
const hexOk = (v) => /^#[0-9a-f]{6}$/i.test(v);

function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
}
const contrast = (a, b) => {
  if (!hexOk(a) || !hexOk(b)) return 21;
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

function ColorField({ label, hint, value, onChange }) {
  return (
    <Field label={label} hint={hint}>
      <div className="color">
        <input type="color" value={hexOk(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} aria-label={label} />
        <input className="ai" value={value} maxLength={7} onChange={(e) => onChange(e.target.value)} spellCheck={false} />
      </div>
    </Field>
  );
}

const GROUPS = [
  {
    title: "Brand colours",
    note: "The main colours of the website.",
    items: [
      ["primary", "Primary", "Dark backgrounds — header, hero, newsletter, events, footer."],
      ["secondary", "Secondary", "Light backgrounds — programs, resources, articles, forms."],
      ["tertiary", "Tertiary (accent)", "Highlights such as the gold accents on the About page."],
      ["quaternary", "Fourth (deep accent)", "Deep accent used on the About page (teal by default)."],
    ],
  },
  {
    title: "Text & surfaces",
    items: [
      ["onPrimary", "Text on dark", "Text that sits on the Primary colour."],
      ["onSecondary", "Text on light", "Text that sits on the Secondary colour."],
      ["ink", "Ink", "Dark cards and outlined buttons on light sections."],
      ["surface", "Soft panels", "Light grey panels, e.g. the Videos and Audio sections."],
    ],
  },
  {
    title: "Buttons",
    note: "Change the wording of any button from Page content → All buttons.",
    items: [
      ["buttonBg", "Button colour — on dark", "Hero, header, newsletter and round arrow buttons."],
      ["buttonText", "Button text — on dark", ""],
      ["buttonAltBg", "Button colour — on light", "“View all”, “Buy now”, “Send message” and similar."],
      ["buttonAltText", "Button text — on light", ""],
    ],
  },
];

export function ThemeEditor() {
  const { settings, setSettings } = useSettings();
  const initial = { ...THEME_DEFAULTS, ...(settings.theme || {}) };
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const savedRef = useRef(settings.theme);
  savedRef.current = settings.theme;

  // show changes live on the whole admin page (and put things back if the user leaves without saving)
  useEffect(() => applyTheme(draft), [draft]);
  useEffect(() => () => applyTheme(savedRef.current), []);

  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const valid = Object.entries(draft).every(([k, v]) => k === "buttonRadius" || hexOk(v));

  const flash = (message, type = "ok") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.replaceSetting("theme", draft);
      setSettings((s) => ({ ...s, theme: res }));
      flash("Saved — the website colours are updated.");
    } catch (e) {
      flash(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const warnings = [
    [contrast(draft.onPrimary, draft.primary), "Text on dark is hard to read on the Primary colour"],
    [contrast(draft.onSecondary, draft.secondary), "Text on light is hard to read on the Secondary colour"],
    [contrast(draft.buttonText, draft.buttonBg), "Button text is hard to read on the dark-section button"],
    [contrast(draft.buttonAltText, draft.buttonAltBg), "Button text is hard to read on the light-section button"],
  ].filter(([r]) => r < 3);

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Theme &amp; buttons</h1>
          <p>Colours and button style for the whole website. You see changes live while you edit.</p>
        </div>
        <Link className="btn" to="/admin/developer/content?tab=buttons">
          Edit button text →
        </Link>
      </div>
      {toast && <div className={"toast toast--" + toast.type}>{toast.message}</div>}

      <div className="split split--theme">
        <div>
          {GROUPS.map((g) => (
            <div className="card editor" key={g.title}>
              <h2>{g.title}</h2>
              {g.note && <p className="muted">{g.note}</p>}
              <div className="editor__grid">
                {g.items.map(([k, label, hint]) => (
                  <ColorField key={k} label={label} hint={hint} value={draft[k]} onChange={set(k)} />
                ))}
                {g.title === "Buttons" && (
                  <SelectField
                    label="Button corners"
                    value={draft.buttonRadius}
                    onChange={set("buttonRadius")}
                    options={[
                      ["999px", "Pill (fully round)"],
                      ["16px", "Rounded"],
                      ["6px", "Slightly rounded"],
                      ["0px", "Square"],
                    ]}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="preview">
          <div className="card">
            <h2>Live preview</h2>
            <div className="tpv">
              <div className="tpv__dark">
                <h3>
                  <em>Hi,</em> I'm Chris
                </h3>
                <p>Text on the Primary colour.</p>
                <span className="tpv__btn tpv__btn--dark">Book A Discovery Call →</span>
              </div>
              <div className="tpv__light">
                <h3>
                  <em>Main</em> Program
                </h3>
                <p>Text on the Secondary colour.</p>
                <span className="tpv__btn tpv__btn--light">View all videos</span>
                <div className="tpv__accents">
                  <span style={{ background: "var(--c-tertiary)" }} />
                  <span style={{ background: "var(--c-quaternary)" }} />
                  <span style={{ background: "var(--c-surface)", border: "1px solid #ddd" }} />
                  <span style={{ background: "var(--c-ink)" }} />
                </div>
              </div>
            </div>
            {warnings.map(([, msg]) => (
              <p className="af__error" key={msg}>
                ⚠ {msg}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className={"savebar" + (dirty ? " is-visible" : "")}>
        <span>{valid ? (dirty ? "You have unsaved changes" : "All changes saved") : "Use 6-digit colours like #1a2b3c"}</span>
        <div>
          <button className="btn btn--ghost" onClick={() => setDraft({ ...THEME_DEFAULTS })}>
            Reset to original colours
          </button>
          <button className="btn btn--ghost" disabled={!dirty} onClick={() => setDraft(initial)}>
            Discard
          </button>
          <button className="btn btn--primary" disabled={!dirty || !valid || saving} onClick={save}>
            {saving ? "Saving…" : "Save theme"}
          </button>
        </div>
      </div>
    </div>
  );
}
