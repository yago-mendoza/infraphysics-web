// Keep searchable copy and displayed explanations together so the guide cannot drift from its index.
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SearchIcon, CloseIcon } from '../icons';

interface Topic {
  id: string;
  section: string;
  title: string;
  keywords?: string;
  paragraphs: string[];
}

const TOPICS: Topic[] = [
  { id: 'overview', section: 'Getting started', title: 'Explore the Wiki', keywords: 'overview getting started ayuda empezar', paragraphs: [
    'The Wiki is a collection of short concept notes. Open a card to read a note, then follow links to related ideas. The directory organizes concepts by their address; the graph shows their connections.',
    'The Wiki Console brings together the graph and directory. Search and filter & sort sit above the concept cards. On a phone, use Open Wiki Console to reveal the console.',
    'This guide has its own search above the explanations. Try sorting, articles, or graph. Results search every topic and its text; selecting a result opens the relevant explanation without changing your Wiki search or filters.',
    'Visited note links use blue; unvisited links use the Wiki accent. Visits are remembered in this browser tab for the session. Graph nodes use a separate color system explained under Graph colors.',
    'To reveal the site navigation, move your pointer near the bottom edge or scroll up on touch. The Back arrow returns to your previous section. Shift+T switches the site theme when you are outside a text field.',
  ] },
  { id: 'keyboard', section: 'Getting started', title: 'Keyboard shortcuts', keywords: 'teclado atajos enter escape arrows', paragraphs: [
    'Outside an input, type to focus the Wiki search. On the card grid, arrow keys move the highlighted card and Enter opens it. Arrow keys from the search field transfer navigation to the grid; Enter opens the highlighted result, or the first result if none is highlighted.',
    'Escape clears the Wiki search and card focus. When reading a note, the neighborhood list also supports arrow-key navigation: left and right change zones, up and down move within a zone.',
    'Inside this guide, typing searches only the help. Enter in the search opens the first result; Arrow Down moves to the result buttons. Tab moves between controls. Escape clears a help search first, then closes the guide. These keys do not navigate the Wiki behind it.',
  ] },
  { id: 'search', section: 'Search & results', title: 'Search fields', keywords: 'search modes buscar busqueda aliases backlinks referenced by all', paragraphs: [
    'Name searches concept names, address paths, and aliases. Use it when you know roughly what the concept is called. Content searches the note text and description, which helps when you remember a phrase rather than a title.',
    'Referenced by finds concepts that are linked from matching notes. The query is matched against the referring notes’ names, paths, text, and descriptions. For example, if a note about CPU links to ARM, searching CPU in referenced by can return ARM. It does not mean finding every note that mentions ARM.',
    'The name, content, and referenced by buttons can be combined. Turn on one, two, or all three fields; a concept appears if any selected field matches. At least one field stays enabled. Search is case-insensitive and matches the text you enter; it is not a conversational or semantic search.',
    'Search works together with the current scope and filters. If something seems missing, check the active chips below the controls. Clear the search and remove constraints to return to all concepts.',
  ] },
  { id: 'sorting', section: 'Search & results', title: 'Sorting', keywords: 'sort order ordenar ordenacion ordenación alphabetical random', paragraphs: [
    'Open filter & sort below the search field to change the card order. Desktop shows the available choices inline; phones use the Sort menu. Sorting changes the order of your current results and keeps the search and filters in place.',
    'Most articles / fewest articles: order by the number of distinct public articles that link to the concept in their body. Repeated links from one article count once. Tags and unlinked words do not count. Fewest articles brings unused concepts first; ties are ordered by address.',
    'A–Z: alphabetical order by the full concept address, falling back to the title. Concepts from the same naming branch therefore stay together.',
    'Central: highest graph centrality first. This is a structural score, not a count of article mentions or a rating of note quality.',
    'Newest / oldest: order by the note’s date, not the date you last read it.',
    'Most links / fewest links: order by outgoing references plus incoming references. This measures Wiki connections, separately from article usage.',
    'Depth: shallowest addresses first. A root has depth 1, its child depth 2, and its grandchild depth 3.',
    'Shuffle: randomize the current results. Choose shuffle again to get a fresh order.',
  ] },
  { id: 'filters', section: 'Search & results', title: 'Filters & scope', keywords: 'filtros hubs leaf isolated bridges depth roots reset', paragraphs: [
    'Open filter & sort to reveal the controls. Closing this panel keeps its filters active. Constraints combine, so each result must satisfy every active filter. Remove individual chips below the controls, or use clear beside the collapsed panel to reset filters and scope while keeping the search.',
    'Scope limits results to one address branch, including the branch concept itself and its descendants. Type a path in the scope field or choose a directory root. Clear the scope to search all branches again.',
    'Articles < N keeps concepts linked by fewer than N distinct public articles. Set it to 1 to find concepts that no article links yet. Leave it empty for no article limit.',
    'Depth min / max restrict the levels in the naming hierarchy. Roots have depth 1. The infinity symbol means there is no upper limit. Hubs ≥ N keeps concepts with at least N incoming plus outgoing Wiki references.',
    'Isolated keeps concepts with no incoming or outgoing references. Leaf keeps concepts with no children in the naming hierarchy. A leaf can still have many references.',
    'Bridges keeps concepts whose removal would disconnect part of their graph component. Use this to explore structural connectors between groups of notes.',
    'The date calendar filters by a note’s date: select a day, then another day for a range. A word-count range can also be selected from the console histogram. Active date and word-count constraints appear as removable chips.',
  ] },
  { id: 'articles', section: 'Search & results', title: 'Article links & unvisited notes', keywords: 'articulos artículos visited blue purple unread', paragraphs: [
    'Article counts show how many distinct public articles link to a concept in their body. They measure where the idea is used across projects, essays, and Bits2Bricks, separately from connections between Wiki notes.',
    'Use most articles to start with concepts that appear often in articles. Use fewest articles or Articles < 1 to explore concepts that have not yet been used in an article.',
    'Once you have visited notes, the Unvisited control can hide opened cards. Visit history is kept for this browser tab’s session. This control affects the card list; it does not remove those concepts from the knowledge graph.',
  ] },
  { id: 'copy', section: 'Search & results', title: 'Copy for context', keywords: 'export clipboard LLM markdown copiar exportar', paragraphs: [
    'The clipboard beside the result count copies the current search and filter results as Markdown, including results beyond the cards currently loaded on screen. This is useful for collecting context for an LLM or your own notes.',
    'Meta copies compact note metadata and descriptions. Full also loads note bodies and annotated interactions, so larger selections can take a moment.',
    'Every bulk copy first shows a confirmation with the number of notes, the mode, the estimated size of the paste and, in full mode, the number of note files fetched. The dialog rates the load: a large paste can slow down or be truncated by the application you paste into, and a very large one can freeze it. Escape or Cancel closes it without copying.',
    'On a note page, Copy for context opens a selection dialog. Choose the current note and related groups such as parent, siblings, children, interactions, and backlinks, then copy the selected context.',
  ] },
  { id: 'navigation', section: 'Reading a note', title: 'Navigation & addresses', keywords: 'breadcrumb trail URL enlace ruta history', paragraphs: [
    'The breadcrumb trail records the concepts you followed. Select an earlier crumb to return to it, or all concepts to go back to the cards. Following links extends the trail; opening a grid card starts a new trail. Older steps collapse when space is limited.',
    'The address below the title shows the naming hierarchy. Available ancestors are clickable. The address describes where the idea sits in the tree, while the breadcrumb describes your reading path.',
    'Each concept has a readable URL that you can copy from the browser address bar. Old concept-ID links still resolve to the current address.',
  ] },
  { id: 'layout', section: 'Reading a note', title: 'Links, mentions & previews', keywords: 'page layout backlinks hover preview filtro', paragraphs: [
    'The title identifies the concept and the address locates it in the hierarchy. Names beneath the address are mentions: notes that link to this concept from their body. Select a name to read the referring note.',
    'Highlighted words in the note body link out to other concepts. Hoverable Wiki links can show a preview, so you can inspect a connection before navigating.',
    'The metadata separates outgoing links from incoming body mentions. Interactions appear in their own section and describe annotated relationships.',
    'When filters are active, in filter or outside filter tells you whether the open concept belongs to the current filtered set. You can still follow a connection outside that set.',
  ] },
  { id: 'interactions', section: 'Reading a note', title: 'Interactions', keywords: 'relationships relaciones annotations', paragraphs: [
    'Interactions are annotated relationships between concepts, shown below the note body when available. A body link points to a concept; an interaction also explains the connection, such as a dependency, a contrast, or an example.',
    'The annotation describes the relationship between the two ideas. It appears from both sides, so reading either concept can reveal the connection. Select the linked name to continue reading.',
  ] },
  { id: 'neighborhood', section: 'Reading a note', title: 'Neighborhood', keywords: 'family parent siblings children homonyms zonas familia', paragraphs: [
    'The neighborhood places the current note among its parent, siblings, and children in the address hierarchy. It is a family view, rather than a map of every reference in the note.',
    'Use filter by zone to narrow the related-note list to a family zone. The current note has its own highlighted bar; other names retain their visited or unvisited colors.',
    'Faint ghost indicators identify same-name concepts under another parent. These are separate concepts with different contexts, not duplicate links to the current note.',
  ] },
  { id: 'directory', section: 'Wiki Console', title: 'Directory', keywords: 'tree arbol árbol folders levels centrality', paragraphs: [
    'The directory follows the address hierarchy. For example, chip//MCU//ARM places ARM inside MCU inside chip. This describes how concepts are organized; reference links can connect notes across different branches.',
    'Click a concept name to open its note. Use the chevron to expand or collapse its children. Opening a note reveals its branch. Collapse all folds the tree again.',
    'Filter tree searches the directory. The root selector limits the current scope. The levels selector changes how much of the tree is displayed, without filtering the cards or graph.',
    'The directory’s own sort buttons order branches alphabetically, by descendant count, or by depth. They are separate from the card sorting controls.',
    'Small bars beside concepts show their centrality percentile. A longer bar means a higher structural rank within the Wiki, not a longer note or a larger article count. Active searches and filters can hide branches with no matching concepts.',
  ] },
  { id: 'statistics', section: 'Wiki Console', title: 'Graph statistics & word counts', keywords: 'stats density histogram estadisticas palabras', paragraphs: [
    'Graph statistics summarizes the whole Wiki: nodes counts concepts, links counts references, isolated counts concepts without references, avg refs gives the average references per concept, and depth gives the deepest address level.',
    'Density compares existing connections with the number of possible connections. These statistics describe the whole graph rather than the current card search.',
    'The compact console’s word-count histogram shows note lengths. Select a bar to constrain results to that word-count range; remove its chip above the cards to clear it. Other active searches and filters narrow the notes represented in the histogram.',
  ] },
  { id: 'graph', section: 'Graph workspace', title: 'Open & navigate the graph', keywords: 'expand zoom pan 2d 3d grafo mapa', paragraphs: [
    'The console mini graph gives a compact overview. Open the expanded graph for more space, or choose 3D. The /wiki/graph address opens this workspace directly. On phones it fills the screen; Close the graph returns to the console.',
    'In the mini graph, select a node to open its note. In the expanded graph, one click selects a node and its descendants; a second click on that node opens it. Right-click opens it directly. Click empty space to clear the selection.',
    'Use the expanded toolbar to switch 2D / 3D and Center graph to recover the overall view after moving around. Hover a node for its name and details.',
    'The hierarchy and references controls switch which relationships are displayed: parent-child address structure, or content references and interactions. Changing the view does not edit the notes.',
    'The mini graph’s Reset filters control clears the active search, filters, and scope. In the expanded graph the same Reset filters button sits beside Close, top right.',
  ] },
  { id: 'colors', section: 'Graph workspace', title: 'Graph colors & selection', keywords: 'colores centrality roots highlights purple lime', paragraphs: [
    'By default, graph nodes are colored by root family: the first part of their address. The expanded toolbar can switch to centrality colors, where lighter Wiki-accent tones mean higher centrality. Your color choice is remembered.',
    'Current search and filter results use periwinkle, a temporary preview (hovering a node or a directory entry) lights each node up brighter in its own colour, and a committed selection uses lime. The surrounding graph stays visible for context.',
    'Graph colors communicate family, structural rank, and selection. The blue visited-link convention belongs to note links and is a separate cue.',
  ] },
  { id: 'graph-tools', section: 'Graph workspace', title: 'Area selection & graph dynamics', keywords: 'physics simulation repulsion gravity damping density copiar area', paragraphs: [
    'In the expanded 2D view, Select area and copy notes lets you select a region for collecting note context; the same confirmation as the toolbar copy appears before the notes are fetched. Inspect local density helps examine a region of the graph. Center graph brings the overall view back into frame.',
    'Graph dynamics adjusts the layout: repulsion spreads nodes apart, edge length sets their preferred separation, edge attraction pulls linked nodes together, and clearance reduces overlap. Damping controls how quickly movement settles; center gravity pulls the layout toward the middle.',
    'These controls change the visual arrangement, not the notes, their links, or their centrality scores. Use reset defaults in graph dynamics to restore the initial layout settings.',
  ] },
  { id: 'mini-aids', section: 'Graph workspace', title: 'Mini graph: pins', keywords: 'pin pinned miniatura', paragraphs: [
    'Pins flag up to three notes with a numbered marker on both graphs. Pin a note from its card (the marker beside Copy for context) or from the expanded graph; the pin control on the mini graph shows or hides the markers. Pins, freeze and the node size are remembered in this browser.',
  ] },
  { id: 'expanded-aids', section: 'Graph workspace', title: 'Expanded graph: path, timeline, lenses, legend, image', keywords: 'shortest path route camino timeline date age lens orphans bridges cited articles legend map image png size degree length density radius freeze', paragraphs: [
    'Shortest path: click the route control, then a start note and an end note. While the end is not pinned, hovering any note previews the route from the start. The route is drawn in cyan over the edges currently shown, without opening a separate route panel. If there is no route, try the other edge mode.',
    'Node size can follow centrality, the number of connections, or the length of the note. Hover over % to set the density study radius in the slider on its right. Hover over the pin to show or hide the red markers, or clear all pins. Freeze stops layout movement; click it again to resume.',
    'The timeline shows the graph as it was on a date: drag the slider or play the sweep from the first note to the last. Age colours notes from cool (oldest) to warm (newest). Lenses single out orphans (no links), bridges (notes whose removal would split their component), notes cited by published articles (a thicker ring means more articles), or this session’s trail. Everything else recedes without disappearing.',
    'The legend (the map control) is open by default and explains node colours, edge types and every ring. The camera control asks whether to copy the graph alone or the graph with the open panels, as a PNG image. Hovering a directory entry marks its node in lime; clicking one selects the node without opening the note. Closing the graph keeps every mode and the camera for the next time it opens. Escape closes the most recent aid first.',
  ] },
];

