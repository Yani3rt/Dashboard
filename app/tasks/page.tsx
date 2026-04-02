"use client";

import { FormEvent, useState } from "react";
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
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { KanbanBoard } from "@/components/kanban-board";
import { useDashboard } from "@/lib/state/dashboard-context";

export default function TasksPage() {
  const { state, addTask } = useDashboard();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<Date>();
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || submitting) return;
    
    setSubmitting(true);
    addTask({
      title: title.trim(),
      priority,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    setTitle("");
    setPriority("medium");
    setDueDate(undefined);
    setTags("");
    setSubmitting(false);
  };

  return (
    <div className="stack-page">
      <section className="page-intro">
        <div className="page-intro-head">
          <div>
            <h1>Task Board</h1>
            <p>Plan what matters, then move work forward with drag-and-drop execution.</p>
          </div>
        </div>
      </section>

      <Card className="card">
        <form onSubmit={onSubmit} className="grid-form">
          <Input 
            value={title} 
            onChange={(event) => setTitle(event.target.value)} 
            placeholder="Task title" 
            maxLength={200}
            required
            aria-label="Task title"
          />
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
          <DatePicker date={dueDate} setDate={setDueDate} />
          <Input 
            value={tags} 
            onChange={(event) => setTags(event.target.value)} 
            placeholder="tags,comma,separated" 
            maxLength={200}
            aria-label="Tags"
          />
          <Button type="submit" disabled={submitting || !title.trim()}>Create Task</Button>
        </form>
      </Card>

      <KanbanBoard tasks={state.tasks} />
    </div>
  );
}
