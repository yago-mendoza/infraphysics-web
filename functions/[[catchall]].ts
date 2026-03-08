// Cloudflare Pages Function — injects dynamic OG/meta tags + readable content for crawlers.
// Non-crawlers get a passthrough to static assets (zero overhead).

interface OgEntry {
  t: string;   // title
  d: string;   // description
  img: string | null;
  cat: string | null;
  date: string | null;
  text?: string; // plain text body (for AI crawlers)
}

type OgManifest = Record<string, OgEntry>;

const CRAWLERS = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Discordbot|TelegramBot|Slackbot|Googlebot|bingbot|GPTBot|ChatGPT-User|ClaudeBot|anthropic-ai|PerplexityBot|Bytespider|cohere-ai|meta-externalagent/i;

const FALLBACK_IMAGE = 'https://infraphysics.net/og-image.jpg';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Strip HTML tags from content to get plain text (for fieldnotes fetched at runtime)
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|li|tr|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
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

  // For fieldnotes without pre-built text, fetch content at runtime
  let bodyText = entry.text || '';
  if (!bodyText && entry.cat === 'fieldnotes') {
    try {
      const noteId = pathname.split('/').pop();
      const contentRes = await env.ASSETS.fetch(new URL(`/fieldnotes/${noteId}.json`, request.url));
      if (contentRes.ok) {
        const { content } = await contentRes.json() as { content: string };
        bodyText = stripHtml(content);
      }
    } catch { /* skip */ }
  }

  // Build JSON-LD based on page type
  function buildJsonLd(): string {
    const author = `{ "@type": "Person", "name": "Yago Mendoza" }`;
    const publisher = `{ "@type": "Organization", "name": "InfraPhysics", "url": "https://infraphysics.net" }`;

    if (pathname === '/home') {
      return `{
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "InfraPhysics",
      "url": "https://infraphysics.net",
      "description": "${description}",
      "author": {
        "@type": "Person",
        "name": "Yago Mendoza",
        "jobTitle": "Industrial Engineer & Systems Builder",
        "url": "https://infraphysics.net/about",
        "sameAs": [
          "https://github.com/yago-mendoza",
          "https://linkedin.com/in/yago-mendoza",
          "https://x.com/ymdatweets"
        ]
      }
    }`;
    }

    if (pathname === '/about') {
      return `{
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "mainEntity": {
        "@type": "Person",
        "name": "Yago Mendoza",
        "jobTitle": "Industrial Engineer & Systems Builder",
        "url": "https://infraphysics.net/about",
        "sameAs": [
          "https://github.com/yago-mendoza",
          "https://linkedin.com/in/yago-mendoza",
          "https://x.com/ymdatweets"
        ],
        "knowsAbout": ["Machine Learning", "Transformer Architecture", "AI Alignment", "Distributed Systems", "Rust", "Knowledge Graphs", "Scaling Laws"],
        "description": "Industrial engineer who bridges hardware and software. Writes about ML infrastructure, scaling laws, and cross-domain pattern recognition."
      }
    }`;
    }

    // Default: Article schema with BreadcrumbList
    const datePart = entry.date
      ? `"datePublished": "${escapeHtml(entry.date)}",`
      : '';

    // Build breadcrumb segments from pathname
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbItems = segments.map((seg, i) => {
      const itemPath = '/' + segments.slice(0, i + 1).join('/');
      return `{ "@type": "ListItem", "position": ${i + 1}, "name": "${escapeHtml(seg)}", "item": "${url.origin}${itemPath}" }`;
    });

    return `[
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${title}",
        "description": "${description}",
        ${datePart}
        "image": "${image}",
        "url": "${canonicalUrl}",
        "author": ${author},
        "publisher": ${publisher}
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [${breadcrumbItems.join(', ')}]
      }
    ]`;
  }

  // Use HTMLRewriter to inject OG tags + readable body content
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
        const ogType = entry.cat ? 'article' : 'website';
        el.append(`
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="${ogType}" />
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
    ${buildJsonLd()}
    </script>`, { html: true });
      },
    })
    // Inject readable content into <body> so AI crawlers see actual text
    .on('div#root', {
      element(el) {
        if (!bodyText) return;
        const articleTag = entry.cat ? 'article' : 'main';
        const dateLine = entry.date ? `<time datetime="${escapeHtml(entry.date)}">${escapeHtml(entry.date)}</time>` : '';
        // Convert plain text paragraphs to HTML paragraphs
        const paragraphs = bodyText.split('\n\n').map(p => `<p>${escapeHtml(p.trim())}</p>`).join('\n');
        el.after(`
    <${articleTag} style="max-width:48rem;margin:2rem auto;padding:0 1rem;font-family:system-ui,sans-serif;line-height:1.7;color:#e8eaed">
      <h1>${escapeHtml(entry.t)}</h1>
      ${dateLine}
      <p><em>${description}</em></p>
      <hr />
      ${paragraphs}
      <footer>
        <p>By <a href="https://infraphysics.net/about">Yago Mendoza</a> — industrial engineer and systems builder. Published on <a href="https://infraphysics.net">InfraPhysics</a>.</p>
        <p>Yago Mendoza writes about machine learning, distributed systems, AI alignment, and cross-domain pattern recognition at InfraPhysics.</p>
      </footer>
    </${articleTag}>`, { html: true });
      },
    });

  return rewriter.transform(htmlResponse);
};
