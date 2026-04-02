"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { calculateStreak } from "@/lib/domain/habits";
import { todayKey, tomorrowKey } from "@/lib/domain/date";
import {
  AppState,
  BackupPayload,
  HabitColorKey,
  HabitIconKey,
  Habit,
  HabitEntry,
  Note,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/lib/domain/models";
import { normalizeHabitMeta } from "@/lib/domain/habit-meta";
import {
  clearLocalState,
  getDefaultState,
  localProvider,
  SCHEMA_VERSION,
} from "@/lib/data/local-provider";
import { makeId } from "@/lib/utils/id";

type DashboardContextValue = {
  state: AppState;
  hydrated: boolean;
  hydrationError: string | null;
  addTask: (input: {
    title: string;
    priority?: TaskPriority;
    dueDate?: string;
    tags?: string[];
  }) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  snoozeTask: (taskId: string) => void;
  pinTask: (taskId: string) => void;
  addHabit: (input: { name: string; iconKey: HabitIconKey; colorKey: HabitColorKey }) => void;
  toggleHabitForToday: (habitId: string) => void;
  addSchoolDays: (dates: Date[]) => void;
  removeSchoolDays: (dates: Date[]) => void;
  addNote: (content: string, title?: string, tags?: string[]) => void;
  updateNote: (noteId: string, input: { title?: string; content: string; tags?: string[] }) => void;
  deleteNote: (noteId: string) => void;
  reorderNotes: (sourceNoteId: string, targetNoteId: string, scopeNoteIds: string[]) => void;
  pinNote: (noteId: string) => void;
  setTheme: (theme: "dark" | "light") => void;
  exportBackup: () => BackupPayload;
  importBackup: (payload: BackupPayload) => { ok: boolean; error?: string };
  resetAll: () => void;
};

type StateEnvelope = {
  hydrated: boolean;
  hydrationError: string | null;
  state: AppState;
};

type Action =
  | { type: "hydrate"; state: AppState }
  | { type: "hydrate-error"; payload: { error: string } }
  | {
    type: "addTask";
    payload: { title: string; priority: TaskPriority; dueDate?: string; tags: string[] };
  }
  | { type: "updateTaskStatus"; payload: { taskId: string; status: TaskStatus } }
  | { type: "deleteTask"; payload: { taskId: string } }
  | { type: "snoozeTask"; payload: { taskId: string } }
  | { type: "pinTask"; payload: { taskId: string } }
  | { type: "addHabit"; payload: { name: string; iconKey: HabitIconKey; colorKey: HabitColorKey } }
  | { type: "toggleHabitForToday"; payload: { habitId: string } }
  | { type: "addSchoolDays"; payload: { dates: Date[] } }
  | { type: "removeSchoolDays"; payload: { dates: Date[] } }
  | { type: "addNote"; payload: { content: string; title?: string; tags: string[] } }
  | { type: "updateNote"; payload: { noteId: string; title?: string; content: string; tags: string[] } }
  | { type: "deleteNote"; payload: { noteId: string } }
  | { type: "reorderNotes"; payload: { sourceNoteId: string; targetNoteId: string; scopeNoteIds: string[] } }
  | { type: "pinNote"; payload: { noteId: string } }
  | { type: "setTheme"; payload: { theme: "dark" | "light" } }
  | { type: "import"; payload: { state: AppState } }
  | { type: "reset" };

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 50000;
const MAX_TAG_LENGTH = 30;
const MAX_TAGS_COUNT = 20;
const MAX_NAME_LENGTH = 100;

const nowIso = (): string => new Date().toISOString();

const sanitizeTags = (tags: string[]): string[] => {
  const seen = new Set<string>();
  return tags
    .map((tag) => tag.trim().toLowerCase().slice(0, MAX_TAG_LENGTH))
    .filter((tag) => tag.length > 0 && !seen.has(tag) && seen.add(tag));
};

const validateState = (state: unknown): state is AppState => {
  if (!state || typeof state !== "object") return false;
  const s = state as Record<string, unknown>;
  if (!Array.isArray(s.tasks)) return false;
  if (!Array.isArray(s.habits)) return false;
  if (!Array.isArray(s.notes)) return false;
  return true;
};

const normalizeStateForImport = (state: AppState): AppState => ({
  ...state,
  habits: state.habits.map((habit) => ({
    ...habit,
    ...normalizeHabitMeta({ id: habit.id, iconKey: habit.iconKey, colorKey: habit.colorKey }),
  })),
});

const getNextNoteOrder = (notes: Note[]): number => {
  if (notes.length === 0) return 0;
  return Math.max(...notes.map((note) => note.order)) + 1;
};

const recalcHabit = (habit: Habit): Habit => {
  const streak = calculateStreak(habit.entries);
  return {
    ...habit,
    currentStreak: streak.current,
    bestStreak: Math.max(habit.bestStreak, streak.best),
    updatedAt: nowIso(),
  };
};

const addOrUpdateTodayEntry = (entries: HabitEntry[]): HabitEntry[] => {
  const today = todayKey();
  const match = entries.find((entry) => entry.date === today);
  if (!match) {
    return [...entries, { date: today, completed: true }];
  }

  return entries.map((entry) =>
    entry.date === today ? { ...entry, completed: !entry.completed } : entry,
  );
};

const reducer = (envelope: StateEnvelope, action: Action): StateEnvelope => {
  const state = envelope.state;

  switch (action.type) {
    case "hydrate":
      return { hydrated: true, hydrationError: null, state: action.state };
    case "hydrate-error":
      return { hydrated: true, hydrationError: action.payload.error, state: getDefaultState() };
    case "addTask": {
      const task: Task = {
        id: makeId(),
        title: action.payload.title,
        priority: action.payload.priority,
        dueDate: action.payload.dueDate,
        status: "todo",
        tags: action.payload.tags,
        pinned: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      return { ...envelope, state: { ...state, tasks: [task, ...state.tasks] } };
    }
    case "updateTaskStatus":
      return {
        ...envelope,
        state: {
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === action.payload.taskId
              ? { ...task, status: action.payload.status, updatedAt: nowIso() }
              : task,
          ),
        },
      };
    case "deleteTask":
      return {
        ...envelope,
        state: {
          ...state,
          tasks: state.tasks.filter((task) => task.id !== action.payload.taskId),
        },
      };
    case "snoozeTask":
      return {
        ...envelope,
        state: {
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === action.payload.taskId
              ? { ...task, dueDate: tomorrowKey(), updatedAt: nowIso() }
              : task,
          ),
        },
      };
    case "pinTask":
      return {
        ...envelope,
        state: {
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === action.payload.taskId ? { ...task, pinned: !task.pinned } : task,
          ),
        },
      };
    case "addHabit": {
      const habit: Habit = {
        id: makeId(),
        name: action.payload.name,
        iconKey: action.payload.iconKey,
        colorKey: action.payload.colorKey,
        targetCadence: "daily",
        entries: [],
        currentStreak: 0,
        bestStreak: 0,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      return { ...envelope, state: { ...state, habits: [habit, ...state.habits] } };
    }
    case "toggleHabitForToday":
      return {
        ...envelope,
        state: {
          ...state,
          habits: state.habits.map((habit) =>
            habit.id === action.payload.habitId
              ? recalcHabit({ ...habit, entries: addOrUpdateTodayEntry(habit.entries) })
              : habit,
          ),
        },
      };
    case "addSchoolDays": {
      const formattedDates = action.payload.dates.map((d) => d.toISOString().split("T")[0]);
      const newDays = formattedDates.filter((d) => !state.schoolDays?.includes(d));
      return {
        ...envelope,
        state: { ...state, schoolDays: [...(state.schoolDays || []), ...newDays] },
      };
    }
    case "removeSchoolDays": {
      const formattedDates = action.payload.dates.map((d) => d.toISOString().split("T")[0]);
      return {
        ...envelope,
        state: {
          ...state,
          schoolDays: (state.schoolDays || []).filter((d) => !formattedDates.includes(d)),
        },
      };
    }
    case "addNote": {
      const note: Note = {
        id: makeId(),
        title: action.payload.title,
        content: action.payload.content,
        tags: action.payload.tags,
        pinned: false,
        order: getNextNoteOrder(state.notes),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      return { ...envelope, state: { ...state, notes: [note, ...state.notes] } };
    }
    case "updateNote":
      return {
        ...envelope,
        state: {
          ...state,
          notes: state.notes.map((note) =>
            note.id === action.payload.noteId
              ? {
                ...note,
                title: action.payload.title,
                content: action.payload.content,
                tags: action.payload.tags,
                updatedAt: nowIso(),
              }
              : note,
          ),
        },
      };
    case "reorderNotes": {
      const source = state.notes.find((note) => note.id === action.payload.sourceNoteId);
      const target = state.notes.find((note) => note.id === action.payload.targetNoteId);
      if (!source || !target || source.id === target.id || source.pinned !== target.pinned) {
        return envelope;
      }

      const scopedIds = action.payload.scopeNoteIds
        .filter((id) => state.notes.some((note) => note.id === id))
        .filter((id) => {
          const note = state.notes.find((item) => item.id === id);
          return note?.pinned === source.pinned;
        });

      const sourceIndex = scopedIds.indexOf(source.id);
      const targetIndex = scopedIds.indexOf(target.id);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
        return envelope;
      }

      const reorderedScope = [...scopedIds];
      const [moved] = reorderedScope.splice(sourceIndex, 1);
      reorderedScope.splice(targetIndex, 0, moved);
      const orderMap = new Map(reorderedScope.map((id, index) => [id, index]));

      return {
        ...envelope,
        state: {
          ...state,
          notes: state.notes.map((note) =>
            orderMap.has(note.id) ? { ...note, order: orderMap.get(note.id) ?? note.order } : note,
          ),
        },
      };
    }
    case "deleteNote":
      return {
        ...envelope,
        state: {
          ...state,
          notes: state.notes.filter((note) => note.id !== action.payload.noteId),
        },
      };
    case "pinNote":
      return {
        ...envelope,
        state: {
          ...state,
          notes: state.notes.map((note) =>
            note.id === action.payload.noteId ? { ...note, pinned: !note.pinned } : note,
          ),
        },
      };
    case "setTheme":
      return { ...envelope, state: { ...state, theme: action.payload.theme } };
    case "import":
      return { ...envelope, state: normalizeStateForImport(action.payload.state) };
    case "reset":
      return { ...envelope, state: getDefaultState() };
    default:
      return envelope;
  }
};

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [envelope, dispatch] = useReducer(reducer, {
    hydrated: false,
    hydrationError: null,
    state: getDefaultState(),
  });

  useEffect(() => {
    localProvider.fetch()
      .then((stored) => dispatch({ type: "hydrate", state: stored }))
      .catch((error) => dispatch({ type: "hydrate-error", payload: { error: error.message || "Failed to load data" } }));
  }, []);

  useEffect(() => {
    if (!envelope.hydrated) {
      return;
    }
    void localProvider.sync(envelope.state);
  }, [envelope.state, envelope.hydrated]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = envelope.state.theme;
  }, [envelope.state.theme]);

  useEffect(() => {
    if (typeof console === "undefined" || envelope.hydrated) return;
    
    const styles = "color: hsl(var(--primary)); font-size: 14px; font-weight: bold;";
    const messages = [
      "Nice find! You're curious. ",
      "You're looking under the hood! ",
      "Hey there, inspector! ",
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    console.log(`%c${randomMessage}This is your personal dashboard. Build something great today.`, styles);
  }, [envelope.hydrated]);

  const addTask = useCallback<DashboardContextValue["addTask"]>((input) => {
    const title = input.title.trim().slice(0, MAX_TITLE_LENGTH);
    if (!title) return;
    
    dispatch({
      type: "addTask",
      payload: {
        title,
        priority: input.priority ?? "medium",
        dueDate: input.dueDate,
        tags: sanitizeTags(input.tags ?? []).slice(0, MAX_TAGS_COUNT),
      },
    });
  }, []);

  const updateTaskStatus = useCallback<DashboardContextValue["updateTaskStatus"]>((taskId, status) => {
    dispatch({ type: "updateTaskStatus", payload: { taskId, status } });
  }, []);

  const deleteTask = useCallback<DashboardContextValue["deleteTask"]>((taskId) => {
    dispatch({ type: "deleteTask", payload: { taskId } });
  }, []);

  const snoozeTask = useCallback<DashboardContextValue["snoozeTask"]>((taskId) => {
    dispatch({ type: "snoozeTask", payload: { taskId } });
  }, []);

  const pinTask = useCallback<DashboardContextValue["pinTask"]>((taskId) => {
    dispatch({ type: "pinTask", payload: { taskId } });
  }, []);

  const addHabit = useCallback<DashboardContextValue["addHabit"]>((input) => {
    const trimmed = input.name.trim().slice(0, MAX_NAME_LENGTH);
    if (!trimmed) return;
    dispatch({
      type: "addHabit",
      payload: {
        name: trimmed,
        iconKey: input.iconKey,
        colorKey: input.colorKey,
      },
    });
  }, []);

  const toggleHabitForToday = useCallback<DashboardContextValue["toggleHabitForToday"]>((habitId) => {
    dispatch({ type: "toggleHabitForToday", payload: { habitId } });
  }, []);

  const addSchoolDays = useCallback<DashboardContextValue["addSchoolDays"]>((dates) => {
    dispatch({ type: "addSchoolDays", payload: { dates } });
  }, []);

  const removeSchoolDays = useCallback<DashboardContextValue["removeSchoolDays"]>((dates) => {
    dispatch({ type: "removeSchoolDays", payload: { dates } });
  }, []);

  const addNote = useCallback<DashboardContextValue["addNote"]>((content, title, tags) => {
    const trimmedContent = content.trim().slice(0, MAX_CONTENT_LENGTH);
    if (!trimmedContent) return;
    
    dispatch({
      type: "addNote",
      payload: {
        content: trimmedContent,
        title: title?.trim()?.slice(0, MAX_TITLE_LENGTH) || undefined,
        tags: sanitizeTags(tags ?? []).slice(0, MAX_TAGS_COUNT),
      },
    });
  }, []);

  const updateNote = useCallback<DashboardContextValue["updateNote"]>((noteId, input) => {
    const content = input.content.trim().slice(0, MAX_CONTENT_LENGTH);
    if (!content) {
      return;
    }

    dispatch({
      type: "updateNote",
      payload: {
        noteId,
        content,
        title: input.title?.trim()?.slice(0, MAX_TITLE_LENGTH) || undefined,
        tags: sanitizeTags(input.tags ?? []).slice(0, MAX_TAGS_COUNT),
      },
    });
  }, []);

  const deleteNote = useCallback<DashboardContextValue["deleteNote"]>((noteId) => {
    dispatch({ type: "deleteNote", payload: { noteId } });
  }, []);

  const reorderNotes = useCallback<DashboardContextValue["reorderNotes"]>((sourceNoteId, targetNoteId, scopeNoteIds) => {
    dispatch({ type: "reorderNotes", payload: { sourceNoteId, targetNoteId, scopeNoteIds } });
  }, []);

  const pinNote = useCallback<DashboardContextValue["pinNote"]>((noteId) => {
    dispatch({ type: "pinNote", payload: { noteId } });
  }, []);

  const setTheme = useCallback<DashboardContextValue["setTheme"]>((theme) => {
    dispatch({ type: "setTheme", payload: { theme } });
  }, []);

  const exportBackup = useCallback<DashboardContextValue["exportBackup"]>(() => ({
    version: SCHEMA_VERSION,
    exportedAt: nowIso(),
    state: envelope.state,
  }), [envelope.state]);

  const importBackup = useCallback<DashboardContextValue["importBackup"]>((payload) => {
    if (!payload || typeof payload.version !== "number" || payload.version > SCHEMA_VERSION || !payload.state) {
      return { ok: false, error: "Unsupported backup version" };
    }

    if (!validateState(payload.state)) {
      return { ok: false, error: "Invalid backup format" };
    }

    dispatch({ type: "import", payload: { state: normalizeStateForImport(payload.state) } });
    return { ok: true };
  }, []);

  const resetAll = useCallback<DashboardContextValue["resetAll"]>(() => {
    clearLocalState();
    dispatch({ type: "reset" });
  }, []);

  const value = useMemo<DashboardContextValue>(() => ({
    state: envelope.state,
    hydrated: envelope.hydrated,
    hydrationError: envelope.hydrationError,
    addTask,
    deleteTask,
    updateTaskStatus,
    snoozeTask,
    pinTask,
    addHabit,
    toggleHabitForToday,
    addSchoolDays,
    removeSchoolDays,
    addNote,
    updateNote,
    deleteNote,
    reorderNotes,
    pinNote,
    setTheme,
    exportBackup,
    importBackup,
    resetAll,
  }), [
    envelope.state,
    envelope.hydrated,
    envelope.hydrationError,
    addTask,
    deleteTask,
    updateTaskStatus,
    snoozeTask,
    pinTask,
    addHabit,
    toggleHabitForToday,
    addSchoolDays,
    removeSchoolDays,
    addNote,
    updateNote,
    deleteNote,
    reorderNotes,
    pinNote,
    setTheme,
    exportBackup,
    importBackup,
    resetAll,
  ]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = (): DashboardContextValue => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return ctx;
};