const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const INDEX = TOPICS.map(topic => ({ topic, title: normalize(topic.title), text: normalize([topic.section, topic.title, topic.keywords, ...topic.paragraphs].join(' ')) }));
const SECTIONS = [...new Set(TOPICS.map(topic => topic.section))];

interface Props { isOpen: boolean; onClose: () => void }

export const SecondBrainGuide: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeId, setActiveId] = useState('overview');
  const [query, setQuery] = useState('');
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const active = TOPICS.find(topic => topic.id === activeId)!;
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const searching = terms.length > 0;
  const results = searching ? INDEX.filter(entry => terms.every(term => entry.text.includes(term)))
    .sort((a, b) => Number(terms.every(term => b.title.includes(term))) - Number(terms.every(term => a.title.includes(term))))
    .map(({ topic }) => {
      const paragraph = topic.paragraphs.findIndex(text => terms.every(term => normalize(text).includes(term)));
      return { topic, paragraph: Math.max(0, paragraph) };
    }) : [];

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setQuery('');
    setActiveId('overview');
    setParagraphIndex(0);
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (searching || !isOpen) return;
    const content = contentRef.current;
    const paragraph = content?.querySelectorAll('p')[paragraphIndex];
    if (content) content.scrollTop = paragraphIndex > 0 && paragraph ? paragraph.offsetTop - 16 : 0;
  }, [activeId, paragraphIndex, searching, isOpen]);

  const openTopic = (topic: Topic, paragraph = 0) => {
    setActiveId(topic.id);
    setParagraphIndex(paragraph);
    setQuery('');
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // The Wiki listens on window for typing, arrows and Enter. Keep modal keys local.
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      if (query) { setQuery(''); inputRef.current?.focus(); }
      else onClose();
    }
    if (event.key === 'Tab') {
      const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button, input, select, [tabindex="0"]') ?? [])]
        .filter(element => element.getClientRects().length && !element.hasAttribute('disabled'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement as HTMLElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="wiki-guide-title"
        className="relative flex flex-col w-full max-w-3xl h-[85dvh] md:h-[75vh] border border-violet-500/20 rounded-lg md:rounded-sm shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--hub-sidebar-bg)' }} onClick={event => event.stopPropagation()} onKeyDown={handleKeyDown}>
        <header className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-th-hub-border shrink-0">
          <h2 id="wiki-guide-title" className="text-sm font-semibold text-th-primary">How the Wiki works</h2>
          <button type="button" onClick={onClose} aria-label="Close Wiki guide" className="p-2 text-th-muted hover:text-th-primary"><CloseIcon /></button>
        </header>
        <form role="search" aria-label="Wiki guide" className="px-4 md:px-5 py-3 border-b border-th-hub-border shrink-0"
          onSubmit={event => { event.preventDefault(); if (results[0]) openTopic(results[0].topic, results[0].paragraph); }}>
          <label htmlFor="wiki-guide-search" className="block text-[10px] text-th-muted mb-1.5">Find an explanation</label>
          <div className="flex items-center gap-2 border border-th-hub-border bg-th-surface px-3 py-2 focus-within:border-violet-400">
            <span className="text-th-muted shrink-0"><SearchIcon /></span>
            <input ref={inputRef} id="wiki-guide-search" type="search" value={query} autoComplete="off" placeholder="Search help, e.g. sorting, articles, graph…"
              className="w-full min-w-0 bg-transparent text-th-primary text-xs outline-none placeholder:text-th-muted"
              onChange={event => setQuery(event.target.value)} onKeyDown={event => {
                if (event.key === 'ArrowDown' && results.length) { event.preventDefault(); resultsRef.current?.querySelector('button')?.focus(); }
              }} />
            {query && <button type="button" aria-label="Clear help search" className="text-th-muted hover:text-th-primary p-1" onClick={() => { setQuery(''); inputRef.current?.focus(); }}><CloseIcon /></button>}
          </div>
        </form>
        <div className="sr-only" role="status">{searching ? `${results.length} help topics found` : ''}</div>
        {searching ? <div ref={resultsRef} className="min-h-0 flex-1 overflow-y-auto hub-scrollbar px-4 md:px-5 py-4">
          <p className="text-[11px] text-th-muted mb-3">{results.length} {results.length === 1 ? 'topic' : 'topics'} found</p>
          {results.length ? <div className="space-y-6">{results.map(({ topic, paragraph }) => <button key={topic.id} type="button" onClick={() => openTopic(topic, paragraph)}
            className="group block w-full text-left py-1 focus-visible:outline focus-visible:outline-violet-400 focus-visible:outline-offset-4">
            <span className="block text-[10px] text-th-muted mb-1">{topic.section}</span>
            <span className="block text-sm text-violet-400 font-medium mb-1 group-hover:underline underline-offset-4">{topic.title}</span>
            <span className="block text-xs text-th-secondary leading-relaxed">{topic.paragraphs[paragraph]}</span>
          </button>)}</div> : <div className="text-sm text-th-secondary space-y-3">
            <p>No explanations match this search. Try fewer words, or a control name such as sorting, scope, or referenced by.</p>
            <button type="button" className="text-violet-400 underline" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>Browse all topics</button>
          </div>}
        </div> : <div className="flex flex-col md:flex-row min-h-0 flex-1">
          <div className="md:hidden px-4 py-3 border-b border-th-hub-border shrink-0">
            <label htmlFor="wiki-guide-topic" className="sr-only">Browse help topics</label>
            <select id="wiki-guide-topic" value={activeId} onChange={event => openTopic(TOPICS.find(topic => topic.id === event.target.value)!)}
              className="w-full bg-th-surface border border-th-hub-border text-th-primary text-xs px-2 py-2">
              {SECTIONS.map(section => <optgroup key={section} label={section}>{TOPICS.filter(topic => topic.section === section).map(topic => <option key={topic.id} value={topic.id}>{topic.title}</option>)}</optgroup>)}
            </select>
          </div>
          <nav aria-label="Help topics" className="hidden md:block w-48 shrink-0 overflow-y-auto hub-scrollbar border-r border-th-hub-border py-3">
            {SECTIONS.map(section => <div key={section} className="mb-3">
              <h3 className="px-4 mb-1 text-[10px] font-medium text-th-muted">{section}</h3>
              {TOPICS.filter(topic => topic.section === section).map(topic => <button key={topic.id} type="button" aria-current={activeId === topic.id ? 'true' : undefined} onClick={() => openTopic(topic)}
                className={`block w-full text-left px-4 py-1.5 text-[11px] border-l-2 ${activeId === topic.id ? 'border-violet-400 text-violet-400 bg-violet-400/5' : 'border-transparent text-th-secondary hover:text-th-primary'}`}>{topic.title}</button>)}
            </div>)}
          </nav>
          <section className="flex flex-col min-w-0 min-h-0 flex-1" aria-labelledby="wiki-guide-topic-title">
            <div className="px-4 md:px-5 py-3 border-b border-th-hub-border shrink-0">
              <p className="text-[10px] text-th-muted mb-1">{active.section}</p>
              <h3 ref={headingRef} tabIndex={-1} id="wiki-guide-topic-title" className="text-sm font-semibold text-th-primary outline-none">{active.title}</h3>
            </div>
            <div ref={contentRef} className="relative min-h-0 flex-1 overflow-y-auto hub-scrollbar px-4 md:px-5 py-4 text-xs text-th-secondary leading-relaxed space-y-3">
              {active.paragraphs.map((paragraph, index) => {
                const colon = paragraph.indexOf(':');
                return <p key={paragraph} className={index === paragraphIndex && paragraphIndex > 0 ? 'border-l-2 border-violet-400 pl-3' : undefined}>
                  {colon > 0 && colon < 50 ? <><strong className="text-th-primary">{paragraph.slice(0, colon + 1)}</strong>{paragraph.slice(colon + 1)}</> : paragraph}
                </p>;
              })}
            </div>
          </section>
        </div>}
      </div>
    </div>, document.body,
  );
};
