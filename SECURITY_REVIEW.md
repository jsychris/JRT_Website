# Jersey Round Table security review and Claude handover

Date: 8 September 2026. Baseline: `79b65dfe16d4d459c3ac69433df11db6e9c543ae`.
Repository: `jsychris/JRT_Website`. Production branch: `railway-members-site`.

## Scope and confidence

Source review of authentication, invitation/password reset, session lifecycle, membership and administrator permissions, events, RSVP answers, comments, image ingestion/moderation/serving, SQL migrations, browser policy and Docker/Railway startup. Dependency audit against the npm advisory database and targeted automated negative tests against an isolated SQLite database and production Next standalone build. Read-only Railway configuration review and a pattern-based scan of tracked files for common private-key/token formats.

No exploitation, brute force, load testing, account creation or member-data extraction was performed against production. This is not a certification, a forensic investigation, or proof of absence of vulnerabilities. The secret scan did not exhaustively inspect Git history. Cloudflare configuration, hosting account MFA, container OS CVEs and an actual backup restoration were not assessed. The review does not assume the prior implementation or its tests are correct.

## Findings and remediation

| ID | Severity | Finding at baseline | Remediation |
|---|---|---|---|
| SEC-01 | High | Outdated Next and native image dependencies; initial npm audit reported 9 high and 1 low vulnerable dependency entries. Entries include transitive/build dependencies, not 10 demonstrated exploitable app bugs. | Next and eslint-config-next 16.3.4; sharp 0.35.4; removed unused direct react-server-dom-webpack; refreshed vulnerable transitive dependencies and lockfile. Final npm audit reports zero known vulnerabilities. Disabled unused Next image optimization. |
| SEC-02 | High | JSON bodies were buffered before length validation; photo moderation JSON had no size limit. Oversized/chunked requests could exhaust memory. | Shared streaming byte limits: auth/photo moderation 6,000 bytes; club 100,000 bytes; uploads 15 MiB plus 10,000 bytes multipart allowance. Explicit 400/413/415/408 responses, 15-second JSON and 30-second upload body deadlines. |
| SEC-03 | Medium | Per-email-only authentication limiting could be bypassed by varying email addresses. Invalid invitations reached expensive password hashing. Limiter rows accumulated. | Persistent global gate of 100 authentication attempts/15 minutes, 10/email/15 minutes, hashed email keys, expired-key cleanup, at most two concurrent auth requests, and invitation validation before hashing plus transactional revalidation. This bounds application resources but does not solve distributed denial of service; see residual risks. |
| SEC-04 | Medium | Default scrypt work factor was below current OWASP guidance. Unknown accounts skipped password derivation. | Versioned scrypt N=131072, r=8, p=1; random salt; timing-safe comparison; dummy verification for unknown accounts. Existing hashes remain compatible and upgrade on successful login. Compare-and-swap prevents overwriting a concurrent password reset. Legacy-hash timing may differ until upgraded. |
| SEC-05 | Medium | Blocking membership did not permanently invalidate sessions. Re-enabling a member restored previously issued sessions. | Database trigger revokes sessions and outstanding invitation/reset links on blocking. Migration clears existing blocked-user sessions. Re-enabling requires a fresh sign-in. Photo upload/moderation rechecks membership after asynchronous body/processing work. |
| SEC-06 | Medium | No supported way to revoke another administrator's privileges. | Explicit admin-only revoke-admin action and confirmation UI. Demotes another admin to member, revokes all sessions and reset links in one transaction, and logs the actor. Self-revocation is prohibited so the acting administrator remains. Ordinary membership updates still cannot silently demote admins. |
| SEC-07 | Medium | Application ran as root inside the container. | start.cjs restricts volume permissions, rejects symlinks, transfers volume ownership to UID/GID 1000, clears supplementary groups and drops privileges before loading the server. Docker and Railway start commands use this wrapper. Application code remains root-owned. Root is used only for startup ownership preparation. |
| SEC-08 | Medium | Missing browser content restrictions and frame protection. | Per-request script nonces with strict-dynamic, no inline-script allowance or production eval, object/base/frame restrictions, same-origin forms, HSTS, no-referrer, nosniff and restricted browser permissions. All HTML renders dynamically to receive fresh nonces. Inline CSS remains allowed for existing component styles. |
| SEC-09 | Low | Cookie name did not prevent sibling-subdomain cookie injection; unlimited sessions per account. | Production __Host-jrt_session cookie, Secure, HttpOnly, SameSite=Lax, Path=/ and no Domain. Maximum 20 retained sessions/account. Old cookie name is no longer accepted in production. Members must sign in once after rollout. |
| SEC-10 | Low | Missing administrative audit trail; unsupported codecs were inspected by native parsing before rejection. | Local audit records actor/action/target for sign-in, invitations/resets, role changes, event saves and photo moderation/deletion, with 365-day retention. No passwords, tokens or private answers logged. JPEG/PNG/WebP signatures checked before native parsing; existing format, pixel, animation and output-size checks retained. |

