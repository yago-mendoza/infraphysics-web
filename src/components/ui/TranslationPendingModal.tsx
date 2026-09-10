// TranslationPendingModal: what the disabled language control says when it is pressed on a
// page that has no Spanish version yet. One short, plain apology, in the language the reader
// asked for, and a way out. The preference stays as it was.
//
// Special case, on purpose: the link inside the card that flips its own text between Spanish
// and English is NOT part of the site's translation layer. It is not a translated sibling
// (`<slug>.es.md`), it does not touch the reader preference (`infraphysics:lang`), it does not
// change the url, and it must not be counted or listed anywhere as a translation. The card is a
// notice about translations and happens to be readable in both languages; that is all. When
// the chrome dictionary layer arrives, this copy can move into it, but the flip stays local.

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  onClose: () => void;
}

// The apology opens in Spanish (pressing the control means wanting Spanish); a small link flips
// the card itself to English for the reader who pressed it out of curiosity.
const COPY = {
  es: {
    label: 'Página por traducir',
    title: 'Esta página todavía no está en castellano.',
    body: 'Voy traduciendo los textos poco a poco y a este aún no le ha llegado el turno. Mientras tanto se lee en el original, en inglés. Perdona las molestias.',
    close: 'Entendido',
    other: 'Read this in English',
  },
  en: {
    label: 'Page not translated yet',
    title: 'This page is not in Spanish yet.',
    body: 'I am translating the texts one at a time and this one has not had its turn. Until then it reads in the original, in English. Sorry for the trouble.',
    close: 'Got it',
    other: 'Leer esto en castellano',
  },
} as const;

export const TranslationPendingModal: React.FC<Props> = ({ onClose }) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const copy = COPY[lang];

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return createPortal(
    <div className="presence-info-veil translation-pending-veil" role="presentation" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="presence-info-card translation-pending-card" role="alertdialog" aria-modal="true" aria-labelledby="translation-pending-title" lang={lang}>
        <small>{copy.label}</small>
        <h2 id="translation-pending-title">{copy.title}</h2>
        <p>{copy.body}</p>
        <div className="translation-pending-actions">
          <button type="button" className="translation-pending-other" lang={lang === 'es' ? 'en' : 'es'} onClick={() => setLang(lang === 'es' ? 'en' : 'es')}>{copy.other}</button>
          <button ref={closeRef} type="button" className="translation-pending-go" onClick={onClose}>{copy.close}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
