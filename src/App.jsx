import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { About, ArticleDetail, Connect, CustomPage, Events, Home, NotFound, Platforms, Programs, Resources, Store } from "./pages/Pages.jsx";

// the admin panel is only downloaded when someone opens /admin
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<Suspense fallback={<div style={{ padding: 40 }}>Loading…</div>}><AdminApp /></Suspense>} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/events" element={<Events />} />
        <Route path="/platforms" element={<Platforms />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        <Route path="/store" element={<Store />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/p/:slug" element={<CustomPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
