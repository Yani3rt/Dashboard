"use client";

import { FormEvent, useMemo, useState } from "react";
import { TaskList, taskViews } from "@/components/task-list";
import { useDashboard } from "@/lib/state/dashboard-context";

export default function TasksPage() {
  const { state, addTask } = useDashboard();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");

  const today = useMemo(() => taskViews.today(state.tasks), [state.tasks]);
  const upcoming = useMemo(() => taskViews.upcoming(state.tasks), [state.tasks]);
  const completed = useMemo(() => taskViews.completed(state.tasks), [state.tasks]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    addTask({
      title: title.trim(),
      priority,
      dueDate: dueDate || undefined,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    setTitle("");
    setPriority("medium");
    setDueDate("");
    setTags("");
  };

  return (
    <div className="stack-page">
      <section className="card">
        <h2>Task Management</h2>
        <form onSubmit={onSubmit} className="grid-form">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" />
          <select value={priority} onChange={(event) => setPriority(event.target.value as "low" | "medium" | "high")}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="tags,comma,separated" />
          <button type="submit">Create Task</button>
        </form>
      </section>

      <section className="card">
        <h3>Today</h3>
        <TaskList tasks={today} />
      </section>

      <section className="card">
        <h3>Upcoming</h3>
        <TaskList tasks={upcoming} />
      </section>

      <section className="card">
        <h3>Completed</h3>
        <TaskList tasks={completed} />
      </section>
    </div>
  );
}
