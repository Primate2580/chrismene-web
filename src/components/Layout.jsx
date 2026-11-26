import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Newsletter from "./Newsletter.jsx";
import PopupModal from "./PopupModal.jsx";
import { Footer } from "./Sections.jsx";
import { useSettings } from "../context/SiteContext.jsx";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // wait a tick so the target section has rendered
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 120);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

/** Wraps every public page: header, content, newsletter, footer and the pop-up. */
export default function Layout() {
  const { settings } = useSettings();
  return (
    <>
      <ScrollManager />
      <Header />
      <main>
        <Outlet />
      </main>
      <Newsletter />
      <Footer siteName={settings.siteName} />
      <PopupModal />
    </>
  );
}