Additional hardening: production mutation origins fail closed when APP_URL is missing; malformed auth JSON no longer returns a misleading 503; unexpected account-write failures return generic errors; reserved prototype-related question IDs are rejected; comments limited to 30/member/15 minutes.

## Controls reviewed and retained

- Identity comes from a hashed, random server-side session token, not user IDs/emails supplied in headers or bodies.
- SQL parameters are bound. Public event pages filter member-only and draft records server-side.
- Only admins manage events, invitations and membership. Non-admins cannot approve photos or promote themselves.
- Guest names/menu answers are returned only to the booking member and admins; other members see attendance summaries.
- Comment deletion requires ownership or admin permission. React renders user-entered text without raw HTML insertion.
- Invitation/reset tokens are random, stored hashed, email-bound, expiring and single-use, with consumption rechecked inside a transaction. Successful reset revokes sessions.
- Private photos return 404 to unauthorized users. Only approved photos appear publicly. Images are re-encoded, metadata stripped, capped in dimensions/bytes and backed by storage quotas. Upload IDs prevent duplicate successful retries.
- POST routes require an exact approved Origin. Production APP_URL and ADDITIONAL_ORIGINS must remain explicit; forwarded identity headers are not trusted.

## Verification

Run from the production branch using Node 24:

```sh
npm ci
npm test
npm run build
node tests/http-smoke.mjs
npm audit
```

`npm test`: 20 passing tests covering password compatibility, session expiry/revocation, blocking/unblocking, migration preservation, persistent limits, permissions, draft secrecy, private RSVP answers, guest/menu validation, stale event revisions, chunked byte limits, slow-body cancellation, malformed JSON, auth concurrency and unsupported image codecs.

HTTP smoke test uses the actual Next standalone build and temporary data, with no production credentials. Covers bootstrap, single-use invitations, sign-in/reset/logout, cookies, malformed and oversized bodies, foreign Origin, forged identity headers, private event pages, cross-member photo isolation/deletion rejection, moderation, metadata stripping, duplicate uploads, persistence across restarts, private guest answers, blocking/unblocking, admin promotion/revocation, security headers and nonce presence on every rendered script.

The sandbox only maps UID 0 and cannot chown to UID 1000. Therefore local HTTP tests launch the standalone server directly; the privilege-dropping wrapper must additionally be verified through Railway startup logs (`Application runtime uid=1000`) and the health check. Do not mistake the local test for a successful container privilege test.

A successful npm audit only indicates no advisories found in the checked dependency graph at that time. It does not cover the Debian image or all bundled native libraries. No interactive browser test was performed; CSP hydration nonce wiring was checked in HTTP output.

## Outstanding operational risks and independent assessment priorities

