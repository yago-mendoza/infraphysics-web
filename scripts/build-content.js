import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked, Renderer } from 'marked';
import { load as loadYaml } from 'js-yaml';
import { fileURLToPath } from 'url';
import { validateFieldnotes } from './validate-fieldnotes.js';
import compilerConfig from './compiler.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom renderer for images with positioning (center/full only - left/right handled by preprocessor)
const customRenderer = new Renderer();
const { titlePattern, classMap } = compilerConfig.imagePositions;

customRenderer.image = function({ href, title, text }) {
  let className = '';
  let style = '';
  let finalTitle = title;

  if (title) {
    const positionMatch = title.match(titlePattern);
    if (positionMatch) {
      const position = positionMatch[1];
      const width = positionMatch[2];
      className = classMap[position] || '';
      if (width && position !== 'full') style = `width: ${width};`;
      finalTitle = null;
    }
  }

  const classAttr = className ? ` class="${className}"` : '';
  const styleAttr = style ? ` style="${style}"` : '';
  const titleAttr = finalTitle ? ` title="${finalTitle}"` : '';
  const alt = text || '';

  return `<img src="${href}" alt="${alt}"${classAttr}${styleAttr}${titleAttr} />`;
};

marked.setOptions({
  renderer: customRenderer,
  ...compilerConfig.marked,
});

// Apply pre-processors (before marked.parse, on raw markdown)
function applyPreProcessors(markdown) {
  let result = markdown;
  for (const rule of compilerConfig.preProcessors) {
    result = result.replace(rule.pattern, rule.replace);
  }
  return result;
}

// Apply post-processors (after marked.parse, on HTML)
function applyPostProcessors(html) {
  let result = html;
  for (const rule of compilerConfig.postProcessors) {
    result = result.replace(rule.pattern, rule.replace);
  }
  return result;
}

// Preprocess markdown to handle side-by-side image layouts
// Pattern: ![alt](src "left|right:width") followed by text lines until empty line
function preprocessSideImages(markdown) {
  const blocks = markdown.split(/\n\n+/);
  const result = [];

  for (const block of blocks) {
    // Match image with left/right position at start of block
    const match = block.match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"(left|right):?(\d+px)?")?\)([\s\S]*)/);

    if (match && (match[3] === 'left' || match[3] === 'right')) {
      const [, alt, src, position, width, restOfBlock] = match;
      const widthStyle = width ? `width: ${width};` : '';

      // Get text lines after the image (same block = no empty line between)
      const textLines = restOfBlock.trim().split('\n').filter(l => l.trim());

      if (textLines.length > 0) {
        // Process each line through marked for inline formatting (bold, italic, links, etc.)
        const paragraphs = textLines.map(line => {
          const processed = marked.parseInline(line);
          return `<p>${processed}</p>`;
        }).join('\n');

        // Create flexbox container with image and text side by side
        result.push(`<div class="img-side-layout img-side-${position}">
<img src="${src}" alt="${alt}" class="img-side-img" style="${widthStyle}">
<div class="img-side-content">
${paragraphs}
</div>
</div>`);
      } else {
        // No text after image, let marked handle it normally
        result.push(block);
      }
    } else {
      result.push(block);
    }
  }

  return result.join('\n\n');
}

const PAGES_DIR = path.join(__dirname, '../src/data/pages');
const OUTPUT_FILE = path.join(__dirname, '../src/data/posts.generated.json');
const CATEGORIES_OUTPUT = path.join(__dirname, '../src/data/categories.generated.json');
const HOME_FEATURED_OUTPUT = path.join(__dirname, '../src/data/home-featured.generated.json');

function processMarkdownFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(fileContent);

  // Pipeline: preProcessors → sideImages → marked → postProcessors
  const withCustomSyntax = applyPreProcessors(content);
  const withSideImages = preprocessSideImages(withCustomSyntax);
  const htmlContent = applyPostProcessors(marked.parse(withSideImages));

  return {
    id: frontmatter.id,
    title: frontmatter.title,
    displayTitle: frontmatter.displayTitle,
    category: frontmatter.category,
    date: frontmatter.date,
    thumbnail: frontmatter.thumbnail || null,
    description: frontmatter.description,
    content: htmlContent,
    status: frontmatter.status || null,
    technologies: frontmatter.technologies || null,
    tags: frontmatter.tags || null,
    github: frontmatter.github || null,
    demo: frontmatter.demo || null,
    duration: frontmatter.duration || null,
    featured: frontmatter.featured || null,
    author: frontmatter.author || null,
    subtitle: frontmatter.subtitle || null,
    notes: frontmatter.notes || null,
    topics: frontmatter.topics || null,
  };
}

function loadCategoryConfig(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return loadYaml(content);
}

function getAllMarkdownFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith('.md') && !item.startsWith('_')) {
      // Skip _fieldnotes.md and other _*.md files
      files.push(fullPath);
    }
  }

  return files;
}

