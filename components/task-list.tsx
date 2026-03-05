"use client";

import { Check, Clock3, Pin, Play } from "lucide-react";
import { todayKey } from "@/lib/domain/date";
import { Task, TaskStatus } from "@/lib/domain/models";
import { useDashboard } from "@/lib/state/dashboard-context";

const statusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const TaskList = ({ tasks }: { tasks: Task[] }) => {
  const { updateTaskStatus, snoozeTask, pinTask } = useDashboard();

  if (tasks.length === 0) {
    return <p className="empty">No tasks in this view.</p>;
  }

  return (
    <ul className="stack-list">
      {tasks.map((task) => (
        <li key={task.id} className="task-row">
          <div>
            <h4>{task.title}</h4>
            <p>
              {task.priority.toUpperCase()} · {statusLabel[task.status]}
              {task.dueDate ? ` · due ${task.dueDate}` : ""}
              {task.pinned ? " · pinned" : ""}
            </p>
            {task.tags.length > 0 ? <small>#{task.tags.join(" #")}</small> : null}
          </div>
          <div className="row-actions">
            {task.status !== "done" ? (
              <button type="button" onClick={() => updateTaskStatus(task.id, "done")}>
                <Check size={14} />
                Done
              </button>
            ) : null}
            <button type="button" onClick={() => updateTaskStatus(task.id, "in_progress")}>
              <Play size={14} />
              Start
            </button>
            <button type="button" onClick={() => snoozeTask(task.id)}>
              <Clock3 size={14} />
              Snooze
            </button>
            <button type="button" onClick={() => pinTask(task.id)}>
              <Pin size={14} />
              Pin
            </button>
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
