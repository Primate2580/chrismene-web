// Same interface the admin and the site always used, now backed by Firebase:
//   content + settings + inbox → Firestore      login → Firebase Authentication
//   uploaded images/video/audio → /uploads on your own hosting (via /api/*.php)
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where,
} from "firebase/firestore";
import { auth, db } from "./firebase.js";

const COLLECTIONS = ["articles", "podcasts", "videos", "audio", "events"];
const SETTINGS_REF = () => doc(db, "site", "settings");

/** "/uploads/x.jpg" stays as is: uploads live on the same domain as the site. */
export const assetUrl = (u) => u || "";

const plain = (v) => JSON.parse(JSON.stringify(v ?? null)); // Firestore rejects `undefined`
const newId = () => Math.random().toString(16).slice(2, 14);
const slugify = (text = "") =>
  String(text).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "") || "item";

const byDateDesc = (a, b) => String(b.date || b.createdAt).localeCompare(String(a.date || a.createdAt));
const byDateAsc = (a, b) => String(a.date || "9999").localeCompare(String(b.date || "9999"));
const sortFor = (name) => (name === "events" ? byDateAsc : byDateDesc);

function fail(e) {
  if (e?.code === "permission-denied" && auth.currentUser) window.dispatchEvent(new Event("cm-unauthorized"));
  const msg = {
    "permission-denied": "You don't have permission to do that. Please sign in again.",
    unavailable: "Cannot reach Firebase. Check your internet connection.",
    "auth/invalid-credential": "Wrong email or password.",
    "auth/invalid-email": "That email address is not valid.",
    "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
    "auth/network-request-failed": "Cannot reach Firebase. Check your internet connection.",
  }[e?.code];
  const err = new Error(msg || e?.message || "Something went wrong.");
  err.code = e?.code;
  return err;
}
const wrap = (fn) => async (...a) => {
  try { return await fn(...a); } catch (e) { throw fail(e); }
};

/* ------------------------------------------------------------- auth */
/** Resolves with the signed-in user (or null) once Firebase has restored the session. */
export const whenAuthReady = () =>
  new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (u) => { off(); resolve(u); });
  });
export const logout = () => signOut(auth);

const deepMerge = (target, source) => {
  if (Array.isArray(source) || typeof source !== "object" || source === null) return source;
  const out = { ...(target && typeof target === "object" ? target : {}) };
  for (const k of Object.keys(source)) out[k] = deepMerge(out[k], source[k]);
  return out;
};

async function readSettings() {
  const snap = await getDoc(SETTINGS_REF());
  return snap.exists() ? snap.data() : {};
}

