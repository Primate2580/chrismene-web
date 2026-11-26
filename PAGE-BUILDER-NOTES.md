# Page layout builder — update notes

Extract this zip INTO your project folder (the one that contains package.json) and
choose "Replace files". No `npm install` is needed. Restart `npm run dev`.

New admin pages (sidebar):
- Developer → Page layout : add / remove / hide / re-order sections on every page,
  add new blocks (Image & text, Text, Gallery, Call to action, Video, Quote, Spacer),
  choose picture side, size, alignment, nudge, shape and background, create new pages
  (they live at /p/your-page and can be shown in the top menu), export/import the layout.
- Media library : every uploaded file, copy link, delete (warns if in use).
  Every upload box now also has a "Library" button to re-use an existing file.

Your saved content, uploads and settings are not touched. The layout is stored in
server/data/db.json under settings.layout (empty = the original page order).
