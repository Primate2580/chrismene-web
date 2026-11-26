import { useRef, useState } from "react";
import { api } from "../api.js";
import { embedUrl, img, youtubeThumb } from "../components/util.jsx";
import { MediaPicker } from "./MediaLibrary.jsx";

export function Field({ label, hint, children, wide }) {
  return (
    <div className={"af" + (wide ? " af--wide" : "")}>
      <label className="af__label">{label}</label>
      {children}
      {hint && <p className="af__hint">{hint}</p>}
    </div>
  );
}

export const TextField = ({ label, value, onChange, hint, placeholder, wide, type = "text" }) => (
  <Field label={label} hint={hint} wide={wide}>
    <input className="ai" type={type} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </Field>
);

export const TextArea = ({ label, value, onChange, hint, rows = 5, wide = true, placeholder }) => (
  <Field label={label} hint={hint} wide={wide}>
    <textarea className="ai" rows={rows} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </Field>
);

export const SelectField = ({ label, value, onChange, options, hint }) => (
  <Field label={label} hint={hint}>
    <select className="ai" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  </Field>
);

export const Toggle = ({ label, checked, onChange, hint }) => (
  <Field label={label} hint={hint}>
    <button type="button" className={"toggle" + (checked ? " is-on" : "")} onClick={() => onChange(!checked)} aria-pressed={!!checked}>
      <span />
      {checked ? "On" : "Off"}
    </button>
  </Field>
);

const ACCEPT = { image: "image/*", video: "video/*", audio: "audio/*" };

/** Upload a file OR paste a link. kind: "image" | "video" | "audio" */
export function MediaField({ label, value, onChange, kind = "image", hint, wide = true }) {
  const input = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      const res = await api.upload(file, setProgress);
      onChange(res.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  };

  const isVideoFile = kind === "video" && value && !embedUrl(value);

  return (
    <Field label={label} hint={hint} wide={wide}>
      <div className="media">
        <div className="media__row">
          <input
            className="ai"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={kind === "video" ? "Upload a file or paste a YouTube / Vimeo / video link" : "Upload a file or paste a link"}
          />
          <button type="button" className="btn" onClick={() => input.current?.click()} disabled={progress !== null}>
            {progress !== null ? `${progress}%` : "Upload"}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setPicking(true)}>
            Library
          </button>
          {value && (
            <button type="button" className="btn btn--ghost" onClick={() => onChange("")}>
              Remove
            </button>
          )}
          <input ref={input} type="file" hidden accept={ACCEPT[kind]} onChange={(e) => upload(e.target.files?.[0])} />
          {picking && <MediaPicker kind={kind === "video" ? "video" : kind} onPick={(u) => { onChange(u); setPicking(false); }} onClose={() => setPicking(false)} />}
        </div>

        {progress !== null && (
          <div className="bar">
            <span style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && <p className="af__error">{error}</p>}

        {value && kind === "image" && <img className="media__preview" src={img(value)} alt="" />}
        {value && kind === "audio" && <audio className="media__audio" src={img(value)} controls preload="none" />}
        {value && kind === "video" &&
          (isVideoFile ? (
            <video className="media__preview" src={img(value)} controls preload="metadata" />
          ) : (
            youtubeThumb(value) && <img className="media__preview" src={youtubeThumb(value)} alt="" />
          ))}
      </div>
    </Field>
  );
}

/** Several images at once (gallery) */
export function GalleryField({ label, value = [], onChange, hint }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const add = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const urls = [];
      for (const f of files) urls.push((await api.upload(f)).url);
      onChange([...(value || []), ...urls]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <Field label={label} hint={hint} wide>
      <div className="gallery">
        {(value || []).map((u, i) => (
          <div className="gallery__item" key={u + i}>
            <img src={img(u)} alt="" />
            <button type="button" onClick={() => onChange(value.filter((_, n) => n !== i))} aria-label="Remove image">
              ×
            </button>
          </div>
        ))}
        <button type="button" className="gallery__add" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? "Uploading…" : "+ Add images"}
        </button>
        <input ref={input} type="file" hidden multiple accept="image/*" onChange={(e) => add([...e.target.files])} />
      </div>
      {error && <p className="af__error">{error}</p>}
    </Field>
  );
}

/** List of {label, url} — for podcast platforms (Apple, Spotify, YouTube …) */
export function LinksField({ label, value = [], onChange, hint }) {
  const set = (i, k, v) => onChange(value.map((l, n) => (n === i ? { ...l, [k]: v } : l)));
  return (
    <Field label={label} hint={hint} wide>
      <div className="links">
        {(value || []).map((l, i) => (
          <div className="links__row" key={i}>
            <input className="ai" placeholder="Label (e.g. Spotify)" value={l.label} onChange={(e) => set(i, "label", e.target.value)} />
            <input className="ai" placeholder="https://…" value={l.url} onChange={(e) => set(i, "url", e.target.value)} />
            <button type="button" className="btn btn--ghost" onClick={() => onChange(value.filter((_, n) => n !== i))}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="btn" onClick={() => onChange([...(value || []), { label: "", url: "" }])}>
          + Add link
        </button>
      </div>
    </Field>
  );
}
