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
  "index.css"

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

  # --- Lib / Utilities ---
  "src/lib/index.ts"
  "src/lib/content.ts"
  "src/lib/date.ts"
  "src/lib/addressToId.ts"
  "src/lib/brainIndex.ts"
  "src/lib/wikilinks.ts"
  "src/lib/color.ts"
  "src/lib/search.ts"
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

  # --- Components: Sections ---
  "src/components/sections/index.ts"
  "src/components/sections/SearchResultsList.tsx"
  "src/components/sections/ProjectsList.tsx"
  "src/components/sections/ThreadsList.tsx"
  "src/components/sections/Bits2BricksGrid.tsx"

  # --- Components: Standalone ---
  "src/components/ErrorBoundary.tsx"
  "src/components/App.tsx"
  "src/components/SearchPalette.tsx"
  "src/components/NavigationTrail.tsx"
  "src/components/NeighborhoodGraph.tsx"
  "src/components/HomeTour.tsx"
  "src/components/RotatingTitle.tsx"
  "src/components/WikiContent.tsx"
  "src/components/WikiLinkPreview.tsx"
  "src/components/icons/index.tsx"

  # --- Views ---
  "src/views/index.ts"
  "src/views/HomeView.tsx"
  "src/views/AboutView.tsx"
  "src/views/ContactView.tsx"
  "src/views/ThanksView.tsx"
  "src/views/SectionView.tsx"
  "src/views/PostView.tsx"
  "src/views/ArticlePostView.tsx"
  "src/views/SecondBrainView.tsx"

  # --- Styles ---
  "src/styles/article.css"
  "src/styles/wiki-content.css"

  # --- Build scripts ---
  "scripts/build-content.js"
  "scripts/compiler.config.js"
  "scripts/validate-fieldnotes.js"
  "scripts/rename-address.js"
  "scripts/check-references.js"
  "scripts/README.md"
  "src/data/pages/fieldnotes/README.md"

  # --- Contenido representativo (1 por categoría + 1 fieldnote, para mostrar frontmatter) ---
  "src/data/pages/threads/anatomy-of-a-markdown-compiler.md"
  "src/data/pages/bits2bricks/custom-syntax-pcb.md"
  "src/data/pages/fieldnotes/CPU_ALU.md"
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
