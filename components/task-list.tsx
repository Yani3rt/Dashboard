"use client";

import { Check, Clock3, Pin, Play } from "lucide-react";
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
            ) : null}
            <Button type="button" variant="outline" size="sm" onClick={() => updateTaskStatus(task.id, "in_progress")}>
              <Play size={14} />
              Start
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => snoozeTask(task.id)}>
              <Clock3 size={14} />
              Snooze
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => pinTask(task.id)}>
              <Pin size={14} />
              Pin
            </Button>
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
