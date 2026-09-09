#!/usr/bin/env bash
# dump-context.sh — Compacta todos los archivos relevantes del proyecto
# en un solo archivo de texto plano para pasar a un LLM.
#
# Uso: bash scripts/dump-context.sh [archivo_salida]
# Default: context-dump.txt en la raíz del proyecto

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT="${1:-$ROOT/context-dump.txt}"

# ── Archivos a incluir (en orden lógico) ─────────────────────────────

FILES=(
  # --- Guía de desarrollo ---
  "CLAUDE.md"

  # --- Config raíz ---
  "package.json"
  "tsconfig.json"
  "vite.config.ts"

  # --- HTML + CSS global ---
  "index.html"
  "src/styles/global.css"

  # --- Entry point ---
  "src/index.tsx"

  # --- Types ---
  "src/types.ts"

  # --- Constants ---
  "src/constants/index.ts"
  "src/constants/theme.ts"
  "src/constants/layout.ts"

  # --- Config ---
  "src/config/index.ts"
  "src/config/categories.tsx"

  # --- Contexts ---
  "src/contexts/ThemeContext.tsx"
  "src/contexts/ArticleContext.tsx"
  "src/contexts/SecondBrainHubContext.tsx"

  # --- Hooks ---
  "src/hooks/index.ts"
  "src/hooks/useKeyboardShortcuts.ts"
  "src/hooks/useNavigationTrail.ts"
  "src/hooks/useSecondBrainHub.ts"
  "src/hooks/useViewCount.ts"
  "src/hooks/useReaction.ts"
  "src/hooks/useArticleStats.ts"

  # --- Lib / Utilities ---
  "src/lib/index.ts"
  "src/lib/content.ts"
  "src/lib/date.ts"
  "src/lib/addressToId.ts"
  "src/lib/brainIndex.ts"
  "src/lib/exportNotes.ts"
  "src/lib/wikilinks.ts"
  "src/lib/color.ts"
  "src/lib/search.ts"
  "src/lib/cdn.ts"
  "src/lib/headings.ts"
  "src/lib/icons.ts"

  # --- Data ---
  "src/data/data.ts"

  # --- Components: Layout ---
  "src/components/layout/index.ts"
  "src/components/layout/Sidebar.tsx"
  "src/components/layout/MobileNav.tsx"
  "src/components/layout/Footer.tsx"
  "src/components/layout/DualGrid.tsx"
  "src/components/layout/Starfield.tsx"
  "src/components/layout/SecondBrainSidebar.tsx"

  # --- Components: UI ---
  "src/components/ui/index.ts"
  "src/components/ui/Highlight.tsx"
  "src/components/ui/StatusBadge.tsx"

  # --- Components: Article ---
  "src/components/article/ArticleBreadcrumbs.tsx"
  "src/components/article/ArticleHashtags.tsx"
  "src/components/article/BlogMetabar.tsx"

  # --- Components: Sections ---
  "src/components/sections/index.ts"
  "src/components/sections/SearchResultsList.tsx"
  "src/components/sections/ProjectsList.tsx"
  "src/components/sections/EssaysList.tsx"
  "src/components/sections/Bits2BricksGrid.tsx"

  # --- Components: Standalone ---
  "src/components/ErrorBoundary.tsx"
  "src/components/App.tsx"
  "src/components/SearchPalette.tsx"
  "src/components/wiki/NavigationTrail.tsx"
  "src/components/wiki/NeighborhoodGraph.tsx"
  "src/components/wiki/RelevanceLeaderboard.tsx"
  "src/components/wiki/WikiContent.tsx"
  "src/components/wiki/WikiLinkPreview.tsx"
  "src/components/wiki/CopyExportModal.tsx"
  "src/components/wiki/CopyConfirmModal.tsx"
  "src/components/icons/index.tsx"

  # --- Views ---
  "src/views/index.ts"
  "src/views/HomeView.tsx"
  "src/components/personal/WikiTerritories.tsx"
  "src/lib/partitionAreas.ts"
  "src/views/AboutView.tsx"
  "src/views/ContactView.tsx"
  "src/views/ThanksView.tsx"
  "src/views/ErrorConceptView.tsx"
  "src/views/LinkedFromTestView.tsx"
  "src/styles/error-concepts.css"
  "src/views/SectionView.tsx"
  "src/views/PostView.tsx"
  "src/views/ContextPreviewView.tsx"
  "src/styles/context-preview.css"
  "src/views/ArticlePostView.tsx"
  # "src/styles/project-page.css"
  "src/views/SecondBrainView.tsx"
  "src/lib/wikiArticleUsage.ts"
  "src/views/SecondBrainGraphView.tsx"
  "src/components/graph/useGraphData.ts"
  "src/components/graph/GraphControls.tsx"

  # --- Styles ---
  "src/styles/article.css"
  "src/styles/wiki-content.css"

  # --- Build scripts ---
  "scripts/build-content.js"
  "scripts/compiler.config.js"
  # "scripts/media.js"
  "scripts/validate-wikinotes.js"
  "scripts/resolve-issues.js"
  "scripts/rename-address.js"
  "scripts/content-files.js"
  "scripts/rename-content-slug.js"
  "scripts/CONTENT-URLS.md"
  "src/lib/content/routes.js"
  "src/lib/contentRoutes.ts"
  "scripts/check-references.js"
  "scripts/analyze-pairs.js"
  "scripts/preflight.js"
  "scripts/move-hierarchy.js"
  "scripts/obsidian-export.js"
  "scripts/obsidian-import.js"
  "scripts/README.md"
  "src/data/pages/wikinotes/README.md"

  # --- Contenido representativo (1 por categoría + 1 wikinote, para mostrar frontmatter) ---
  "src/data/pages/essays/why-rust-exists.md"
  "src/data/pages/bits2bricks/transformers-from-scratch.md"
  # Wikinote files are named <slug>.md — pick a representative one
  # ls src/data/pages/wikinotes/ for current filenames
  # "src/data/pages/wikinotes/alu.md"  # Hardware//CPU//ALU
)

