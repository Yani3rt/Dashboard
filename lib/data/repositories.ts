import { Habit, Note, Task } from "@/lib/domain/models";

export interface TaskRepository {
  list(): Promise<Task[]>;
  save(tasks: Task[]): Promise<void>;
}

export interface HabitRepository {
  list(): Promise<Habit[]>;
  save(habits: Habit[]): Promise<void>;
}

export interface NoteRepository {
  list(): Promise<Note[]>;
  save(notes: Note[]): Promise<void>;
}
