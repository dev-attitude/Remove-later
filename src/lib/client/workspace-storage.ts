/** Browser-local persistence so work survives navigation and refresh */

const STORAGE_KEY = "gm-research-workspace-v1";
const MAX_PER_MODULE = 40;
const MAX_TOTAL = 200;

export type WorkspaceItem = {
  id: string;
  portalId: string;
  moduleId: string;
  title: string;
  form: Record<string, unknown>;
  result: unknown | null;
  createdAt: number;
  updatedAt: number;
};

type WorkspaceStore = {
  items: WorkspaceItem[];
  activeId: Record<string, string>;
};

function moduleKey(portalId: string, moduleId: string) {
  return `${portalId}:${moduleId}`;
}

function readStore(): WorkspaceStore {
  if (typeof window === "undefined") {
    return { items: [], activeId: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], activeId: {} };
    const parsed = JSON.parse(raw) as WorkspaceStore;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      activeId: parsed.activeId ?? {},
    };
  } catch {
    return { items: [], activeId: {} };
  }
}

function writeStore(store: WorkspaceStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn("[workspace] save failed", e);
  }
}

function newId() {
  return `ws_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function listWorkspaceItems(portalId: string, moduleId: string): WorkspaceItem[] {
  return readStore()
    .items.filter((i) => i.portalId === portalId && i.moduleId === moduleId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getWorkspaceItem(id: string): WorkspaceItem | undefined {
  return readStore().items.find((i) => i.id === id);
}

export function getActiveWorkspaceId(portalId: string, moduleId: string): string | null {
  const key = moduleKey(portalId, moduleId);
  return readStore().activeId[key] ?? null;
}

export function setActiveWorkspaceId(
  portalId: string,
  moduleId: string,
  id: string | null
) {
  const store = readStore();
  const key = moduleKey(portalId, moduleId);
  if (id) store.activeId[key] = id;
  else delete store.activeId[key];
  writeStore(store);
}

export function saveWorkspaceItem(input: {
  portalId: string;
  moduleId: string;
  title: string;
  form: Record<string, unknown>;
  result: unknown | null;
  id?: string;
}): string {
  const store = readStore();
  const now = Date.now();
  const id = input.id ?? newId();
  const existing = store.items.findIndex((i) => i.id === id);
  const item: WorkspaceItem = {
    id,
    portalId: input.portalId,
    moduleId: input.moduleId,
    title: input.title.slice(0, 120) || "Untitled",
    form: input.form,
    result: input.result,
    createdAt: existing >= 0 ? store.items[existing].createdAt : now,
    updatedAt: now,
  };

  if (existing >= 0) store.items[existing] = item;
  else store.items.unshift(item);

  const sameModule = store.items.filter(
    (i) => i.portalId === input.portalId && i.moduleId === input.moduleId
  );
  if (sameModule.length > MAX_PER_MODULE) {
    const drop = sameModule.slice(MAX_PER_MODULE).map((i) => i.id);
    store.items = store.items.filter((i) => !drop.includes(i.id));
  }

  if (store.items.length > MAX_TOTAL) {
    store.items = store.items
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_TOTAL);
  }

  store.activeId[moduleKey(input.portalId, input.moduleId)] = id;
  writeStore(store);
  return id;
}

export function deleteWorkspaceItem(id: string) {
  const store = readStore();
  const item = store.items.find((i) => i.id === id);
  store.items = store.items.filter((i) => i.id !== id);
  if (item) {
    const key = moduleKey(item.portalId, item.moduleId);
    if (store.activeId[key] === id) delete store.activeId[key];
  }
  writeStore(store);
}

export function formatWorkspaceDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
