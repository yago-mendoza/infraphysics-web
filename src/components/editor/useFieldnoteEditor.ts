// Hook for managing the fieldnote editing lifecycle:
// fetch raw → edit → validate (debounced) → save → HMR refresh

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { parseFrontmatter, parseTrailingRefs } from '../../lib/content/fieldnote-parser.js';
import type { ConnectionRef } from '../../types';

export interface Diagnostic {
  source: string;   // PARSE, VALIDATE, SAVE, BUILD, SUGGEST
  severity: string; // ERROR, WARN, INFO
  message: string;
  actions?: Array<{ label: string; style: 'accept' | 'dismiss'; onAction: () => void }>;
}

export interface EditorState {
  isEditing: boolean;
  editingUid: string | null;
  rawContent: string;
  setRawContent: (raw: string) => void;
  diagnostics: Diagnostic[];
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  isDirty: boolean;
  liveTrailingRefs: ConnectionRef[];
  openEditor: (uid: string) => Promise<void>;
  closeEditor: () => void;
  save: () => Promise<void>;
}

export function useFieldnoteEditor(): EditorState {
  const [isEditing, setIsEditing] = useState(false);
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [rawContent, setRawContentState] = useState('');
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isDirty, setIsDirty] = useState(false);

  const originalContent = useRef('');
  const validateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setRawContent = useCallback((raw: string) => {
    // Protect uid — restore original if user modifies it
    // Strip YAML quotes — some notes have `uid: "X"` vs `uid: X`
    const uidFromRaw = raw.match(/^uid:\s*(.+)$/m)?.[1]?.trim().replace(/^["'](.*)["']$/, '$1');
    const uidModified = editingUid && uidFromRaw && uidFromRaw !== editingUid;

    setRawContentState(raw);
    setIsDirty(raw !== originalContent.current);
    setSaveStatus('idle');

    // Debounced validation
    if (validateTimer.current) clearTimeout(validateTimer.current);
    validateTimer.current = setTimeout(async () => {
      try {
        const resp = await fetch('/api/fieldnotes/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw }),
        });
        if (resp.ok) {
          const { issues } = await resp.json();
          const allIssues = [...issues];
          if (uidModified) {
            allIssues.unshift({ source: 'VALIDATE', severity: 'ERROR', message: `uid is read-only — will be restored to ${editingUid} on save` });
          }
          setDiagnostics(allIssues);
        }
      } catch {
        // Validation failed silently — don't block editing
        if (uidModified) {
          setDiagnostics([{ source: 'VALIDATE', severity: 'ERROR', message: `uid is read-only — will be restored to ${editingUid} on save` }]);
        }
      }
    }, 300);
  }, [editingUid]);

  const openEditor = useCallback(async (uid: string) => {
    try {
      const resp = await fetch(`/api/fieldnotes/${uid}/raw`);
      if (!resp.ok) throw new Error('Failed to fetch');
      const { raw } = await resp.json();
      // Normalize CRLF → LF to match CodeMirror's internal representation
      const normalized = raw.replace(/\r\n/g, '\n');
      originalContent.current = normalized;
      setRawContentState(normalized);
      setEditingUid(uid);
      setIsEditing(true);
      setDiagnostics([]);
      setIsDirty(false);
      setSaveStatus('idle');
    } catch (err) {
      console.error('Failed to open editor:', err);
    }
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditing(false);
    setEditingUid(null);
    setRawContentState('');
    setDiagnostics([]);
    setIsDirty(false);
    setSaveStatus('idle');
    if (validateTimer.current) clearTimeout(validateTimer.current);
    if (savedTimer.current) clearTimeout(savedTimer.current);
  }, []);

  const save = useCallback(async () => {
    if (!editingUid || !isDirty) return;
    setSaveStatus('saving');
    try {
      // Always restore original uid before saving
      const safeRaw = rawContent.replace(
        /^uid:\s*.+$/m,
        `uid: ${editingUid}`,
      );
      const resp = await fetch('/api/fieldnotes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: editingUid, raw: safeRaw }),
      });
      if (!resp.ok) throw new Error('Save failed');
      const result = await resp.json();

      originalContent.current = rawContent;
      setIsDirty(false);

      if (result.diagnostics) {
        setDiagnostics(result.diagnostics);
      }

      setSaveStatus('saved');
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  }, [editingUid, isDirty, rawContent]);

  // Live trailing refs parsed from raw content — for real-time preview on left side
  const liveTrailingRefs = useMemo((): ConnectionRef[] => {
    if (!rawContent || !isEditing) return [];
    const parsed = parseFrontmatter(rawContent);
    if (!parsed) return [];
    const { trailingRefs } = parseTrailingRefs(parsed.body);
    return trailingRefs;
  }, [rawContent, isEditing]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (validateTimer.current) clearTimeout(validateTimer.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  return {
    isEditing,
    editingUid,
    rawContent,
    setRawContent,
    diagnostics,
    saveStatus,
    isDirty,
    liveTrailingRefs,
    openEditor,
    closeEditor,
    save,
  };
}
