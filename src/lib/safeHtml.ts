import DOMPurify from 'dompurify';

// Keep editorial HTML, SVG, MathML and data attributes; remove executable markup.
// Call after link/heading transformations, immediately before the React HTML sink.
// Heading-link and code-copy buttons are part of the article UI. DOMPurify
// removes inline event handlers while preserving their wrappers and CSS hooks.
export const safeHtml=(html:string)=>DOMPurify.sanitize(html,{ADD_ATTR:['target'],FORBID_TAGS:['style','form','input','textarea','select']});
