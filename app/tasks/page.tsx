"use client";

import { FormEvent, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    if (!title.trim()) return;

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
      <Card className="card">
        <h2>Task Management</h2>
        <form onSubmit={onSubmit} className="grid-form">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" />
          <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="tags,comma,separated" />
          <Button type="submit">Create Task</Button>
        </form>
      </Card>

      <Card className="card">
        <h3>Today</h3>
        <TaskList tasks={today} />
      </Card>

      <Card className="card">
        <h3>Upcoming</h3>
        <TaskList tasks={upcoming} />
      </Card>

      <Card className="card">
        <h3>Completed</h3>
        <TaskList tasks={completed} />
      </Card>
    </div>
  );
}
