// Cloudflare Pages Function — injects dynamic OG meta tags for social crawlers.
// Non-crawlers get a passthrough to static assets (zero overhead).

interface OgEntry {
  t: string;   // title
  d: string;   // description
  img: string | null;
  cat: string;
  date: string | null;
}

type OgManifest = Record<string, OgEntry>;

const CRAWLERS = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Discordbot|TelegramBot|Slackbot/i;

const FALLBACK_IMAGE = 'https://cdn.infraphysics.net/og-image.png';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;
  const ua = request.headers.get('user-agent') || '';

  // Non-crawlers: passthrough immediately
  if (!CRAWLERS.test(ua)) {
    return env.ASSETS.fetch(request);
  }

  // Parse pathname, strip trailing slash
  const url = new URL(request.url);
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Fetch manifest
  let manifest: OgManifest;
  try {
    const manifestResponse = await env.ASSETS.fetch(new URL('/og-manifest.json', request.url));
    if (!manifestResponse.ok) return env.ASSETS.fetch(request);
    manifest = await manifestResponse.json() as OgManifest;
  } catch {
    return env.ASSETS.fetch(request);
  }

  // Lookup entry
  const entry = manifest[pathname];
  if (!entry) return env.ASSETS.fetch(request);

  // Fetch the SPA shell
  const htmlResponse = await env.ASSETS.fetch(new URL('/', request.url));
  if (!htmlResponse.ok) return env.ASSETS.fetch(request);

  const title = escapeHtml(entry.t);
  const description = escapeHtml(entry.d);
  const image = entry.img || FALLBACK_IMAGE;
  const fullTitle = `${title} — InfraPhysics`;
  const canonicalUrl = `${url.origin}${pathname}`;

  // Use HTMLRewriter to inject OG tags
  const rewriter = new HTMLRewriter()
    // Replace <title> text
    .on('title', {
      element(el) { el.setInnerContent(fullTitle); },
    })
    // Update <meta name="description">
    .on('meta[name="description"]', {
      element(el) { el.setAttribute('content', entry.d); },
    })
    // Remove existing OG tags (we'll re-inject them)
    .on('meta[property^="og:"]', {
      element(el) { el.remove(); },
    })
    // Remove existing Twitter tags
    .on('meta[name^="twitter:"]', {
      element(el) { el.remove(); },
    })
    // Append new OG + Twitter tags + JSON-LD to <head>
    .on('head', {
      element(el) {
        const datePart = entry.date
          ? `"datePublished": "${escapeHtml(entry.date)}",`
          : '';
        el.append(`
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="InfraPhysics" />
    <meta property="og:title" content="${fullTitle}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${fullTitle}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${title}",
      "description": "${description}",
      ${datePart}
      "image": "${image}",
      "url": "${canonicalUrl}",
      "author": { "@type": "Person", "name": "Yago Mendoza" },
      "publisher": { "@type": "Organization", "name": "InfraPhysics", "url": "https://infraphysics.net" }
    }
    </script>`, { html: true });
      },
    });

  return rewriter.transform(htmlResponse);
};