1. **Backup/restore assurance (High, unverified):** a persistent volume is not a backup. Available Railway tools could not reliably establish the backup schedule or latest recovery point. Verify an off-volume backup of SQLite and photos and actually restore it in an isolated environment. Use SQLite's backup API or a stopped application for a consistent copy; never copy only a live WAL database file. This review did not enable or test an offsite backup.
2. **Administrator authentication (Medium):** no MFA/passkeys or recent-password challenge for sensitive admin actions. All admins can issue password-reset links and promote/revoke other admins. Keep admin membership small and share reset links through a verified private channel. MFA and step-up authentication remain product work, not claimed as remediated here.
3. **Edge availability controls (Medium):** application limits cap resource use, but a deliberate flood can consume the global sign-in allowance or hold the two auth slots. Cloudflare WAF/bot controls, trusted client-IP provenance and upstream request/connection limits were not verified. Do not replace the global gate with an untrusted X-Forwarded-For limit. In-memory concurrency controls assume the current single replica.
4. **Audit durability (Low/Medium):** audit records are local SQLite, not externally shipped or tamper-evident. Some actions log after their data mutation; logs are not guaranteed atomic for every operation. No security alerting integration was configured.
5. **Hosting assurance:** GitHub/Railway account permissions, branch protection, MFA, image scanning, custom-domain certificate/DNS and Cloudflare settings need a separate verified review. Available Railway summaries were inconsistent about custom-domain state; no domain security conclusion is made.
6. **Regression targets:** challenge concurrent reset/login and invitation consumption, blocked members with in-flight uploads, admin demotion and session revocation, nonce behavior on navigation/error pages, storage exhaustion, malformed multipart/native images, and SQLite/photo consistency during deletion or crash. Test against isolated fixtures, not club data.

## Handover prompt for Claude

Independently assess jsychris/JRT_Website, branch railway-members-site, at the latest security remediation commit. Read this report, but do not accept its conclusions without checking the implementation. Diff against baseline 79b65dfe16d4d459c3ac69433df11db6e9c543ae. Review auth/reset/bootstrap, concurrency and session revocation, admin role lifecycle, cross-member data access, CSRF/XSS/CSP, upload/native-image safety, storage bounds, SQL and migrations, runtime privilege separation and dependencies. Reproduce suspected issues with isolated test accounts and temporary storage, add meaningful regression tests, remediate confirmed findings, and record exact commits and evidence. Distinguish code fixes from operational risks requiring verified hosting configuration. Do not expose secrets, alter production member records, run destructive/load tests against production or claim that zero npm advisories proves the site is secure.

## Reference material

- [Next.js August 2026 security release](https://nextjs.org/blog/august-2026-security-release): framework patch guidance; affected configurations differ, so this report does not claim a demonstrated RCE on this Linux deployment.
- [Next.js Content Security Policy guide](https://nextjs.org/docs/app/guides/content-security-policy): nonce propagation and dynamic rendering requirements.
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html): scrypt work-factor guidance.

Final local results: 20/20 tests passed; production build and standalone HTTP suite passed; npm audit returned 0 info/low/moderate/high/critical advisories; git diff --check passed.

## Deployment verification

Remediation commit: `046a7320bb6411373a9729045041c2b24f901424`.
Railway deployment: `7b85004a-6069-4aac-8ece-2372caca9fef`, status SUCCESS.
Runtime log confirms `Application runtime uid=1000` and Next.js 16.3.4 started successfully. Railway URL `/api/health` returned HTTP 200 with `{"status":"ok"}`; `/login` returned 200 with the nonce CSP, DENY frame policy and nosniff header. These production checks were read-only.

The automated request to `https://jerseyroundtable.com/login` returned HTTP 403 from this environment. The response identified Cloudflare error 1010; do not interpret this as proof of either a working custom-domain sign-in or an application defect. The Railway service URL was verified separately.

Rollback caution: once a member logs in, their stored password may upgrade to the versioned s2 format. The old baseline cannot verify that format. Prefer a forward fix; do not blindly redeploy the baseline after password upgrades. Preserve the database and its immutable applied migrations. Existing member passwords, bookings and photos were not reset during this work.
