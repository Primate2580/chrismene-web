import ProgramCards from "./ProgramCards.jsx";
import UpcomingEvents from "./UpcomingEvents.jsx";
import ContactForm from "./ContactForm.jsx";
import { CustomSection } from "./CustomSections.jsx";
import { AboutStory, MissionVision, Stage, StoreBooks, WhatMatters } from "./AboutSections.jsx";
import { FeaturedBook, FeaturedOrg, LeadershipLive, Testimonials } from "./Sections.jsx";
import { ArticlesSection, AudioSection, PodcastSection, VideosSection } from "./Resources.jsx";
import { useSettings } from "../context/SiteContext.jsx";
import { BUILTIN, resolveLayout } from "../../shared/layout.js";

const RENDER = {
  programs: ({ page }) => <ProgramCards withBackground={page === "programs"} />,
  events: () => <UpcomingEvents />,
  live: () => <LeadershipLive />,
  testimonials: () => <Testimonials />,
  book: () => <FeaturedBook />,
  org: () => <FeaturedOrg />,
  story: () => <AboutStory />,
  mission: () => <MissionVision />,
  values: () => <WhatMatters />,
  stage: () => <Stage />,
  articles: () => <ArticlesSection />,
  videos: () => <VideosSection />,
  podcast: () => <PodcastSection />,
  audio: () => <AudioSection />,
  books: () => <StoreBooks />,
  form: () => <ContactForm />,
};

/** Renders every section of a page in the order saved in Admin → Page layout. */
export default function PageSections({ page }) {
  const { settings } = useSettings();
  return resolveLayout(settings, page).map((it) => {
    if (it.hidden) return null;
    if (it.kind === "custom") return <CustomSection key={it.uid} item={it} />;
    const Section = RENDER[it.key];
    if (!Section) return null;
    const node = <Section page={page} />;
    return it.flip && BUILTIN[it.key]?.flip ? (
      <div key={it.uid} className="cmx-flip" style={{ display: "contents" }}>
        {node}
      </div>
    ) : (
      <div key={it.uid} style={{ display: "contents" }}>
        {node}
      </div>
    );
  });
}
