# InfraPhysics counters

SQLite Durable Object, accessed by Pages Functions through an external Worker binding.
The Worker returns 404 on its own fetch entrypoint and has no workers.dev URL.
The deployed site continues using KV unless `COUNTERS_BACKEND=durable` is explicitly set.
Failures in durable mode return errors; they never silently write to KV.

## What is counted

- Article views retain the old IP + stable content path hash and 24-hour deduplication.
- Hearts retain the old permanent `hearted:` state, including the ability to remove a like.
- Page views retain visitor/session identities and 30-minute session/path deduplication.
- All-time totals and daily UTC aggregates **do not expire**. Only temporary deduplication/session records expire.
- New daily aggregates include page views, sessions, visitors, article views, heart adds/removals, entry pages, referrer groups, country, language and device class.
- Daily entry/referrer/country/device/language metrics count new sessions, not every page load.
- Raw IPs, referrer paths/query strings and literal searches are not stored. Existing IP hashes and visitor IDs are pseudonymous, not anonymous.
- The public presence endpoint keeps its JSON shape and historical offsets, but new events expose country only, not a visitor's city. Imported legacy presence may retain its last city until replaced by a new event.
- The admin report shows stored totals without the historical estimates from `src/config/analytics.ts`.
- The client waits for visibility before counting, omits site analytics in Vite development, and honors DNT/GPC for site analytics. Article view counting remains separate.
- Known bots are filtered by user agent. Bots that spoof browsers can still count; these are not verified-human metrics. Use Cloudflare edge rate limits if abuse appears.

Not implemented: scroll/read completion, per-session paths, 404 reports, Wiki searches and feature-click instrumentation. These require explicit event semantics and frontend wiring. Completion should mean measured scroll/visible time, not proof of reading; search analytics should avoid storing arbitrary text by default. Aggregated transitions can answer navigation questions without keeping individual browsing histories.

## Private admin page

`/admin/stats` is a standalone plain HTML-style React panel, outside the public navigation shell.
`POST /api/admin/counters` requires `Authorization: Bearer <COUNTERS_ADMIN_TOKEN>`.
There is **no default credential**. Create a random secret with at least 32 characters and store it as a Pages encrypted environment secret. The browser clears the password field after login and holds the credential only in component memory until logout, navigation away or reload, allowing date filters without repeated login. It is never included in a URL or localStorage. The local admin page uses a dedicated Vite proxy to the same authenticated production API.
Admin responses are no-store, have no cross-origin sharing headers, and reject query-string-only credentials.
The local production credential is stored at `.secrets/admin-stats-token.txt` (ignored by Git), not in the disposable `room/` folder. The matching runtime secret is `COUNTERS_ADMIN_TOKEN` in Cloudflare Pages. Documentation must reference the location only, never contain the value.
The static page itself is public; the data API is authenticated. An ugly page, noindex and an unlisted URL are not access controls.

For email-based access, configure Cloudflare Access for both `/admin/*` and `/api/admin/*` on every reachable hostname. Access is **not configured by this code**. Keep the API bearer check until Access JWT validation or an equivalent origin restriction is implemented; a custom-domain-only policy may leave the pages.dev hostname reachable.

Reports accept optional `from` and `to` ISO dates. The dashboard separates all-time page/session/visitor counts, article views/hearts, daily activity, session entry pages, referrers, countries, browser languages and device classes. Period summaries and breakdowns are aggregated in SQL independently of the raw-row response limit. Each response includes at most 366 active days, 100 rows per ranking and 10,000 raw daily rows. Query smaller date ranges to access older data. These are response limits, not retention policies. Downloaded report JSON covers that query, not a complete database backup.

## Local verification

From the repository root:

```powershell
npm.cmd run typecheck
npm.cmd exec -- tsc --noEmit -p workers/counters/tsconfig.json
```

From `workers/counters`:

```powershell
npm.cmd ci --ignore-scripts
npm.cmd test
npm.cmd exec -- wrangler deploy --dry-run
```

The integration test runs real workerd/SQLite with two Workers, including the Pages-to-external-DO binding. It does not prove that the production dashboard binding is configured.
Wrangler is pinned; the Sharp override fixes a dependency advisory in the local simulator.

