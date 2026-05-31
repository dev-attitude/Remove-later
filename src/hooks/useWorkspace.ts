"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteWorkspaceItem,
  getActiveWorkspaceId,
  getWorkspaceItem,
  listWorkspaceItems,
  saveWorkspaceItem,
  setActiveWorkspaceId,
  type WorkspaceItem,
} from "@/lib/client/workspace-storage";

export type UseWorkspaceOptions<
  TForm extends Record<string, unknown>,
  TResult = unknown,
> = {
  portalId: string;
  moduleId: string;
  defaultForm: TForm;
  makeTitle: (form: TForm, result: TResult | null) => string;
  debounceMs?: number;
};

export function useWorkspace<TForm extends Record<string, unknown>, TResult = unknown>(
  options: UseWorkspaceOptions<TForm, TResult>
) {
  const { portalId, moduleId, defaultForm, makeTitle, debounceMs = 600 } = options;

  const [hydrated, setHydrated] = useState(false);
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setFormState] = useState<TForm>(defaultForm);
  const [result, setResultState] = useState<TResult | null>(null);

  const formRef = useRef(form);
  const resultRef = useRef(result);
  formRef.current = form;
  resultRef.current = result;

  const refreshList = useCallback(() => {
    setItems(listWorkspaceItems(portalId, moduleId));
  }, [portalId, moduleId]);

  useEffect(() => {
    refreshList();
    const active = getActiveWorkspaceId(portalId, moduleId);
    const list = listWorkspaceItems(portalId, moduleId);
    const restore = (active ? getWorkspaceItem(active) : null) ?? list[0];
    if (restore) {
      setActiveId(restore.id);
      setFormState(restore.form as TForm);
      setResultState((restore.result as TResult) ?? null);
    }
    setHydrated(true);
  }, [portalId, moduleId, refreshList]);

  const persistDraft = useCallback(
    (formData: TForm, resultData: TResult | null, id?: string | null) => {
      const title = makeTitle(formData, resultData);
      const hasContent =
        title !== "New draft" &&
        title !== "Untitled" &&
        Object.values(formData).some((v) => String(v ?? "").trim().length > 0);

      if (!hasContent && !resultData) return;

      const newId = saveWorkspaceItem({
        id: id ?? activeId ?? undefined,
        portalId,
        moduleId,
        title,
        form: formData as Record<string, unknown>,
        result: resultData,
      });
      setActiveId(newId);
      refreshList();
    },
    [portalId, moduleId, makeTitle, activeId, refreshList]
  );

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      persistDraft(formRef.current, resultRef.current, activeId);
    }, debounceMs);
    return () => clearTimeout(t);
  }, [form, result, hydrated, debounceMs, persistDraft, activeId]);

  const setForm = useCallback((patch: Partial<TForm> | ((prev: TForm) => TForm)) => {
    setFormState((prev) => {
      if (typeof patch === "function") return patch(prev);
      return { ...prev, ...patch };
    });
  }, []);

  const setResult = useCallback(
    (value: TResult | null) => {
      setResultState(value);
      if (value !== null) {
        persistDraft(formRef.current, value, activeId);
      }
    },
    [activeId, persistDraft]
  );

  const loadItem = useCallback(
    (id: string) => {
      const item = getWorkspaceItem(id);
      if (!item) return;
      setActiveWorkspaceId(portalId, moduleId, id);
      setActiveId(id);
      setFormState(item.form as TForm);
      setResultState((item.result as TResult) ?? null);
    },
    [portalId, moduleId]
  );

  const removeItem = useCallback(
    (id: string) => {
      deleteWorkspaceItem(id);
      refreshList();
      if (activeId === id) {
        setActiveWorkspaceId(portalId, moduleId, null);
        setActiveId(null);
        setFormState(defaultForm);
        setResultState(null);
      }
    },
    [activeId, portalId, moduleId, defaultForm, refreshList]
  );

  const startNew = useCallback(() => {
    setActiveWorkspaceId(portalId, moduleId, null);
    setActiveId(null);
    setFormState(defaultForm);
    setResultState(null);
  }, [portalId, moduleId, defaultForm]);

  return {
    hydrated,
    items,
    activeId,
    form,
    setForm,
    setFormState,
    result,
    setResult,
    loadItem,
    removeItem,
    startNew,
    refreshList,
  };
}
