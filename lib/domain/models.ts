export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate?: string;
  status: TaskStatus;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitEntry {
  date: string;
  completed: boolean;
}

export const HABIT_ICON_KEYS = [
  "sparkles",
  "dumbbell",
  "book-open",
  "moon",
  "shower-head",
  "pen-line",
  "target",
  "droplets",
  "salad",
  "bed-double",
  "music",
  "monitor",
  "bike",
  "heart-pulse",
  "brain",
  "timer",
] as const;

export type HabitIconKey = (typeof HABIT_ICON_KEYS)[number];

export const HABIT_COLOR_KEYS = [
  "violet",
  "green",
  "yellow",
  "pink",
  "cyan",
  "orange",
  "teal",
] as const;

export type HabitColorKey = (typeof HABIT_COLOR_KEYS)[number];

export interface Habit {
  id: string;
  name: string;
  iconKey: HabitIconKey;
  colorKey: HabitColorKey;
  targetCadence: "daily";
  entries: HabitEntry[];
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  tags: string[];
  pinned: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  tasks: Task[];
  habits: Habit[];
  notes: Note[];
  theme: "dark" | "light";
  schoolDays: string[];
}

export interface BackupPayload {
  version: number;
  exportedAt: string;
  state: AppState;
}
