import { STATUS_CONFIG } from './config/categories';

export type Category = 'projects' | 'essays' | 'bits2bricks' | 'fieldnotes';

export type PostStatus = keyof typeof STATUS_CONFIG;

/* ── Base fields shared by every content type ── */

interface BasePost {
  id: string;
  title: string;
  displayTitle?: string;
  content: string;
  date: string;
  description: string;
  tags?: string[] | null;
  author?: string | null;
  thumbnail?: string;
  thumbnailAspect?: string | null;
  thumbnailShading?: string | null;
  /** Vertical crop anchor for the banner, % from top (0 = top, 50 = center, 100 = bottom). Only affects cover-cropped aspects (wide/banner/strip), not `full`. */
  thumbnailFocus?: number | null;
  /** `full` makes the essay hero span the reading column (edge to edge with the text margins). Unset = narrower centered default. */
  thumbnailWidth?: 'full' | null;
  /** Scale factor for the card thumbnail in the essays grid (1.15 = 15% zoom in). Unset = 1. */
  thumbnailZoom?: number | null;
  subtitle?: string | null;
  tldr?: string[] | string | null;
  related?: string[] | null;
  featured?: boolean;
  complexity?: number | null;   // 1–10, maps to audience labels
  /** Forces this theme when the article is opened (route-level, instant). Manual toggle still works afterwards. */
  theme?: 'light' | 'dark' | null;
}

/* ── Category-specific extensions ── */

export interface ProjectPost extends BasePost {
  category: 'projects';
  status?: PostStatus;
  github?: string;
  demo?: string;
  caseStudy?: string;
  technologies?: string[];
  duration?: string;
}

export interface ArticlePost extends BasePost {
  category: 'essays' | 'bits2bricks';
}

export type PostSummary = Post extends infer P
  ? P extends Post ? Omit<P, 'content'> : never
  : never;

/* ── Fieldnote: lightweight metadata (no content) + full type ── */

export interface ConnectionRef {
  uid: string;
  annotation: string | null;
}

export interface FieldNoteMeta {
  id: string;
  title: string;
  displayTitle?: string;
  name: string;
  category: 'fieldnotes';
  date: string;
  description: string;
  address: string;
  addressParts?: string[];
  references?: string[];
  trailingRefs?: ConnectionRef[];
  searchText?: string;
  aliases?: string[];
  supersedes?: string;
  distinct?: string[];
}

export interface FieldNote extends FieldNoteMeta {
  content: string;
}

/** Display label: prefers displayTitle over title */
export const noteLabel = (note: { title: string; displayTitle?: string }) =>
  note.displayTitle || note.title;

/* ── Discriminated union (fieldnotes excluded — loaded via brainIndex) ── */

export type Post = ProjectPost | ArticlePost;
