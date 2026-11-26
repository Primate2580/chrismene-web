import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { defaultContent, defaultSettings } from "../../shared/seed.js";
import { THEME_DEFAULTS, THEME_VARS, contentValue } from "../../shared/content.js";

const SiteContext = createContext(null);

// merge so a missing field in the saved settings never breaks a page
const merge = (base, over) => {
  if (!over || typeof over !== "object" || Array.isArray(over)) return over ?? base;
  const out = { ...base };
  for (const k of Object.keys(over)) {
    out[k] =
      base && typeof base[k] === "object" && !Array.isArray(base[k]) && base[k] !== null
        ? merge(base[k], over[k])
        : over[k];
  }
  return out;
};

/** Writes the theme colours onto :root as CSS variables. */
export function applyTheme(theme = {}) {
  const root = document.documentElement;
  const t = { ...THEME_DEFAULTS, ...theme };
  for (const [k, v] of Object.entries(THEME_VARS)) root.style.setProperty(v, t[k]);
}

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api
      .settings()
      .then((s) => setSettings(merge(defaultSettings, s)))
      .catch(() => {}) // fall back to defaults if the API is offline
      .finally(() => setReady(true));
  }, []);

  useEffect(() => applyTheme(settings.theme), [settings.theme]);

  const value = useMemo(() => ({ settings, setSettings, ready }), [settings, ready]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSettings = () => useContext(SiteContext);

/** Loads a public collection. Falls back to the built-in sample content offline. */
export function useCollection(name) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    let alive = true;
    api
      .list(name)
      .then((d) => alive && setItems(d))
      .catch(
        () =>
          alive &&
          setItems((defaultContent[name] || []).map((x, i) => ({ id: `s${i}`, slug: `s${i}`, ...x })))
      );
    return () => {
      alive = false;
    };
  }, [name]);
  return { items: items || [], loading: items === null };
}

/**
 * const c = useC();  c("home.hero.title")  → edited text, or the default.
 * Image values come back as plain URLs; wrap them with img() where used.
 */
export function useC() {
  const { settings } = useSettings();
  return useCallback((key) => contentValue(key, settings), [settings]);
}
