import React from 'react';
import { FileTextIcon, GearIcon, WikiBrainIcon } from '../components/icons';

/**
 * Semantic presentation for content entities.
 *
 * Components should ask for an entity icon instead of choosing a glyph
 * locally. This keeps Wiki concepts, articles and Notes recognizable across
 * search, navigation and future cross-link surfaces.
 */
export type ContentEntityKind =
  | 'projects'
  | 'threads'
  | 'bits2bricks'
  | 'wiki'
  | 'notes'
  | 'writing';

type EntityPresentation = {
  label: string;
  accentVar: string;
  Icon: React.ComponentType;
};

const WikiIcon = () => <WikiBrainIcon size={22} />;

export const CONTENT_ENTITY_PRESENTATION: Record<ContentEntityKind, EntityPresentation> = {
  projects: { label: 'Projects', accentVar: 'var(--cat-projects-accent)', Icon: GearIcon },
  threads: { label: 'Essays', accentVar: 'var(--cat-threads-accent)', Icon: FileTextIcon },
  bits2bricks: { label: 'Technical', accentVar: 'var(--cat-bits2bricks-accent)', Icon: FileTextIcon },
  wiki: { label: 'Wiki', accentVar: 'var(--cat-fieldnotes-accent)', Icon: WikiIcon },
  notes: { label: 'Notes', accentVar: 'var(--brand-oxide)', Icon: FileTextIcon },
  writing: { label: 'Writing', accentVar: 'var(--text-secondary)', Icon: FileTextIcon },
};

export const contentEntityKind = (value: string): ContentEntityKind =>
  value in CONTENT_ENTITY_PRESENTATION ? value as ContentEntityKind : 'writing';

export const ContentEntityIcon: React.FC<{ kind: ContentEntityKind | string }> = ({ kind }) => {
  const Icon = CONTENT_ENTITY_PRESENTATION[contentEntityKind(kind)].Icon;
  return <Icon />;
};

