import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { img } from "../components/util.jsx";
import "./builder.css";

const size = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function useMedia() {
  const [files, setFiles] = useState(null);
  const [error, setError] = useState("");
  const load = () =>
    api
      .media()
      .then(setFiles)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  return { files, error, setError, load };
}

function Thumb({ f }) {
  if (f.type === "image") return <img src={img(f.url)} alt="" loading="lazy" />;
  return <div className="mlib__icon">{f.type === "video" ? "▶ Video" : "♪ Audio"}</div>;
}

/** Pop-up used by every “Library” button: click a file you already uploaded. */
export function MediaPicker({ kind = "image", multiple = false, onPick, onClose }) {
  const { files, error } = useMedia();
  const [chosen, setChosen] = useState([]);
  const list = (files || []).filter((f) => f.type === kind);
  const toggle = (f) => (multiple ? setChosen((c) => (c.includes(f.url) ? c.filter((u) => u !== f.url) : [...c, f.url])) : onPick(f.url));
  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2>Choose from your uploads</h2>
          <button type="button" className="btn btn--small btn--ghost" onClick={onClose}>
            Close
          </button>
        </div>
        {error && <p className="af__error">{error}</p>}
        {!files && !error && <p className="muted">Loading…</p>}
        {files && !list.length && <p className="muted">Nothing uploaded yet. Use the Upload button first.</p>}
        <div className="mlib mlib--pick">
          {list.map((f) => (
            <button type="button" key={f.name} className={"mlib__item" + (chosen.includes(f.url) ? " is-picked" : "")} onClick={() => toggle(f)} title={f.name}>
              <Thumb f={f} />
              <span>{f.name.replace(/^\d+-[a-f0-9]{6}-/, "")}</span>
            </button>
          ))}
        </div>
        {multiple && (
          <div className="modal__foot">
            <button type="button" className="btn btn--primary" disabled={!chosen.length} onClick={() => onPick(chosen)}>
              Add {chosen.length || ""} selected
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Admin → Media library */
export function MediaLibrary() {
  const { files, error, setError, load } = useMedia();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState("");

  const add = async (fileList) => {
    setBusy(true);
    setError("");
    try {
      for (const f of fileList) await api.upload(f);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  const remove = async (f) => {
    const warn = f.used ? "This file is used somewhere on the site. Deleting it will leave a gap there.\n\n" : "";
    if (!window.confirm(`${warn}Delete ${f.name} for good?`)) return;
    try {
      await api.removeMedia(f.name);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  const copy = async (f) => {
    try {
      await navigator.clipboard.writeText(location.origin + f.url);
      setCopied(f.name);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      window.prompt("Copy this link:", location.origin + f.url);
    }
  };

  const list = (files || []).filter((f) => filter === "all" || (filter === "unused" ? !f.used : f.type === filter));
  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Media library</h1>
          <p>Every image, video and audio file you have uploaded. Reuse them anywhere with the “Library” buttons.</p>
        </div>
        <button className="btn btn--primary" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? "Uploading…" : "+ Upload files"}
        </button>
        <input ref={input} type="file" hidden multiple accept="image/*,video/*,audio/*" onChange={(e) => add([...e.target.files])} />
      </div>
      {error && <div className="toast toast--error">{error}</div>}
      <div className="tabs">
        {[["all", "All"], ["image", "Images"], ["video", "Videos"], ["audio", "Audio"], ["unused", "Not used anywhere"]].map(([k, l]) => (
          <button key={k} className={"tab" + (filter === k ? " is-active" : "")} onClick={() => setFilter(k)}>
            {l}
          </button>
        ))}
      </div>
      {!files && !error && <p className="muted">Loading…</p>}
      {files && !list.length && <div className="card"><p className="muted">No files here yet.</p></div>}
      <div className="mlib">
        {list.map((f) => (
          <div className="mlib__item mlib__item--card" key={f.name}>
            <Thumb f={f} />
            <span title={f.name}>{f.name.replace(/^\d+-[a-f0-9]{6}-/, "")}</span>
            <small>
              {size(f.size)} · {f.used ? "In use" : "Not used"}
            </small>
            <div className="mlib__actions">
              <button className="btn btn--small" onClick={() => copy(f)}>
                {copied === f.name ? "Copied" : "Copy link"}
              </button>
              <button className="btn btn--small btn--danger" onClick={() => remove(f)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