function getAllCategoryConfigs(dir) {
  const configs = {};
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const configPath = path.join(fullPath, '_category.yaml');
      if (fs.existsSync(configPath)) {
        const config = loadCategoryConfig(configPath);
        configs[config.name] = config;
      }
    }
  }

  return configs;
}

// --- Fieldnotes: parse _fieldnotes.md ---

function processFieldnotesFile() {
  const fieldnotesDir = path.join(PAGES_DIR, 'fieldnotes');
  if (!fs.existsSync(fieldnotesDir)) return [];

  // Find _*.md files (not _category.yaml)
  const dirFiles = fs.readdirSync(fieldnotesDir);
  const fieldnotesFile = dirFiles.find(f => f.startsWith('_') && f.endsWith('.md'));
  if (!fieldnotesFile) return [];

  const filePath = path.join(fieldnotesDir, fieldnotesFile);
  const content = fs.readFileSync(filePath, 'utf-8');
  const blocks = content.split(/\n---\n/).map(b => b.trim()).filter(Boolean);

  return blocks.map(block => {
    const lines = block.split('\n');
    const address = lines[0].trim();
    const bodyLines = lines.slice(1);
    const bodyMd = bodyLines.join('\n').trim();

    // Generate ID: lowercase, // → --, / → -, space → -
    const id = address.toLowerCase().replace(/\/\//g, '--').replace(/\//g, '-').replace(/\s+/g, '-');

    // Address parts
    const addressParts = address.split('//').map(s => s.trim());
    const displayTitle = addressParts[addressParts.length - 1];

    // Description: first non-empty, non-heading, non-image text line
    const firstTextLine = bodyLines.find(l => {
      const trimmed = l.trim();
      return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!');
    });
    const description = firstTextLine
      ? firstTextLine.trim().replace(/\[\[([^\]]+)\]\]/g, (_m, addr) => addr.split('//').pop().trim())
      : '';

    // Extract ALL [[...]] references from body markdown
    const refRegex = /\[\[([^\]]+)\]\]/g;
    const references = [];
    let match;
    while ((match = refRegex.exec(bodyMd)) !== null) {
      references.push(match[1]);
    }

    // Extract trailing refs (standalone [[...]] lines at end of block)
    const trailingRefs = [];
    const trailingRefPattern = /^\s*(\[\[[^\]]+\]\]\s*)+$/;
    for (let i = bodyLines.length - 1; i >= 0; i--) {
      const line = bodyLines[i].trim();
      if (!line) continue;
      if (trailingRefPattern.test(line)) {
        const lineRefRegex = /\[\[([^\]]+)\]\]/g;
        let lineMatch;
        while ((lineMatch = lineRefRegex.exec(line)) !== null) {
          trailingRefs.push(lineMatch[1]);
        }
      } else {
        break;
      }
    }

    // Pipeline: preProcessors → sideImages → marked → postProcessors
    const withCustomSyntax = applyPreProcessors(bodyMd);
    const withSideImages = preprocessSideImages(withCustomSyntax);
    const htmlContent = applyPostProcessors(marked.parse(withSideImages));

    return {
      id,
      title: address,
      displayTitle,
      category: 'fieldnotes',
      date: '',
      thumbnail: null,
      description,
      content: htmlContent,
      address,
      addressParts,
      references,
      trailingRefs,
    };
  });
}

// --- Wiki-link build-time processing for ALL posts ---

function processWikiLinks(html) {
  if (!compilerConfig.wikiLinks.enabled) return html;
  return html.replace(compilerConfig.wikiLinks.pattern, (_match, address) => {
    return compilerConfig.wikiLinks.toHtml(address);
  });
}

// Main
console.log('Building content...');

const markdownFiles = getAllMarkdownFiles(PAGES_DIR);
const regularPosts = markdownFiles.map(processMarkdownFile);
const fieldnotePosts = processFieldnotesFile();

// Apply wiki-link processing to all posts
const allPosts = [...regularPosts, ...fieldnotePosts].map(post => ({
  ...post,
  content: processWikiLinks(post.content),
}));

const categories = getAllCategoryConfigs(PAGES_DIR);

// Validate fieldnotes
validateFieldnotes(fieldnotePosts, allPosts, compilerConfig.validation);

// --- Home featured posts ---

const homeFeaturedPath = path.join(PAGES_DIR, 'home', '_home-featured.yaml');
let homeFeatured = { featured: [] };

if (fs.existsSync(homeFeaturedPath)) {
  const raw = loadYaml(fs.readFileSync(homeFeaturedPath, 'utf-8'));
  homeFeatured = raw;
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPosts, null, 2));
fs.writeFileSync(CATEGORIES_OUTPUT, JSON.stringify(categories, null, 2));
fs.writeFileSync(HOME_FEATURED_OUTPUT, JSON.stringify(homeFeatured, null, 2));

console.log(`Generated ${allPosts.length} posts → ${OUTPUT_FILE}`);
console.log(`Generated ${Object.keys(categories).length} categories → ${CATEGORIES_OUTPUT}`);
console.log(`Generated home featured config → ${HOME_FEATURED_OUTPUT}`);
