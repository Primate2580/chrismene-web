import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { img } from "../components/util.jsx";
import { CustomSection } from "../components/CustomSections.jsx";
import { useSettings } from "../context/SiteContext.jsx";
import {
  BUILTIN, CUSTOM_TYPES, PAGE_LABELS, PAGE_PATHS, RATIOS, SHAPES, SPACING, THEMES,
  blankBlock, builtinItem, extraPages, pageKey, resolveLayout, slugify, uid,
} from "../../shared/layout.js";
import { Field, MediaField, SelectField, TextArea, TextField, Toggle } from "./fields.jsx";
import { MediaPicker } from "./MediaLibrary.jsx";
import "./builder.css";

/* ------------------------------------------------------------ small inputs */
function Seg({ label, value, options, onChange, hint }) {
  return (
    <Field label={label} hint={hint}>
      <div className="seg" role="group" aria-label={label}>
        {options.map(([v, l]) => (
          <button type="button" key={v} className={"seg__btn" + (value === v ? " is-on" : "")} aria-pressed={value === v} onClick={() => onChange(v)}>
            {l}
          </button>
        ))}
      </div>
    </Field>
  );
}

function Slider({ label, value, min, max, step = 1, unit = "", onChange, hint }) {
  return (
    <Field label={`${label}: ${value}${unit}`} hint={hint}>
      <input className="range" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </Field>
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="colorrow">
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"} onChange={(e) => onChange(e.target.value)} />
        <input className="ai" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </Field>
  );
}

/** Several pictures: add, choose from library, reorder, remove. */
function ImageList({ label, value = [], onChange, hint }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);

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
  const move = (i, d) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <Field label={label} hint={hint} wide>
      <div className="imglist">
        {(value || []).map((u, i) => (
          <div className="imglist__item" key={u + i}>
            <img src={img(u)} alt="" />
            <div className="imglist__bar">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier" title="Move earlier">◀</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move later" title="Move later">▶</button>
              <button type="button" onClick={() => onChange(value.filter((_, n) => n !== i))} aria-label="Remove picture" title="Remove picture">✕</button>
            </div>
          </div>
        ))}
        <div className="imglist__add">
          <button type="button" className="btn btn--small" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? "Uploading…" : "+ Upload"}
          </button>
          <button type="button" className="btn btn--small btn--ghost" onClick={() => setPicking(true)}>
            + From library
          </button>
        </div>
        <input ref={input} type="file" hidden multiple accept="image/*" onChange={(e) => add([...e.target.files])} />
      </div>
      {error && <p className="af__error">{error}</p>}
      {picking && <MediaPicker kind="image" multiple onPick={(urls) => { onChange([...(value || []), ...urls]); setPicking(false); }} onClose={() => setPicking(false)} />}
    </Field>
  );
}

/* ------------------------------------------------------------ block editors */
function StyleFields({ item, set, noSpacing }) {
  const d = item.data;
  return (
    <>
      <SelectField label="Background" value={d.theme} onChange={set("theme")} options={THEMES} hint="Light, dark and gold follow your colours in Theme & buttons." />
      {d.theme === "custom" && <ColorInput label="Background colour" value={d.bgColor} onChange={set("bgColor")} />}
      {!noSpacing && <SelectField label="Space above" value={d.padTop} onChange={set("padTop")} options={SPACING} />}
      {!noSpacing && <SelectField label="Space below" value={d.padBottom} onChange={set("padBottom")} options={SPACING} />}
    </>
  );
}

