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
  Habit,
  HabitEntry,
  Note,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/lib/domain/models";
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
  addTask: (input: {
    title: string;
    priority?: TaskPriority;
    dueDate?: string;
    tags?: string[];
  }) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  snoozeTask: (taskId: string) => void;
  pinTask: (taskId: string) => void;
  addHabit: (name: string) => void;
  toggleHabitForToday: (habitId: string) => void;
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
  state: AppState;
};

type Action =
  | { type: "hydrate"; state: AppState }
  | {
      type: "addTask";
      payload: { title: string; priority: TaskPriority; dueDate?: string; tags: string[] };
    }
  | { type: "updateTaskStatus"; payload: { taskId: string; status: TaskStatus } }
  | { type: "snoozeTask"; payload: { taskId: string } }
  | { type: "pinTask"; payload: { taskId: string } }
  | { type: "addHabit"; payload: { name: string } }
  | { type: "toggleHabitForToday"; payload: { habitId: string } }
  | { type: "addNote"; payload: { content: string; title?: string; tags: string[] } }
  | { type: "updateNote"; payload: { noteId: string; title?: string; content: string; tags: string[] } }
  | { type: "deleteNote"; payload: { noteId: string } }
  | { type: "reorderNotes"; payload: { sourceNoteId: string; targetNoteId: string; scopeNoteIds: string[] } }
  | { type: "pinNote"; payload: { noteId: string } }
  | { type: "setTheme"; payload: { theme: "dark" | "light" } }
  | { type: "import"; payload: { state: AppState } }
  | { type: "reset" };

const nowIso = (): string => new Date().toISOString();

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
      return { hydrated: true, state: action.state };
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
      return { ...envelope, state: action.payload.state };
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
    state: getDefaultState(),
  });

  useEffect(() => {
    localProvider.fetch().then((stored) => dispatch({ type: "hydrate", state: stored }));
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

  const addTask = useCallback<DashboardContextValue["addTask"]>((input) => {
    dispatch({
      type: "addTask",
      payload: {
        title: input.title.trim(),
        priority: input.priority ?? "medium",
        dueDate: input.dueDate,
        tags: input.tags ?? [],
      },
    });
  }, []);

  const updateTaskStatus = useCallback<DashboardContextValue["updateTaskStatus"]>((taskId, status) => {
    dispatch({ type: "updateTaskStatus", payload: { taskId, status } });
  }, []);

  const snoozeTask = useCallback<DashboardContextValue["snoozeTask"]>((taskId) => {
    dispatch({ type: "snoozeTask", payload: { taskId } });
  }, []);

  const pinTask = useCallback<DashboardContextValue["pinTask"]>((taskId) => {
    dispatch({ type: "pinTask", payload: { taskId } });
  }, []);

  const addHabit = useCallback<DashboardContextValue["addHabit"]>((name) => {
    dispatch({ type: "addHabit", payload: { name: name.trim() } });
  }, []);

  const toggleHabitForToday = useCallback<DashboardContextValue["toggleHabitForToday"]>((habitId) => {
    dispatch({ type: "toggleHabitForToday", payload: { habitId } });
  }, []);

  const addNote = useCallback<DashboardContextValue["addNote"]>((content, title, tags) => {
    dispatch({
      type: "addNote",
      payload: {
        content: content.trim(),
        title: title?.trim(),
        tags: (tags ?? []).map((tag) => tag.trim()).filter(Boolean),
      },
    });
  }, []);

  const updateNote = useCallback<DashboardContextValue["updateNote"]>((noteId, input) => {
    const content = input.content.trim();
    if (!content) {
      return;
    }

    dispatch({
      type: "updateNote",
      payload: {
        noteId,
        content,
        title: input.title?.trim() || undefined,
        tags: (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
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
    if (!payload || payload.version !== SCHEMA_VERSION || !payload.state) {
      return { ok: false, error: "Unsupported backup version" };
    }

    dispatch({ type: "import", payload: { state: payload.state } });
    return { ok: true };
  }, []);

  const resetAll = useCallback<DashboardContextValue["resetAll"]>(() => {
    clearLocalState();
    dispatch({ type: "reset" });
  }, []);

  const value = useMemo<DashboardContextValue>(() => ({
    state: envelope.state,
    hydrated: envelope.hydrated,
    addTask,
    updateTaskStatus,
    snoozeTask,
    pinTask,
    addHabit,
    toggleHabitForToday,
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
    addTask,
    updateTaskStatus,
    snoozeTask,
    pinTask,
    addHabit,
    toggleHabitForToday,
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
