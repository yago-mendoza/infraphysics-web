import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked, Renderer } from 'marked';
import { load as loadYaml } from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom renderer for images with positioning
const customRenderer = new Renderer();

customRenderer.image = function({ href, title, text }) {
  let className = '';
  let style = '';
  let finalTitle = title;

  if (title) {
    const positionMatch = title.match(/^(right|left|center|full):?(\d+px)?$/);
    if (positionMatch) {
      const position = positionMatch[1];
      const width = positionMatch[2];

      switch (position) {
        case 'right':
          className = 'img-float-right';
          if (width) style = `width: ${width};`;
          break;
        case 'left':
          className = 'img-float-left';
          if (width) style = `width: ${width};`;
          break;
        case 'center':
          className = 'img-center';
          if (width) style = `width: ${width};`;
          break;
        case 'full':
          className = 'img-full';
          break;
      }
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
  gfm: true,
  breaks: false,
});

const PAGES_DIR = path.join(__dirname, '../src/data/pages');
const OUTPUT_FILE = path.join(__dirname, '../src/data/posts.generated.json');
const CATEGORIES_OUTPUT = path.join(__dirname, '../src/data/categories.generated.json');

function processMarkdownFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(fileContent);
  const htmlContent = marked.parse(content);

  return {
    id: frontmatter.id,
    title: frontmatter.title,
    displayTitle: frontmatter.displayTitle,
    category: frontmatter.category,
    date: frontmatter.date,
    thumbnail: frontmatter.thumbnail || null,
    description: frontmatter.description,
    content: htmlContent,
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
    } else if (item.endsWith('.md')) {
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

// Main
console.log('Building content...');

const markdownFiles = getAllMarkdownFiles(PAGES_DIR);
const posts = markdownFiles.map(processMarkdownFile);
const categories = getAllCategoryConfigs(PAGES_DIR);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
fs.writeFileSync(CATEGORIES_OUTPUT, JSON.stringify(categories, null, 2));

console.log(`Generated ${posts.length} posts → ${OUTPUT_FILE}`);
console.log(`Generated ${Object.keys(categories).length} categories → ${CATEGORIES_OUTPUT}`);
