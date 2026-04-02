"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { todayKey } from "@/lib/domain/date";
import { Task, TaskStatus } from "@/lib/domain/models";
import { useDashboard } from "@/lib/state/dashboard-context";

const statusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const TaskList = ({ tasks }: { tasks: Task[] }) => {
  const { updateTaskStatus } = useDashboard();

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty">No Active Tasks.</p>
        <p className="empty-hint">Enjoy your free time, or add a task!</p>
      </div>
    );
  }

  return (
    <ul className="stack-list">
      {tasks.map((task) => (
        <li key={task.id} className={`task-row ${task.status === "done" ? "task-done" : ""}`}>
          <div>
            <h4 className={task.status === "done" ? "line-through opacity-70" : ""}>{task.title}</h4>
            <p>
              <span className={task.status === "done" ? "text-success" : ""}>{task.priority.toUpperCase()}</span>
              {" · "}
              <span className={task.status === "done" ? "text-success" : ""}>{statusLabel[task.status]}</span>
              {task.dueDate ? ` · due ${task.dueDate}` : ""}
              {task.pinned ? " · pinned" : ""}
            </p>
            {task.tags.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <Badge key={`${task.id}-${tag}`} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
          <div className="row-actions">
            {task.status !== "done" ? (
              <Button type="button" variant="secondary" size="sm" onClick={() => updateTaskStatus(task.id, "done")}>
                <Check size={14} />
                Done
              </Button>
            ) : (
              <Badge variant="success">Completed</Badge>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export const taskViews = {
  today: (tasks: Task[]) =>
    tasks.filter((task) => (task.dueDate === todayKey() || !task.dueDate) && task.status !== "done"),
  upcoming: (tasks: Task[]) =>
    tasks.filter((task) => task.status !== "done" && task.dueDate && task.dueDate > todayKey()),
  completed: (tasks: Task[]) => tasks.filter((task) => task.status === "done"),
};
