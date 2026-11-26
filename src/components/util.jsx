import { Link } from "react-router-dom";
import { assetUrl } from "../api.js";

/** Link that works for both in-app paths ("/about") and external URLs. */
export function SmartLink({ to, children, ...rest }) {
  const href = to || "#";
  if (href.startsWith("/") && !href.startsWith("//")) return <Link to={href} {...rest}>{children}</Link>;
  const external = /^https?:\/\//.test(href);
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
      {children}
    </a>
  );
}

/** "Leadership *Live* with Chris" -> Leadership <em>Live</em> with Chris */
export function Emphasis({ text = "" }) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") && part.length > 2 ? <em key={i}>{part.slice(1, -1)}</em> : part
  );
}

/** *stars* make italics and \n becomes a line break — used for editable headings */
export function Rich({ text = "" }) {
  return String(text)
    .split("\n")
    .map((line, i, a) => (
      <span key={i}>
        <Emphasis text={line} />
        {i < a.length - 1 && <br />}
      </span>
    ));
}

/** Lines separated with \n become <br/> */
export function Lines({ text = "" }) {
  return text.split("\n").map((line, i, a) => (
    <span key={i}>
      {line}
      {i < a.length - 1 && <br />}
    </span>
  ));
}

export const img = assetUrl;

export function formatDate(value, fallback = "") {
  if (!value) return fallback;
  const d = new Date(value.length === 10 ? value + "T12:00:00" : value);
  return isNaN(d) ? value : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Detects YouTube / Vimeo links and returns an embeddable URL (or null). */
export function embedUrl(url = "") {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export function youtubeThumb(url = "") {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return yt ? `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg` : "";
}