# ── Recopilar stats ───────────────────────────────────────────────────

TOTAL_FILES=0
TOTAL_LINES=0
TOTAL_CHARS=0

declare -a STATS_NAME=()
declare -a STATS_CHARS=()

for relpath in "${FILES[@]}"; do
  filepath="$ROOT/$relpath"
  if [[ ! -f "$filepath" ]]; then
    STATS_NAME+=("$relpath")
    STATS_CHARS+=("MISSING")
    continue
  fi

  chars=$(wc -c < "$filepath")
  lines=$(wc -l < "$filepath")
  TOTAL_LINES=$((TOTAL_LINES + lines))
  TOTAL_CHARS=$((TOTAL_CHARS + chars))
  TOTAL_FILES=$((TOTAL_FILES + 1))

  STATS_NAME+=("$relpath")
  STATS_CHARS+=("$chars")
done

# ── Generar dump ──────────────────────────────────────────────────────

> "$OUTPUT"   # Vaciar/crear archivo

{
  echo "================================================================"
  echo " INFRAPHYSICS-WEB — Context Dump"
  echo " Generated: $(date '+%Y-%m-%d %H:%M:%S')"
  echo " Files: $TOTAL_FILES  |  Lines: $TOTAL_LINES  |  Chars: $TOTAL_CHARS"
  echo "================================================================"
  echo ""
  echo "── File sizes (chars) ──────────────────────────────────────────"
  echo ""

  # Find longest filename for alignment
  max_name=0
  for name in "${STATS_NAME[@]}"; do
    (( ${#name} > max_name )) && max_name=${#name}
  done

  for i in "${!STATS_NAME[@]}"; do
    if [[ "${STATS_CHARS[$i]}" == "MISSING" ]]; then
      printf "  %-${max_name}s  %s\n" "${STATS_NAME[$i]}" "[MISSING]"
    else
      printf "  %-${max_name}s  %'6d chars\n" "${STATS_NAME[$i]}" "${STATS_CHARS[$i]}"
    fi
  done

  echo ""

  for relpath in "${FILES[@]}"; do
    filepath="$ROOT/$relpath"

    if [[ ! -f "$filepath" ]]; then
      echo "# [MISSING] $relpath"
      echo ""
      continue
    fi

    lines=$(wc -l < "$filepath")

    echo "================================================================"
    echo "# FILE: $relpath  ($lines lines)"
    echo "================================================================"
    cat "$filepath"
    echo ""
    echo ""
  done

  echo "================================================================"
  echo " END — $TOTAL_FILES files, $TOTAL_LINES total lines"
  echo "================================================================"

} >> "$OUTPUT"

# ── Resumen en consola ────────────────────────────────────────────────

SIZE=$(wc -c < "$OUTPUT")
SIZE_KB=$((SIZE / 1024))

echo "Done! $TOTAL_FILES files, $TOTAL_LINES lines, ${SIZE_KB}KB"
echo "Output: $OUTPUT"
