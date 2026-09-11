import DOMPurify from 'dompurify';

// Keep editorial HTML, SVG, MathML and data attributes; remove executable markup.
// Call after link/heading transformations, immediately before the React HTML sink.
export const safeHtml=(html:string)=>DOMPurify.sanitize(html,{ADD_ATTR:['target'],FORBID_TAGS:['style','form','input','button','textarea','select']});
