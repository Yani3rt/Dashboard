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

export interface Habit {
  id: string;
  name: string;
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
}

export interface BackupPayload {
  version: number;
  exportedAt: string;
  state: AppState;
}
