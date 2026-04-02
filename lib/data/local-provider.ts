import { DataProvider } from "@/lib/data/provider";
import { AppState, Habit } from "@/lib/domain/models";
import { normalizeHabitMeta } from "@/lib/domain/habit-meta";

const STORAGE_KEY = "dashboard.v1.state";
export const SCHEMA_VERSION = 2;

const defaultState: AppState = {
  tasks: [],
  habits: [],
  notes: [],
  theme: "dark",
  schoolDays: [],
};

interface PersistedState {
  version: number;
  state: AppState;
}

const normalizeHabit = (habit: Habit): Habit => {
  const meta = normalizeHabitMeta({ id: habit.id, iconKey: habit.iconKey, colorKey: habit.colorKey });
  return {
    ...habit,
    ...meta,
  };
};

const normalizeState = (raw: AppState): AppState => ({
  ...raw,
  habits: raw.habits.map((habit) => normalizeHabit(habit as Habit)),
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
    if (!parsed.state || typeof parsed.version !== "number" || parsed.version > SCHEMA_VERSION) {
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
