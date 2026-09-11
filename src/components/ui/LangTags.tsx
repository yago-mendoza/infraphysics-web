import React from 'react';
import { SparkleIcon } from '../icons';
import type { RouteLanguage } from '../../hooks/useRouteLanguage';
import type { Lang } from '../../contexts/LangContext';

/**
 * The EN / ES readout of the language control. The version on screen is bright; a version the page
 * does not exist in is dimmed and struck through diagonally; a version written with AI (`ai: true`
 * in that file's frontmatter) carries the two-star mark after its label. Styles: global.css, .lang-tag.
 */
export const LangTags: React.FC<{ routeLang: RouteLanguage }> = ({ routeLang }) => {
  const tag = (lang: Lang) => {
    const off = !routeLang.available.includes(lang);
    const current = routeLang.current === lang && !off;
    return (
      <span className={`lang-tag${current ? ' is-current' : ''}${off ? ' is-off' : ''}`} title={off ? `Not available in ${lang === 'es' ? 'Castellano' : 'English'}` : routeLang.aiWritten.includes(lang) ? 'This version was written with AI' : undefined}>
        {lang.toUpperCase()}
        {!off && routeLang.aiWritten.includes(lang) && <SparkleIcon />}
      </span>
    );
  };
  return <>{tag('en')}<span className="lang-tag-sep">/</span>{tag('es')}</>;
};
