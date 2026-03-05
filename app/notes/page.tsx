"use client";

import { FormEvent, useMemo, useState } from "react";
import { Filter, NotebookPen, Pin, Search, Tags } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { NoteList } from "@/components/note-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDashboard } from "@/lib/state/dashboard-context";

export default function NotesPage() {
  const { state, addNote } = useDashboard();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [pinnedOnly, setPinnedOnly] = useState(false);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    state.notes.forEach((note) => {
      note.tags.forEach((tag) => set.add(tag));
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [state.notes]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.notes.filter((note) => {
      const matchesQuery =
        q.length === 0 || `${note.title ?? ""} ${note.content} ${note.tags.join(" ")}`.toLowerCase().includes(q);
      const matchesTag = activeTag === "all" || note.tags.includes(activeTag);
      const matchesPin = !pinnedOnly || note.pinned;
      return matchesQuery && matchesTag && matchesPin;
    });
  }, [activeTag, pinnedOnly, search, state.notes]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    addNote(content.trim(), title.trim() || undefined, tags);
    setTitle("");
    setContent("");
    setTagsInput("");
  };

  return (
    <div className="stack-page">
      <section className="card">
        <h2>
          <NotebookPen size={18} /> Quick Notes
        </h2>
        <form className="stack-form" onSubmit={onSubmit}>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title (optional)" />
          <Input
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="tags,comma,separated"
          />
          <div className="editor-split">
            <Textarea
              rows={10}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write markdown notes..."
            />
            <div className="preview-panel">
              <h4>
                <Filter size={14} /> Live Preview
              </h4>
              <div className="markdown-body">
                <ReactMarkdown>{content || "Start typing markdown to preview..."}</ReactMarkdown>
              </div>
            </div>
          </div>
          <Button type="submit">Save Note</Button>
        </form>
      </section>

      <section className="card">
        <div className="notes-toolbar">
          <div className="input-with-icon">
            <Search size={14} />
            <Input
              className="h-9 border-0 bg-transparent"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notes, content, tags"
            />
          </div>
          <div className="input-with-icon">
            <Tags size={14} />
            <Select value={activeTag} onValueChange={setActiveTag}>
              <SelectTrigger className="h-9 border-0 bg-transparent">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    #{tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant={pinnedOnly ? "default" : "outline"} onClick={() => setPinnedOnly((current) => !current)}>
            <Pin size={14} />
            {pinnedOnly ? "Showing pinned" : "Show pinned only"}
          </Button>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="secondary">{filteredNotes.length} notes</Badge>
          {activeTag !== "all" ? <Badge>#{activeTag}</Badge> : null}
          {pinnedOnly ? <Badge>Pinned only</Badge> : null}
        </div>
        <NoteList notes={filteredNotes} />
      </section>
    </div>
  );
}
