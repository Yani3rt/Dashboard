import { DataProvider } from "@/lib/data/provider";
import { AppState } from "@/lib/domain/models";

const STORAGE_KEY = "dashboard.v1.state";
export const SCHEMA_VERSION = 1;

const defaultState: AppState = {
  tasks: [],
  habits: [],
  notes: [],
  theme: "dark",
};

interface PersistedState {
  version: number;
  state: AppState;
}

const normalizeState = (raw: AppState): AppState => ({
  ...raw,
  notes: raw.notes.map((note, index) => ({
    ...note,
    tags: Array.isArray(note.tags) ? note.tags : [],
    order: typeof note.order === "number" ? note.order : index,
  })),
});

const parseState = (raw: string | null): AppState => {
  if (!raw) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== SCHEMA_VERSION || !parsed.state) {
      return defaultState;
    }
    return normalizeState({
      ...defaultState,
      ...parsed.state,
    });
  } catch {
    return defaultState;
  }
};

const read = (): AppState => {
  if (typeof window === "undefined") {
    return defaultState;
  }
  return parseState(window.localStorage.getItem(STORAGE_KEY));
};

const write = (state: AppState): void => {
  if (typeof window === "undefined") {
    return;
  }

  const payload: PersistedState = {
    version: SCHEMA_VERSION,
    state,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const localProvider: DataProvider = {
  async fetch() {
    return read();
  },
  async sync(next) {
    write(next);
  },
  async health() {
    return { ok: true, provider: "local" };
  },
};

export const clearLocalState = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};

export const getDefaultState = (): AppState => defaultState;
export const getStorageKey = (): string => STORAGE_KEY;
