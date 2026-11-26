// One-time import of your local content (scripts/legacy-data.json) into Firestore.
// Usage:  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpassword npm run migrate
// (On Windows PowerShell:  $env:ADMIN_EMAIL="..."; $env:ADMIN_PASSWORD="..."; npm run migrate)
import fs from "node:fs";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { firebaseConfig } from "../src/firebaseConfig.js";

const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD first (see the comment at the top of this file).");
  process.exit(1);
}
if (firebaseConfig.apiKey.startsWith("PASTE")) {
  console.error("Fill in src/firebaseConfig.js first.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
await signInWithEmailAndPassword(getAuth(app), ADMIN_EMAIL, ADMIN_PASSWORD);
const db = getFirestore(app);

// uploaded files now live on the same domain as the site, so drop any "http://localhost:5173" prefix
const fix = (v) => JSON.parse(JSON.stringify(v).replace(/https?:\/\/localhost:\d+(\/uploads\/)/g, "$1"));
const data = JSON.parse(fs.readFileSync(new URL("./legacy-data.json", import.meta.url), "utf8"));

await setDoc(doc(db, "site", "settings"), fix(data.settings));
console.log("settings ✓");

for (const col of ["articles", "podcasts", "videos", "audio", "events"]) {
  for (const { id, ...item } of data[col] || []) {
    await setDoc(doc(db, col, id), fix({ status: "published", ...item }));
  }
  console.log(`${col}: ${(data[col] || []).length} ✓`);
}
for (const col of ["subscribers", "messages"]) {
  for (const { id, ...item } of data[col] || []) await setDoc(doc(db, col, id), item);
  console.log(`${col}: ${(data[col] || []).length} ✓`);
}
console.log("\nDone. Remember to copy scripts/legacy-uploads/* into the /uploads folder on your hosting.");
process.exit(0);
