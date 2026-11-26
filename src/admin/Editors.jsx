import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Emphasis, Lines, formatDate, img } from "../components/util.jsx";
import { useSettings } from "../context/SiteContext.jsx";
import { Field, GalleryField, MediaField, SelectField, TextArea, TextField, Toggle } from "./fields.jsx";

function useSettingsForm(pick) {
  const { settings, setSettings } = useSettings();
  const [draft, setDraft] = useState(() => structuredClone(pick(settings)));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const flash = (message, type = "ok") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const save = async (payload) => {
    setSaving(true);
    try {
      const saved = await api.saveSettings(payload);
      setSettings((s) => ({ ...s, ...saved }));
      flash("Saved — the website is updated.");
    } catch (e) {
      flash(e.message, "error");
    } finally {
      setSaving(false);
    }
  };
  return { settings, draft, setDraft, save, saving, toast };
}

/* ---------------------------------------------------------------- pop-up */
export function PopupEditor() {
  const { draft, setDraft, save, saving, toast } = useSettingsForm((s) => s.popup);
  const { settings } = useSettings();
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Pop-up</h1>
          <p>The pop-up shown on every page of the website.</p>
        </div>
      </div>
      {toast && <div className={"toast toast--" + toast.type}>{toast.message}</div>}

      <div className="split">
        <form
          className="card editor"
          onSubmit={(e) => {
            e.preventDefault();
            save({ popup: { ...draft, delay: Number(draft.delay) || 0 } });
          }}
        >
          <div className="editor__grid">
            <Toggle label="Show the pop-up" checked={draft.enabled} onChange={set("enabled")} />
            <SelectField
              label="How often"
              value={draft.frequency}
              onChange={set("frequency")}
              options={[
                ["everyPage", "On every page the visitor opens"],
                ["session", "Once per visit (until they close the browser)"],
              ]}
            />
            <MediaField label="Image" kind="image" value={draft.image} onChange={set("image")} hint="Square works best (about 800×800). If empty, an orange text poster is shown." />
            <TextField label="Title" value={draft.title} onChange={set("title")} wide hint="Put *stars* around words you want in italics, e.g. Leadership *Live* with Chris." />
            <TextArea label="Small text" rows={2} value={draft.subtitle} onChange={set("subtitle")} />
            <TextField label="Button text" value={draft.buttonText} onChange={set("buttonText")} hint="Leave empty to hide the button." />
            <TextField label="Button link" value={draft.buttonLink} onChange={set("buttonLink")} hint="/platforms or a full https:// link." />
            <TextField label="Delay (milliseconds)" type="number" value={draft.delay} onChange={set("delay")} hint="800 = just under a second after the page loads." />
          </div>
          <div className="editor__actions">
            <button className="btn btn--primary" disabled={saving}>
              {saving ? "Saving…" : "Save pop-up"}
            </button>
          </div>
        </form>

        <div className="card preview">
          <h2>Preview</h2>
          <div className="preview__stage">
            <div className="popup__panel" style={{ animation: "none", maxWidth: 640 }}>
              <span className="popup__close" style={{ pointerEvents: "none" }}>
                ×
              </span>
              <div className="popup__media">
                {draft.image ? (
                  <img src={img(draft.image)} alt="" />
                ) : (
                  <div className="popup__poster">
                    <span>{settings.siteName}</span>
                    <strong>{(draft.title || "").replace(/\*/g, "")}</strong>
                  </div>
                )}
              </div>
              <div className="popup__body">
                <h2 className="popup__title">
                  <Emphasis text={draft.title} />
                </h2>
                {draft.subtitle && <p className="popup__sub">{draft.subtitle}</p>}
                {draft.buttonText && <span className="popup__btn">{draft.buttonText}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ site */
function FocusPicker({ image, value, onChange }) {
  const [x, y] = (value || "70% 12%").split(/\s+/).map((n) => parseFloat(n) || 0);
  const set = (nx, ny) => onChange(`${Math.round(nx)}% ${Math.round(ny)}%`);
  return (
    <Field label="Newsletter photo — focus point" wide hint="Drag the sliders until the head is fully visible in the preview. This is how the photo is cropped on large screens.">
      <div className="focus">
        <div className="focus__preview">
          {image ? <img src={img(image)} alt="" style={{ objectPosition: `${x}% ${y}%` }} /> : <span>Upload the newsletter photo first</span>}
        </div>
        <label>
          Left ↔ right ({Math.round(x)}%)
          <input type="range" min="0" max="100" value={x} onChange={(e) => set(+e.target.value, y)} />
        </label>
        <label>
          Top ↕ bottom ({Math.round(y)}%)
          <input type="range" min="0" max="100" value={y} onChange={(e) => set(x, +e.target.value)} />
        </label>
      </div>
    </Field>
  );
}

export function SiteEditor() {
  const { draft, setDraft, save, saving, toast } = useSettingsForm((s) => ({
    siteName: s.siteName,
    logoUrl: s.logoUrl,
    images: s.images,
    newsletter: s.newsletter,
    programs: s.programs,
  }));

  const setTop = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));
  const setImg = (k) => (v) => setDraft((d) => ({ ...d, images: { ...d.images, [k]: v } }));
  const setNews = (k) => (v) => setDraft((d) => ({ ...d, newsletter: { ...d.newsletter, [k]: v } }));
  const setProg = (i, k) => (v) =>
    setDraft((d) => ({ ...d, programs: d.programs.map((p, n) => (n === i ? { ...p, [k]: v } : p)) }));

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Site &amp; images</h1>
          <p>Hero photos, newsletter photo, programme cards and About page images.</p>
        </div>
        <button className="btn btn--primary" disabled={saving} onClick={() => save(draft)}>
          {saving ? "Saving…" : "Save all changes"}
        </button>
      </div>
      {toast && <div className={"toast toast--" + toast.type}>{toast.message}</div>}

      <div className="card editor">
        <h2>General</h2>
        <div className="editor__grid">
          <TextField label="Site name" value={draft.siteName} onChange={setTop("siteName")} />
          <MediaField label="Logo image (optional)" kind="image" value={draft.logoUrl} onChange={setTop("logoUrl")} hint="Shown in the header instead of the name. Use a white logo on a transparent background." />
        </div>
      </div>

      <div className="card editor">
        <h2>Hero photos</h2>
        <div className="editor__grid">
          <MediaField label="Home hero portrait" kind="image" value={draft.images.hero} onChange={setImg("hero")} hint="A cut-out portrait (transparent PNG/WebP) works best. A larger file than 240×300 will look sharper." />
          <MediaField label="Other pages hero photo" kind="image" value={draft.images.innerHero} onChange={setImg("innerHero")} hint="Used on About, Programs, Events, Platforms, Resources, Store and Connect. It fades into the black background." />
        </div>
      </div>

      <div className="card editor">
        <h2>Newsletter</h2>
        <div className="editor__grid">
          <MediaField label="Newsletter photo" kind="image" value={draft.images.newsletter} onChange={setImg("newsletter")} />
          <TextArea label="Text under the headline" rows={2} value={draft.newsletter.text} onChange={setNews("text")} />
          <FocusPicker image={draft.images.newsletter} value={draft.newsletter.focus} onChange={setNews("focus")} />
        </div>
      </div>

      <div className="card editor">
        <h2>Main Program cards</h2>
        <p className="muted">These three cards appear together on the Home and Programs pages.</p>
        <div className="editor__grid">
          {draft.programs.map((p, i) => (
            <div className="subcard" key={i}>
              <h3>Card {i + 1}</h3>
              <TextArea label="Title" rows={2} value={p.title} onChange={setProg(i, "title")} wide hint="Press Enter for a second line." />
              <MediaField label="Photo" kind="image" value={p.image} onChange={setProg(i, "image")} />
              <TextArea label="Hover text" rows={2} value={p.description} onChange={setProg(i, "description")} />
              <TextField label="Link" value={p.link} onChange={setProg(i, "link")} wide />
            </div>
          ))}
          <MediaField label="Programs page background photo (optional)" kind="image" value={draft.images.programsBg} onChange={setImg("programsBg")} hint="Shown faintly behind the cards on the Programs page only." />
        </div>
      </div>

      <div className="card editor">
        <h2>About page</h2>
        <div className="editor__grid">
          <MediaField label="Portrait" kind="image" value={draft.images.aboutPortrait} onChange={setImg("aboutPortrait")} />
          <MediaField label="On-stage photo" kind="image" value={draft.images.stage} onChange={setImg("stage")} />
          <GalleryField label="Photo gallery" value={draft.images.gallery} onChange={setImg("gallery")} hint="Leave empty to hide the gallery strip." />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- inbox */
export function Inbox() {
  const [data, setData] = useState({ subscribers: [], messages: [] });
  const [error, setError] = useState("");
  const load = () => api.inbox().then(setData).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const del = async (kind, id) => {
    if (!window.confirm("Delete this entry?")) return;
    await api.removeInbox(kind, id);
    load();
  };

  const exportCsv = () => {
    const rows = [["First name", "Email", "Date"], ...data.subscribers.map((s) => [s.firstName, s.email, s.createdAt])];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "subscribers.csv";
    a.click();
  };

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Subscribers &amp; messages</h1>
          <p>Everything visitors send through the website.</p>
        </div>
        <button className="btn" onClick={exportCsv} disabled={!data.subscribers.length}>
          Export subscribers (CSV)
        </button>
      </div>
      {error && <div className="toast toast--error">{error}</div>}

      <div className="card list">
        <h2 className="list__title">Messages ({data.messages.length})</h2>
        {!data.messages.length && <p className="list__empty">No messages yet.</p>}
        {data.messages.map((m) => (
          <div className="msg" key={m.id}>
            <div>
              <strong>{m.name}</strong> · <a href={`mailto:${m.email}`}>{m.email}</a> <small>{formatDate(m.createdAt)}</small>
              <p>{m.message}</p>
            </div>
            <button className="btn btn--small btn--danger" onClick={() => del("messages", m.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="card list">
        <h2 className="list__title">Newsletter subscribers ({data.subscribers.length})</h2>
        {!data.subscribers.length && <p className="list__empty">No subscribers yet.</p>}
        {data.subscribers.map((s) => (
          <div className="list__row" key={s.id}>
            <div className="list__main">
              <strong>{s.firstName || "—"}</strong>
              <small>
                {s.email} · {formatDate(s.createdAt)}
              </small>
            </div>
            <button className="btn btn--small btn--danger" onClick={() => del("subscribers", s.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
