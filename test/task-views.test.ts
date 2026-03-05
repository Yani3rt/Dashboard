import { describe, expect, it, vi } from "vitest";
import { taskViews } from "@/components/task-list";
import { Task } from "@/lib/domain/models";

const tasks: Task[] = [
  {
    id: "1",
    title: "Today",
    priority: "high",
    dueDate: "2026-03-05",
    status: "todo",
    tags: [],
    pinned: false,
    createdAt: "2026-03-05T00:00:00.000Z",
    updatedAt: "2026-03-05T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Upcoming",
    priority: "medium",
    dueDate: "2026-03-10",
    status: "todo",
    tags: [],
    pinned: false,
    createdAt: "2026-03-05T00:00:00.000Z",
    updatedAt: "2026-03-05T00:00:00.000Z",
  },
  {
    id: "3",
    title: "Done",
    priority: "low",
    dueDate: "2026-03-05",
    status: "done",
    tags: [],
    pinned: false,
    createdAt: "2026-03-05T00:00:00.000Z",
    updatedAt: "2026-03-05T00:00:00.000Z",
  },
];

describe("task views", () => {
  it("separates upcoming and completed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-05T10:00:00Z"));
    expect(taskViews.upcoming(tasks).length).toBe(1);
    expect(taskViews.completed(tasks).length).toBe(1);
    vi.useRealTimers();
  });
});
