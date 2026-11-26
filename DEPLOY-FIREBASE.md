# Chris Mene site — Firebase + cPanel setup

The site is now a plain static build (no Node server). Content, settings, inbox and admin login live in
Firebase (free Spark plan, no card needed). Uploaded images/videos/audio are saved on your own hosting in
/uploads by the small PHP files in /api (they also check that the request comes from your admin account).

## 1. Firebase (about 10 minutes)
1. console.firebase.google.com → Add project (turn Google Analytics off). Stay on the free Spark plan.
2. Build → Authentication → Get started → Email/Password → Enable. Then Users tab → Add user
   (your admin email + a strong password). Copy that user's **User UID**.
3. Build → Firestore Database → Create database (production mode, pick any region).
4. Firestore → Rules tab → paste the contents of `firestore.rules`, replace PASTE_ADMIN_UID with your UID → Publish.
5. Project settings (gear) → Your apps → Web (</>) → register app → copy the `firebaseConfig` values into
   `src/firebaseConfig.js`.
   Do NOT enable "Storage" — it needs a paid plan now, and this setup doesn't use it.

## 2. Import your local content (optional, one time)
```
npm install
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpassword npm run migrate
```
(PowerShell: `$env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="yourpassword"; npm run migrate`)
This copies articles, podcasts, video, events and settings into Firestore.

## 3. Build and upload
```
npm run build
```
Upload the CONTENTS of `dist` (not the folder itself) into `/public_html/chrismene.org` (after backing up the old site).
You'll see `.htaccess`, `index.html`, `assets/` and `api/` there (turn on "Show hidden files" in File Manager).

Then in `/public_html/chrismene.org/api/`: copy `config.sample.php` to `config.php` and fill in
`firebase_api_key` (same apiKey as in firebaseConfig.js) and `admin_uid` (your User UID).

Create a folder `uploads` in `/public_html/chrismene.org/` and put the files from `scripts/legacy-uploads/` in it
(your pop-up image). New uploads from the admin go here automatically.

## 4. Firebase domain + SSL
- cPanel → SSL/TLS Status → Run AutoSSL for chrismene.org.
- Firebase → Authentication → Settings → Authorized domains → add `chrismene.org` and `www.chrismene.org`.
- Open https://chrismene.org/admin and sign in with your admin email and password.

## Updating the site later
`npm run build`, then upload the contents of `dist` over the top. Don't empty the folder: that would delete
`api/config.php` and `uploads/`. Content changes made in /admin need no re-upload.

## Notes
- Big videos: the server limit is 64 MB per upload (set in `api/.user.ini`). For longer videos paste a YouTube/Vimeo link.
- `npm run dev` runs the site locally and reads/writes the same Firebase data; uploads only work on the live site (PHP).
- If /admin saves fail with "permission denied", the UID in the rules doesn't match your user.