## Deployment and cutover

1. Authenticate with `npm.cmd exec -- wrangler login` from this folder, then run `npm.cmd run deploy`.
2. In the Pages production project, add a Durable Object binding `COUNTERS` to Worker `infraphysics-counters`, class `Counters`. Keep existing KV binding `VIEWS`. Use compatibility date `2026-09-01` or newer. This integration uses internal fetch rather than RPC.
3. Add secret `COUNTERS_ADMIN_TOKEN`; set `COUNTERS_BACKEND=kv`, `COUNTERS_PAUSED=0`, `COUNTERS_MIGRATION_ENABLED=0`. Publish the Pages changes, including `public/_routes.json`, which explicitly includes `/api/admin/*`.
4. Probe the five existing endpoints and authenticate an admin `{ "op": "status" }` request. The object should report `empty`. Confirm previews are not bound to production counters before testing mutations.
5. Set `COUNTERS_PAUSED=1` and `COUNTERS_MIGRATION_ENABLED=1`, redeploy Pages, and confirm POST views/reactions/analytics return 503. Reads continue from KV. Pause creates a small, explicit measurement gap; do not pretend these visits can be reconstructed later.
6. Wait for old deployments/in-flight writes and KV propagation to settle. Set `COUNTERS_URL` and `COUNTERS_ADMIN_TOKEN` in the local process environment. From the repository root run `node scripts/counters-migrate.mjs export-kv`. It compares two snapshots 65 seconds apart. Two matching snapshots reduce risk but cannot mathematically prove eventual-consistency convergence; confirm the public write pause and deployment drain too.
7. Run `node scripts/counters-migrate.mjs import room/counters-backups/<id>.json`. It rechecks KV, imports non-additively, compares every entry and expiration, then activates the object. Import batches can be retried. A conflicting snapshot is rejected. If the activation response is lost, query status and compare exports before retrying; do not reset the object.
8. Set `COUNTERS_BACKEND=durable` while still paused, redeploy, compare counts and historical offsets. Set `COUNTERS_MIGRATION_ENABLED=0`, then `COUNTERS_PAUSED=0` and redeploy. Probe JSON responses from `/api/views/<known-path>`, `/api/reactions/<known-path>`, `/api/stats`, `/api/analytics`, `/api/presence` and authenticated admin report. A synthetic mutation is a real counted event: use a dedicated staging binding to test writes without polluting production.
9. Keep KV and the ignored snapshot as recovery material. Restrict and rotate the admin credential as appropriate. Review actual Cloudflare usage after cutover.

The migration endpoint remains in code but migration operations are disabled by default, require the secret and only run in paused KV mode. Removing the migration code after cutover is optional cleanup, not a protection on which the API depends.

## Recovery and limits

Before durable writes start, switching back to KV is safe. Afterwards **reverting a commit is not a data-preserving rollback**: KV has none of the new visits/hearts. Pause writes, export current state with `node scripts/counters-migrate.mjs export-durable`, reconcile KV including deleted heart states and TTLs, verify, then switch. An automated reverse import is intentionally not provided. Daily aggregates remain in the DO; the KV-compatible export is not a full daily-series backup. Do not delete the DO during rollback.

Cloudflare's documented Free limits at implementation time: 100,000 DO requests/day, 100,000 SQL rows written/day, 5 million rows read/day, 5 GB total storage, 13,000 GB-s/day duration. The enclosing Pages/Workers requests also consume their own allowance. Reads, alarms, deletes, indexes, migration and reports consume resources too. A new visitor/session/page writes multiple counters, deduplication keys and daily aggregates: **not one or two rows**. Measure actual rows with Cloudflare metrics; no fixed visits-per-day guarantee is claimed.

On Free, exceeding a limit causes operation failures until allowance resets; it is not an automatic paid upgrade. A single object also adds network latency for distant visitors and concentrates load. These counters load asynchronously; they should not block page rendering. Unlimited retention means storage grows: monitor it and export/archive deliberately if needed instead of silently deleting history.

Official references: [pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/), [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/), [SQLite storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/).
