# Jersey Round Table

Public club website and private members' programme. Next.js 16 / React 19, Node 24, SQLite on a persistent Railway volume.

## Railway production setup

1. Use the existing Railway service connected to `jsychris/JRT_Website`. Preserve its custom domain.
2. Attach a persistent volume at `/data`. Railway supplies `RAILWAY_VOLUME_MOUNT_PATH`. Run a single replica.
3. Set `APP_URL` to the exact public HTTPS origin (for example `https://www.jerseyroundtable.com`). Redirect any alternative hostname to that canonical hostname so form origin validation stays consistent.
4. Generate a random one-time setup code locally, and put only its SHA-256 hex digest in the secret `CLUB_SETUP_HASH` variable. Never put either value in Git.
5. Use the repository Dockerfile and `railway.json`; remove any old static-site build/start overrides. Health check: `/api/health`. Deployment fails its health check if persistent storage is unavailable.
6. Open `/login#setup=YOUR_SETUP_CODE`, enter your email, name and a strong password. The code can claim an administrator only once. Remove the setup secret after successful setup and redeploy.
7. In Members → Members, create individual invitation links. Share each privately with the intended recipient. Invitations expire after seven days and can be used once. Existing members can use a new invitation to reset their password; existing bookings are retained and prior sessions revoked.
8. Configure daily Railway volume backups and test a restore before relying on the service for club bookings.

Passwords use salted scrypt hashes. Sessions use random tokens, stored hashed in the database, and HttpOnly/Secure/SameSite=Lax cookies with a 30-day lifetime. Access is checked on the server on every request. This application does not rely on forwarded ChatGPT identity headers. No email-sending provider is required; invitation delivery is manual.

## What is included

- Club history, community pages, joining and public events.
- Administrator event editing: date, time, location, description, cost and guest permission.
- Yes / No / Maybe responses, guest counts/names and private per-attendee questions.
- Required/optional choice or written questions, per person or per booking.
- Event discussions and administrator visibility of booking answers.
- Optimistic event revision checks and response review after event edits.

## Existing Sites data

The separate ChatGPT Sites deployment is unchanged. Its D1 data is not automatically copied into Railway. Before cutover, inspect that deployment for real club events or responses. Export and migrate any records needed; never place member data in this public GitHub repository. Existing ChatGPT-based identities need explicit matching/invitations for the new sign-in system.

## Local development

Use Node 24 or later. Run `npm ci`, set `DATA_DIRECTORY` to a disposable or persistent local folder and set `APP_URL=http://localhost:3000`, then run `npm run dev`. Database migrations in `drizzle/` apply transactionally on first use, with stored checksums. Never edit an applied migration.

`npm run build` produces a standalone server. The Dockerfile copies the standalone output, static files, public assets and migrations into the runtime image. `npm test` checks account primitives, permissions, booking validation and schema upgrades. `node tests/http-smoke.mjs` tests a local production build without a browser.

## Rollback

The original site is preserved in branch `archive/pre-members-site-2026-09-07` at commit `3e0f0f62dd2d71a1f2f5600f22c882012c0a6602`. It includes the original HTML, assets, uploads and planner PDF. Prefer a Railway rollback to the previous known-good deployment if cutover fails. Keep the members database volume intact when rolling back; do not delete it.

Until Railway storage and environment settings are confirmed, the replacement lives on branch `railway-members-site`. The live `main` branch stays unchanged.

## Member photos

Members → Club photos accepts still JPEG, PNG and WebP files up to 15 MB / 50 megapixels. The server auto-orients, strips metadata, limits the long edge to 1920 px, and encodes WebP at quality 80, reducing to 1600 px / quality 70 for outputs above 900 KB. A separate 480 px preview is stored; original uploads are discarded. Each final main image is capped at 1.5 MB. The shared photo library is capped at 1 GB / 1000 images with at most 100 pending uploads per member.

All uploads, including administrator uploads, start pending. Only administrators can approve or reject. Pending/rejected files are accessible only to the uploader and administrators. Approved photos populate the homepage carousel; unpublishing/deleting removes public access immediately on subsequent requests. Existing open browser pages may retain already displayed images. Members may delete their own uploads; administrators may delete any photo. Deletion removes image files to reclaim space. Photos are stored alongside SQLite in the Railway volume at `/data/photos`; include both the database and this folder in backups. Automated backups remain unconfigured.

Batch uploads accept up to 20 selected files, submitted sequentially as bounded individual requests. The server permits at most two simultaneous photo uploads, one per account per process (single Railway replica). Per-member upload IDs make retries idempotent. Each image is independently decoded, resized, stripped of metadata and submitted for approval. Failed files can be retried without repeating successful uploads.
