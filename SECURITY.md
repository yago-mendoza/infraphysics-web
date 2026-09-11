# Security controls and deployment

This is a public content site with anonymous counters and one private administrative report. It has no public file upload endpoint, user-account database, JWT login implementation or inbound webhook handler.

## Implemented controls

- `functions/_middleware.ts`: API burst shield (240 requests/minute per connecting IP, 60 for admin), bounded in-memory state, cross-site POST rejection, generic unhandled errors, no CORS access to API responses, no caching of API/admin responses, nosniff and permissions/referrer headers.
- `functions/_lib/security.ts`: streaming byte limits for JSON, JSON-object validation and known content-route checks. Analytics cannot create counters for arbitrary paths; article mutations require an existing article. Bulk stats accept at most 50 paths.
- `workers/counters/wrangler.toml`: native `COUNTER_RATE_LIMITER` binding, namespace `2026091101`, 240 calls/minute. Pages derives its key from the Cloudflare connecting IP and UTC day; caller-supplied analytics IDs cannot evade that key. This shield runs before SQL operations inside the bound object. It still consumes the incoming request allowance. No public Worker URL is enabled.
- SQLite values are parameterized; dynamic grouping/filter column names use a fixed allowlist. Internal database exceptions are not returned to callers.
- `src/lib/safeHtml.ts`: DOMPurify sanitation immediately before article/wiki/annotation HTML insertion, after link and heading transformations. Script/event handlers and unsafe URL schemes are removed; editorial MathML, SVG and data attributes remain supported. Forms/style elements are excluded.
- `/admin/*`: enforced CSP with same-origin scripts, no embedding, no objects, no base URL changes. The HTML response omits public inline setup scripts and the external Tailwind runtime; the admin has its own CSS. Public pages retain their existing runtime and do not yet have an equivalent script CSP.
- Admin authorization remains server-side with a random bearer credential. The local copy is `.secrets/admin-stats-token.txt`, ignored by Git; the runtime secret is `COUNTERS_ADMIN_TOKEN`. It is not included in URLs, browser storage or report exports. Migration remains gated by paused KV mode plus its separate enable flag.

## Limits and remaining external configuration

The Pages burst shield is per isolate and resets on eviction. Cloudflare's native limiter is permissive and local to its execution location, not a strict global accounting quota. Shared IPs may share the allowance. Neither control proves visitors are human or prevents a distributed botnet from consuming the free request allowance. A WAF rate rule before Functions is a separate defense.

On 2026-09-11, the authenticated account query returned no Access applications and no identity providers. Reading zone WAF rules returned 403 with the available OAuth permissions. Do not claim that WAF rules or Access/MFA are enabled.

Before activating Access, obtain the intended allowed identity and configure an identity provider capable of the required MFA. Protect both `/admin/*` and `/api/admin/*` on every production hostname, including the Pages hostname or block that alternate access path. Use an explicit allowlist, short session lifetime and no bypass rule. Retain the backend bearer check as defense in depth. Email one-time codes alone are not MFA. Preview bindings must stay separate from production. Localhost's production API proxy may require an adjusted Access authentication workflow after activation; never solve that by bypassing Access for the API.

## Verification

- Root: `npm.cmd run typecheck`, `npm.cmd run build`.
- Worker: `npm.cmd run check`, `npm.cmd test`, `npm.cmd exec -- wrangler deploy --dry-run` in `workers/counters`.
- Integration tests cover malformed input, oversized JSON, unknown routes, authorization, SQL grouping injection, cross-site requests, admin burst rejection, HTML script removal, CSP headers, counters and deduplication. The native rate binding is included in the local test environment.
- Browser verification checks CSP enforcement, XSS payload removal, retained MathML/wiki links, and populated/empty admin reports on desktop/mobile.
- A targeted scan of all reachable Git-history blobs and built artifacts checked the current admin credential, private-key markers, AWS key patterns and sensitive artifact names. This is not a guarantee that every possible secret format or external log is clean. No remote production logs were downloaded.

Deploy the Worker first, then publish the Pages code. Neither deployment changes stored totals or migrations. Reverting only these security controls does not require a data migration.

References: [Cloudflare rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [Pages headers](https://developers.cloudflare.com/pages/configuration/headers/), [DOMPurify](https://github.com/cure53/DOMPurify), [Access application paths](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/).
