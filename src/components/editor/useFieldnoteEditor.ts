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

export interface DeleteAnalysis {
  noteAddress: string;
  noteName: string;
  bodyRefs: Array<{ uid: string; address: string; name: string; filename: string }>;
  trailingRefs: Array<{ uid: string; address: string; name: string; filename: string; annotation: string }>;
  children: Array<{ uid: string; address: string; name: string }>;
  ownTrailingRefs: Array<{ uid: string; address: string; name: string; annotation: string }>;
  isReferenced: boolean;
  isParent: boolean;
  totalImpact: number;
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
  deleteStatus: 'idle' | 'analyzing' | 'confirming' | 'confirming-permanent' | 'deleting' | 'deleted' | 'stubbing' | 'error';
  deleteAnalysis: DeleteAnalysis | null;
  deleteError: string | null;
  analyzeForDelete: () => Promise<void>;
  confirmDelete: (cleanupTrailingRefs: boolean, trailingRefUids: string[], unlinkBodyRefs: boolean) => Promise<void>;
  convertToStub: () => Promise<void>;
  enterPermanentDelete: () => void;
  backToOverview: () => void;
  cancelDelete: () => void;
}

export function useFieldnoteEditor(): EditorState {
  const [isEditing, setIsEditing] = useState(false);
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [rawContent, setRawContentState] = useState('');
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isDirty, setIsDirty] = useState(false);

  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'analyzing' | 'confirming' | 'confirming-permanent' | 'deleting' | 'deleted' | 'stubbing' | 'error'>('idle');
  const [deleteAnalysis, setDeleteAnalysis] = useState<DeleteAnalysis | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    // Set editing state immediately — prevents flash when switching notes
    setEditingUid(uid);
    setIsEditing(true);
    setDiagnostics([]);
    setIsDirty(false);
    setSaveStatus('idle');
    setDeleteStatus('idle');
    setDeleteAnalysis(null);
    setDeleteError(null);
    try {
      const resp = await fetch(`/api/fieldnotes/${uid}/raw`);
      if (!resp.ok) throw new Error('Failed to fetch');
      const { raw } = await resp.json();
      // Normalize CRLF → LF to match CodeMirror's internal representation
      const normalized = raw.replace(/\r\n/g, '\n');
      originalContent.current = normalized;
      setRawContentState(normalized);
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
    setDeleteStatus('idle');
    setDeleteAnalysis(null);
    setDeleteError(null);
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

  const analyzeForDelete = useCallback(async () => {
    if (!editingUid) return;
    setDeleteStatus('analyzing');
    setDeleteError(null);
    try {
      const resp = await fetch('/api/fieldnotes/analyze-refs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: editingUid }),
      });
      if (!resp.ok) throw new Error('Analysis failed');
      const analysis = await resp.json();
      setDeleteAnalysis(analysis);
      setDeleteStatus('confirming');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Analysis failed');
      setDeleteStatus('error');
    }
  }, [editingUid]);

  const confirmDelete = useCallback(async (cleanupTrailingRefs: boolean, trailingRefUids: string[], unlinkBodyRefs: boolean) => {
    if (!editingUid) return;
    setDeleteStatus('deleting');
    try {
      const resp = await fetch('/api/fieldnotes/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: editingUid, cleanupTrailingRefs, trailingRefUids, unlinkBodyRefs }),
      });
      if (!resp.ok) throw new Error('Delete failed');
      setDeleteStatus('deleted');
      // Clear dirty flag so auto-save-on-switch doesn't try to save the deleted file
      setIsDirty(false);
      // Close editor immediately — HMR handler navigates away separately
      setIsEditing(false);
      setEditingUid(null);
      setRawContentState('');
      setDiagnostics([]);
      if (validateTimer.current) clearTimeout(validateTimer.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
      setDeleteStatus('error');
    }
  }, [editingUid]);

  const convertToStub = useCallback(async () => {
    if (!editingUid) return;
    setDeleteStatus('stubbing');
    try {
      const resp = await fetch('/api/fieldnotes/convert-to-stub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: editingUid }),
      });
      if (!resp.ok) throw new Error('Stub conversion failed');
      // Re-fetch the note's raw content (it changed on disk)
      const rawResp = await fetch(`/api/fieldnotes/${editingUid}/raw`);
      if (rawResp.ok) {
        const { raw } = await rawResp.json();
        const normalized = raw.replace(/\r\n/g, '\n');
        originalContent.current = normalized;
        setRawContentState(normalized);
        setIsDirty(false);
      }
      setDeleteStatus('idle');
      setDeleteAnalysis(null);
      setDeleteError(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Stub conversion failed');
      setDeleteStatus('error');
    }
  }, [editingUid]);

  const enterPermanentDelete = useCallback(() => {
    setDeleteStatus('confirming-permanent');
  }, []);

  const backToOverview = useCallback(() => {
    setDeleteStatus('confirming');
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteStatus('idle');
    setDeleteAnalysis(null);
    setDeleteError(null);
  }, []);

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
    deleteStatus,
    deleteAnalysis,
    deleteError,
    analyzeForDelete,
    confirmDelete,
    convertToStub,
    enterPermanentDelete,
    backToOverview,
    cancelDelete,
  };
}