function BlockEditor({ item, onChange }) {
  const d = item.data;
  const set = (k) => (v) => onChange({ ...item, data: { ...d, [k]: v } });
  const setItem = (k) => (v) => onChange({ ...item, [k]: v });
  const side = d.position === "left" || d.position === "right";
  const textFields = (extra) => (
    <>
      {"eyebrow" in d && <TextField label="Small label above heading (optional)" value={d.eyebrow} onChange={set("eyebrow")} />}
      <TextField label="Heading" value={d.heading} onChange={set("heading")} wide hint="Put *stars* around a word to make it italic." />
      <TextArea label="Text" rows={6} value={d.body} onChange={set("body")} hint="Leave a blank line between paragraphs." />
      {extra}
      <TextField label="Button text (empty = no button)" value={d.buttonText} onChange={set("buttonText")} />
      <TextField label="Button link" value={d.buttonLink} onChange={set("buttonLink")} hint="/page, #section or a full https:// link" />
    </>
  );
  const align = <Seg label="Text alignment" value={d.textAlign} onChange={set("textAlign")} options={[["left", "Left"], ["center", "Centre"], ["right", "Right"]]} />;

  let body;
  switch (item.type) {
    case "media":
      body = (
        <>
          <div className="bgroup"><h4>Words</h4><div className="editor__grid">{textFields()}</div></div>
          <div className="bgroup">
            <h4>Pictures</h4>
            <div className="editor__grid">
              <ImageList label="Pictures in this section" value={d.images} onChange={set("images")} hint="Add one or more. Remove them all for a text-only section." />
            </div>
          </div>
          <div className="bgroup">
            <h4>Where the picture goes</h4>
            <div className="editor__grid">
              <Seg label="Picture position" value={d.position} onChange={set("position")} options={[["left", "◧ Left of text"], ["right", "◨ Right of text"], ["top", "⬒ Above text"], ["bottom", "⬓ Below text"]]} />
              <Slider label="Picture size" value={d.imageWidth} min={20} max={side ? 75 : 100} unit="%" onChange={set("imageWidth")} hint="How much of the row the picture takes." />
              {side ? (
                <Seg label="Line the picture up with the text" value={d.vAlign} onChange={set("vAlign")} options={[["start", "Top"], ["center", "Middle"], ["end", "Bottom"]]} />
              ) : (
                <Seg label="Picture sits" value={d.hAlign} onChange={set("hAlign")} options={[["left", "Left"], ["center", "Centre"], ["right", "Right"]]} />
              )}
              <Slider label="Nudge left ← → right" value={d.nudgeX} min={-120} max={120} unit="px" onChange={set("nudgeX")} />
              <Slider label="Nudge up ↑ ↓ down" value={d.nudgeY} min={-120} max={120} unit="px" onChange={set("nudgeY")} />
              {(d.nudgeX !== 0 || d.nudgeY !== 0) && (
                <div className="af">
                  <button type="button" className="btn btn--small" onClick={() => onChange({ ...item, data: { ...d, nudgeX: 0, nudgeY: 0 } })}>Reset nudge</button>
                </div>
              )}
              {(d.images || []).length > 1 && (
                <Seg label="Several pictures" value={d.arrange} onChange={set("arrange")} options={[["grid", "Grid"], ["stack", "Stacked"], ["overlap", "Overlapping"]]} />
              )}
              <SelectField label="Picture shape" value={d.shape} onChange={set("shape")} options={SHAPES} />
              <SelectField label="Picture proportions" value={d.ratio} onChange={set("ratio")} options={RATIOS} />
            </div>
          </div>
          <div className="bgroup"><h4>Look</h4><div className="editor__grid">{align}<StyleFields item={item} set={set} /></div></div>
        </>
      );
      break;
    case "text":
      body = (
        <>
          <div className="bgroup"><h4>Words</h4><div className="editor__grid">{textFields()}</div></div>
          <div className="bgroup">
            <h4>Look</h4>
            <div className="editor__grid">
              {align}
              <Seg label="Width" value={d.width} onChange={set("width")} options={[["narrow", "Narrow"], ["medium", "Medium"], ["wide", "Wide"]]} />
              <StyleFields item={item} set={set} />
            </div>
          </div>
        </>
      );
      break;
    case "gallery":
      body = (
        <>
          <div className="bgroup">
            <h4>Pictures</h4>
            <div className="editor__grid">
              <TextField label="Heading (optional)" value={d.heading} onChange={set("heading")} wide />
              <ImageList label="Pictures" value={d.images} onChange={set("images")} hint="Use ◀ ▶ to change the order." />
            </div>
          </div>
          <div className="bgroup">
            <h4>Look</h4>
            <div className="editor__grid">
              <Seg label="Pictures per row" value={String(d.columns)} onChange={(v) => set("columns")(Number(v))} options={[["2", "2"], ["3", "3"], ["4", "4"]]} />
              <Seg label="Space between" value={d.gap} onChange={set("gap")} options={[["small", "Small"], ["medium", "Medium"], ["large", "Large"]]} />
              <SelectField label="Picture shape" value={d.shape} onChange={set("shape")} options={SHAPES} />
              <SelectField label="Picture proportions" value={d.ratio} onChange={set("ratio")} options={RATIOS} />
              <StyleFields item={item} set={set} />
            </div>
          </div>
        </>
      );
      break;
    case "cta":
      body = (
        <>
          <div className="bgroup"><h4>Words</h4><div className="editor__grid">{textFields()}</div></div>
          <div className="bgroup"><h4>Look</h4><div className="editor__grid">{align}<StyleFields item={item} set={set} /></div></div>
        </>
      );
      break;
    case "video":
      body = (
        <div className="editor__grid">
          <TextField label="Heading (optional)" value={d.heading} onChange={set("heading")} wide />
          <MediaField label="Video" kind="video" value={d.url} onChange={set("url")} hint="Upload a file or paste a YouTube / Vimeo link." />
          <TextField label="Caption (optional)" value={d.caption} onChange={set("caption")} wide />
          <Seg label="Width" value={d.width} onChange={set("width")} options={[["narrow", "Narrow"], ["medium", "Medium"], ["wide", "Wide"]]} />
          <StyleFields item={item} set={set} />
        </div>
      );
      break;
    case "quote":
      body = (
        <div className="editor__grid">
          <TextArea label="Quote" rows={3} value={d.quote} onChange={set("quote")} />
          <TextField label="Name (optional)" value={d.name} onChange={set("name")} />
          {align}
          <StyleFields item={item} set={set} />
        </div>
      );
      break;
    case "spacer":
      body = (
        <div className="editor__grid">
          <Slider label="Height" value={d.height} min={10} max={300} unit="px" onChange={set("height")} />
          <Toggle label="Thin line in the middle" checked={d.line} onChange={set("line")} />
          <StyleFields item={item} set={set} noSpacing />
        </div>
      );
      break;
    default:
      body = null;
  }

  return (
    <div className="bedit">
      {body}
      <div className="bgroup">
        <h4>Link to this section</h4>
        <div className="editor__grid">
          <TextField label="Anchor name (optional)" value={item.anchor} onChange={setItem("anchor")} hint={item.anchor ? `Link to it with #${slugify(item.anchor)} (for example /about#${slugify(item.anchor)}).` : "Give it a short name like “story” so buttons and menus can jump straight to it."} />
        </div>
      </div>
      <div className="bgroup">
        <h4>Preview</h4>
        <div className="pbx-preview">
          <CustomSection item={item} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ add-a-section */
function AddModal({ existing, onAdd, onClose }) {
  const used = new Set(existing.filter((i) => i.kind === "builtin").map((i) => i.key));
  const free = Object.keys(BUILTIN).filter((k) => !used.has(k));
  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2>Add a section</h2>
          <button type="button" className="btn btn--small btn--ghost" onClick={onClose}>Close</button>
        </div>
        <h3 className="modal__sub">Build something new</h3>
        <div className="addgrid">
          {Object.entries(CUSTOM_TYPES).map(([type, t]) => (
            <button type="button" key={type} className="addcard" onClick={() => onAdd(blankBlock(type))}>
              <strong>{t.label}</strong>
              <span>{t.desc}</span>
            </button>
          ))}
        </div>
        <h3 className="modal__sub">Re-use a section that already exists on the site</h3>
        {free.length ? (
          <div className="addgrid addgrid--small">
            {free.map((k) => (
              <button type="button" key={k} className="addcard addcard--plain" onClick={() => onAdd(builtinItem(k))}>
                <strong>{BUILTIN[k].label}</strong>
              </button>
            ))}
          </div>
        ) : (
          <p className="muted">Every ready-made section is already on this page.</p>
        )}
      </div>
    </div>
  );
}

const editLink = (key) => {
  const e = BUILTIN[key].edit;
  if (e.startsWith("content:")) return `/admin/developer/content?tab=${e.slice(8)}`;
  return `/admin/${e}`;
};

const labelOf = (it) => (it.kind === "builtin" ? BUILTIN[it.key].label : it.data.heading?.replace(/\*/g, "").split("\n")[0] || it.data.quote || CUSTOM_TYPES[it.type].label);

/* ------------------------------------------------------------------- page */
export function PageLayout() {
  const { settings, setSettings } = useSettings();
  const [params, setParams] = useSearchParams();
  const saved = settings.layout || {};
  const [draft, setDraft] = useState(() => structuredClone(saved));
  const [open, setOpen] = useState(null);
  const [adding, setAdding] = useState(null); // insert position
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [showNew, setShowNew] = useState(false);
  const importRef = useRef(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const pages = extraPages({ layout: draft });
  const tab = params.get("page") || "home";
  const extra = pages.find((p) => p.slug === tab);
  const key = extra ? pageKey(extra.slug) : PAGE_LABELS[tab] ? tab : "home";
  const items = resolveLayout({ layout: draft }, key);
  const isDefault = !Array.isArray(draft.sections?.[key]);

  const flash = (message, type = "ok") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };
  const go = (p) => {
    setParams({ page: p });
    setOpen(null);
  };
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setList = (list, k = key) => setDraft((d) => ({ ...d, sections: { ...(d.sections || {}), [k]: list } }));
  const update = (i, next) => setList(items.map((it, n) => (n === i ? next : it)));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
  };
  const remove = (i) => {
    const it = items[i];
    if (!window.confirm(`Remove “${labelOf(it)}” from this page?${it.kind === "builtin" ? "\n\nYou can add it back later with Add section." : "\n\nThis deletes what you wrote in it."}`)) return;
    setList(items.filter((_, n) => n !== i));
    setOpen(null);
  };
  const duplicate = (i) => {
    const copy = { ...structuredClone(items[i]), uid: uid(), anchor: "" };
    const next = [...items];
    next.splice(i + 1, 0, copy);
    setList(next);
    setOpen(copy.uid);
  };
  const addAt = (item) => {
    const next = [...items];
    next.splice(adding ?? next.length, 0, item);
    setList(next);
    setAdding(null);
    setOpen(item.kind === "custom" ? item.uid : null);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.replaceSetting("layout", draft);
      setSettings((s) => ({ ...s, layout: res }));
      setDraft(structuredClone(res));
      flash("Saved — the website is updated.");
    } catch (e) {
      flash(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* pages */
  const createPage = () => {
    const title = newTitle.trim();
    if (!title) return;
    let slug = slugify(title) || "page";
    const base = slug;
    let n = 2;
    while (pages.some((p) => p.slug === slug)) slug = `${base}-${n++}`;
    const first = blankBlock("text");
    first.data = { ...first.data, heading: title, theme: "dark", padTop: "large", padBottom: "medium", body: "" };
    setDraft((d) => ({
      ...d,
      pages: [...extraPages({ layout: d }), { slug, title, menu: false }],
      sections: { ...(d.sections || {}), [pageKey(slug)]: [first] },
    }));
    setNewTitle("");
    setShowNew(false);
    go(slug);
  };
  const setPage = (patch) => setDraft((d) => ({ ...d, pages: extraPages({ layout: d }).map((p) => (p.slug === tab ? { ...p, ...patch } : p)) }));
  const deletePage = () => {
    if (!window.confirm(`Delete the page “${extra.title}” and everything on it?`)) return;
    setDraft((d) => {
      const sections = { ...(d.sections || {}) };
      delete sections[key];
      return { ...d, pages: extraPages({ layout: d }).filter((p) => p.slug !== tab), sections };
    });
    go("home");
  };
  const resetPage = () => {
    if (!window.confirm("Put this page back to its original sections and order? Custom sections on it will be removed.")) return;
    setDraft((d) => {
      const sections = { ...(d.sections || {}) };
      delete sections[key];
      return { ...d, sections };
    });
    setOpen(null);
  };

  /* backup */
  const exportLayout = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "page-layout.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importLayout = async (file) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== "object" || Array.isArray(data) || (data.sections && typeof data.sections !== "object")) throw new Error("bad");
      if (!window.confirm("Replace the whole layout of every page with this file? You can still discard before saving.")) return;
      setDraft(data);
      flash("Layout loaded — check it, then press Save changes.");
    } catch {
      flash("That file is not a layout exported from this admin.", "error");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const viewPath = extra ? `/p/${extra.slug}` : PAGE_PATHS[key];

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Page layout</h1>
          <p>Add, remove, hide and re-order the sections on every page, and decide where each picture goes.</p>
        </div>
        <Link className="btn" to={viewPath} target="_blank">View page ↗</Link>
      </div>

      {toast && <div className={"toast toast--" + toast.type}>{toast.message}</div>}

      <div className="tabs" role="tablist">
        {Object.entries(PAGE_LABELS).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={"tab" + (tab === k ? " is-active" : "")} onClick={() => go(k)}>{l}</button>
        ))}
        {pages.map((p) => (
          <button key={p.slug} role="tab" aria-selected={tab === p.slug} className={"tab" + (tab === p.slug ? " is-active" : "")} onClick={() => go(p.slug)}>{p.title}</button>
        ))}
        <button className="tab tab--accent" onClick={() => setShowNew((v) => !v)}>+ New page</button>
      </div>

      {showNew && (
        <div className="card newpage">
          <TextField label="Name of the new page" value={newTitle} onChange={setNewTitle} placeholder="e.g. Coaching" hint="Its address will be made from the name, e.g. /p/coaching" />
          <div className="newpage__btns">
            <button className="btn btn--primary" disabled={!newTitle.trim()} onClick={createPage}>Create page</button>
            <button className="btn btn--ghost" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      {extra && (
        <div className="card pageset">
          <div className="editor__grid">
            <TextField label="Page name" value={extra.title} onChange={(v) => setPage({ title: v })} />
            <Field label="Address"><div className="pageset__url">/p/{extra.slug}</div></Field>
            <Toggle label="Show in the top menu" checked={!!extra.menu} onChange={(v) => setPage({ menu: v })} />
          </div>
          <button className="btn btn--danger btn--small" onClick={deletePage}>Delete this page</button>
        </div>
      )}

      <div className="blist">
        {!extra && (
          <div className="bcard bcard--locked">
            <div className="bcard__row">
              <span className="bcard__num">★</span>
              <div className="bcard__title"><strong>Hero (top of page)</strong><small>Always first. Edit its words and photo in Page content.</small></div>
              <Link className="btn btn--small" to={`/admin/developer/content?tab=${tab}`}>Edit</Link>
            </div>
          </div>
        )}

        {!items.length && <div className="card"><p className="muted">This page has no sections yet. Add one below.</p></div>}

        {items.map((it, i) => {
          const isOpen = open === it.uid;
          return (
            <div className={"bcard" + (it.hidden ? " is-hidden" : "")} key={it.uid}>
              <div className="bcard__row">
                <span className="bcard__num">{i + 1}</span>
                <div className="bcard__title">
                  <strong>{labelOf(it)}</strong>
                  <small>
                    {it.kind === "builtin" ? "Ready-made section" : CUSTOM_TYPES[it.type].label}
                    {it.hidden && " · Hidden"}
                    {it.flip && " · Picture side swapped"}
                  </small>
                </div>
                <div className="bcard__btns">
                  <button className="btn btn--small" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" title="Move up">↑</button>
                  <button className="btn btn--small" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" title="Move down">↓</button>
                  {it.kind === "custom" ? (
                    <button className="btn btn--small" onClick={() => setOpen(isOpen ? null : it.uid)}>{isOpen ? "Close" : "Edit"}</button>
                  ) : (
                    <Link className="btn btn--small" to={editLink(it.key)}>Edit content</Link>
                  )}
                  {it.kind === "builtin" && BUILTIN[it.key].flip && (
                    <button className="btn btn--small" onClick={() => update(i, { ...it, flip: !it.flip })}>⇄ Swap picture side</button>
                  )}
                  <button className="btn btn--small btn--ghost" onClick={() => update(i, { ...it, hidden: !it.hidden })}>{it.hidden ? "Show" : "Hide"}</button>
                  {it.kind === "custom" && <button className="btn btn--small btn--ghost" onClick={() => duplicate(i)}>Duplicate</button>}
                  <button className="btn btn--small btn--danger" onClick={() => remove(i)}>Delete</button>
                </div>
              </div>
              {isOpen && it.kind === "custom" && <BlockEditor item={it} onChange={(next) => update(i, next)} />}
              <button className="insert" onClick={() => setAdding(i + 1)} aria-label={`Add a section after ${labelOf(it)}`}>
                <span>+ Add a section here</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="blist__foot">
        <button className="btn btn--primary" onClick={() => setAdding(items.length)}>+ Add section</button>
        <button className="btn btn--ghost" onClick={resetPage} disabled={isDefault && !extra}>Reset this page to original</button>
        <span className="blist__spacer" />
        <button className="btn btn--ghost btn--small" onClick={exportLayout}>Export layout</button>
        <button className="btn btn--ghost btn--small" onClick={() => importRef.current?.click()}>Import layout</button>
        <input ref={importRef} type="file" hidden accept="application/json,.json" onChange={(e) => importLayout(e.target.files?.[0])} />
      </div>

      {adding !== null && <AddModal existing={items} onAdd={addAt} onClose={() => setAdding(null)} />}

      <div className={"savebar" + (dirty ? " is-visible" : "")}>
        <span>{dirty ? "You have unsaved changes" : "All changes saved"}</span>
        <div>
          <button className="btn btn--ghost" disabled={!dirty || saving} onClick={() => { setDraft(structuredClone(saved)); setOpen(null); }}>Discard</button>
          <button className="btn btn--primary" disabled={!dirty || saving} onClick={save}>{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </div>
    </div>
  );
}