async function uniqueSlug(base, selfId) {
  const snap = await getDocs(collection(db, "articles"));
  const taken = new Set(snap.docs.filter((d) => d.id !== selfId).map((d) => d.data().slug));
  let slug = base, n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

async function clean(name, body, existing) {
  const item = { ...(existing || {}), ...body };
  delete item.id;
  delete item.createdAt;
  item.status = item.status === "draft" ? "draft" : "published";
  if (name === "articles") item.slug = await uniqueSlug(slugify(item.slug || item.title), existing?.id);
  return plain(item);
}

const withId = (d) => ({ id: d.id, ...d.data() });

async function adminToken() {
  const u = auth.currentUser;
  if (!u) throw new Error("Please sign in again.");
  return u.getIdToken();
}

async function phpCall(path, opts = {}) {
  const token = await adminToken();
  const res = await fetch(path, { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  login: wrap(async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return { user: cred.user };
  }),
  check: async () => {
    const u = await whenAuthReady();
    if (!u) throw new Error("Not signed in");
    return { ok: true };
  },

  settings: wrap(async () => readSettings()),
  // theme / content / layout are replaced as a whole so "reset to default" really removes a value
  replaceSetting: wrap(async (section, value) => {
    const v = plain(value && typeof value === "object" && !Array.isArray(value) ? value : {});
    try { await updateDoc(SETTINGS_REF(), { [section]: v }); }
    catch (e) {
      if (e.code !== "not-found") throw e;
      await setDoc(SETTINGS_REF(), { [section]: v });
    }
    return v;
  }),
  saveSettings: wrap(async (s) => {
    await setDoc(SETTINGS_REF(), plain(s), { merge: true });
    return deepMerge({}, await readSettings());
  }),

  list: wrap(async (c, all = false) => {
    if (!COLLECTIONS.includes(c)) throw new Error("Not found");
    const ref = collection(db, c);
    const snap = await getDocs(all && auth.currentUser ? ref : query(ref, where("status", "==", "published")));
    return snap.docs.map(withId).sort(sortFor(c));
  }),
  get: wrap(async (c, key) => {
    const ref = collection(db, c);
    const admin = !!auth.currentUser;
    let item = null;
    try {
      const byId = await getDoc(doc(db, c, key));
      if (byId.exists()) item = withId(byId);
    } catch { /* a draft is not readable by visitors; fall through to the slug lookup */ }
    if (!item) {
      const q = admin ? query(ref, where("slug", "==", key)) : query(ref, where("slug", "==", key), where("status", "==", "published"));
      const snap = await getDocs(q);
      if (!snap.empty) item = withId(snap.docs[0]);
    }
    if (!item || (item.status === "draft" && !admin)) throw Object.assign(new Error("Not found"), { status: 404 });
    return item;
  }),
  create: wrap(async (c, item) => {
    if (!String(item?.title || "").trim()) throw new Error("A title is required.");
    const data = { ...(await clean(c, item)), createdAt: new Date().toISOString() };
    const id = newId();
    await setDoc(doc(db, c, id), data);
    return { id, ...data };
  }),
  update: wrap(async (c, id, item) => {
    const snap = await getDoc(doc(db, c, id));
    if (!snap.exists()) throw new Error("Not found");
    const existing = withId(snap);
    if (!String(item?.title ?? existing.title).trim()) throw new Error("A title is required.");
    const data = { ...(await clean(c, item, existing)), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, c, id), { ...data, createdAt: existing.createdAt });
    return { ...data, id, createdAt: existing.createdAt };
  }),
  remove: wrap(async (c, id) => { await deleteDoc(doc(db, c, id)); return { ok: true }; }),

  subscribe: wrap(async (firstName, email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) throw new Error("Please enter a valid email address.");
    const id = encodeURIComponent(email.trim().toLowerCase());
    try {
      await setDoc(doc(db, "subscribers", id), {
        firstName: String(firstName || "").slice(0, 80),
        email: email.trim().slice(0, 200),
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      if (e.code !== "permission-denied") throw e; // already subscribed: treat as success
    }
    return { ok: true };
  }),
  contact: wrap(async ({ name = "", email = "", message = "" }) => {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message.trim())
      throw new Error("Please fill in your name, a valid email and a message.");
    await addDoc(collection(db, "messages"), {
      name: name.slice(0, 120), email: email.slice(0, 200), message: message.slice(0, 5000),
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }),
  inbox: wrap(async () => {
    const [s, m] = await Promise.all([getDocs(collection(db, "subscribers")), getDocs(collection(db, "messages"))]);
    const newest = (a, b) => String(b.createdAt).localeCompare(String(a.createdAt));
    return { subscribers: s.docs.map(withId).sort(newest), messages: m.docs.map(withId).sort(newest) };
  }),
  removeInbox: wrap(async (kind, id) => {
    if (!["subscribers", "messages"].includes(kind)) throw new Error("Not found");
    await deleteDoc(doc(db, kind, id));
    return { ok: true };
  }),

  /* uploaded files live on your hosting; /api/media.php lists and deletes them */
  media: wrap(async () => {
    const files = await phpCall("/api/media.php");
    const [settings, ...lists] = await Promise.all([readSettings(), ...COLLECTIONS.map((c) => getDocs(collection(db, c)))]);
    const text = JSON.stringify([settings, ...lists.map((l) => l.docs.map((d) => d.data()))]);
    return files.map((f) => ({ ...f, used: text.includes(f.name) }));
  }),
  removeMedia: wrap(async (name) =>
    phpCall(`/api/media.php?name=${encodeURIComponent(name)}`, { method: "DELETE" })),

  /** Upload a file with progress. Resolves to { url, name, type, size }. */
  async upload(file, onProgress) {
    const token = await adminToken();
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload.php");
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
      xhr.onload = () => {
        let data = {};
        try { data = JSON.parse(xhr.responseText); } catch { /* ignore */ }
        xhr.status >= 200 && xhr.status < 300
          ? resolve(data)
          : reject(new Error(data.error || (xhr.status === 413 ? "That file is too big for the server." : "Upload failed.")));
      };
      xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
      const form = new FormData();
      form.append("file", file);
      xhr.send(form);
    });
  },
};
