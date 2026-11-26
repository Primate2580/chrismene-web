import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import { formatDate } from "../components/util.jsx";
import { SelectField } from "./fields.jsx";

/**
 * Generic list + editor for any content type.
 *   collection – API name ("articles", "podcasts" …)
 *   singular   – label ("article")
 *   blank      – default values for a new item
 *   renderFields({ item, set }) – returns the form inputs
 *   subtitle(item) – small grey text in the list
 */
export default function ContentManager({ collection, title, singular, blank, renderFields, subtitle, thumb }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // item object (new items have no id)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const flash = (message, type = "ok") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.list(collection, true));
    } catch (e) {
      flash(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    setEditing(null);
    load();
  }, [load]);

  const set = (k) => (v) => setEditing((e) => ({ ...e, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing.id) await api.update(collection, editing.id, editing);
      else await api.create(collection, editing);
      flash(`${singular[0].toUpperCase() + singular.slice(1)} saved`);
      setEditing(null);
      load();
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await api.remove(collection, item.id);
      flash("Deleted");
      load();
    } catch (err) {
      flash(err.message, "error");
    }
  };

  const toggleStatus = async (item) => {
    try {
      await api.update(collection, item.id, { ...item, status: item.status === "draft" ? "published" : "draft" });
      load();
    } catch (err) {
      flash(err.message, "error");
    }
  };

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>{title}</h1>
          <p>{items.length} total</p>
        </div>
        {!editing && (
          <button className="btn btn--primary" onClick={() => setEditing({ ...blank })}>
            + New {singular}
          </button>
        )}
      </div>

      {toast && <div className={"toast toast--" + toast.type}>{toast.message}</div>}

      {editing ? (
        <form className="card editor" onSubmit={save}>
          <h2>{editing.id ? `Edit ${singular}` : `New ${singular}`}</h2>
          <div className="editor__grid">
            {renderFields({ item: editing, set })}
            <SelectField
              label="Status"
              value={editing.status}
              onChange={set("status")}
              options={[
                ["published", "Published — visible on the site"],
                ["draft", "Draft — hidden"],
              ]}
            />
          </div>
          <div className="editor__actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="card list">
          {loading && <p className="list__empty">Loading…</p>}
          {!loading && !items.length && <p className="list__empty">Nothing here yet. Click “New {singular}” to add the first one.</p>}
          {items.map((item) => (
            <div className="list__row" key={item.id}>
              <div className="list__thumb">{thumb?.(item) ? <img src={thumb(item)} alt="" /> : <span>{(item.title || "?")[0]}</span>}</div>
              <div className="list__main">
                <strong>{item.title}</strong>
                <small>{[subtitle?.(item), item.date && collection !== "events" ? formatDate(item.date) : ""].filter(Boolean).join(" · ")}</small>
              </div>
              <span className={"pill pill--" + item.status}>{item.status === "draft" ? "Draft" : "Published"}</span>
              <div className="list__actions">
                <button className="btn btn--small" onClick={() => setEditing(item)}>
                  Edit
                </button>
                <button className="btn btn--small btn--ghost" onClick={() => toggleStatus(item)}>
                  {item.status === "draft" ? "Publish" : "Unpublish"}
                </button>
                <button className="btn btn--small btn--danger" onClick={() => remove(item)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
