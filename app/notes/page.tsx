"use client";

import { FormEvent, useMemo, useState } from "react";
import { CircleHelp, Filter, NotebookPen, Pin, Plus, Search, Tags } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { NoteList } from "@/components/note-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDashboard } from "@/lib/state/dashboard-context";

export default function NotesPage() {
  const { state, addNote } = useDashboard();
  const [createOpen, setCreateOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const helpMarkdown = `# Notes Help

## Quick Actions
- Use **Add Note** to create a new note with Markdown support.
- Use the **pin icon** to toggle pinned-only view.
- Use **search** to find notes by title, content, or tags.

## Markdown Tips
- Headings: \`# Title\`, \`## Section\`
- Lists: \`- item\`
- Emphasis: \`**bold**\`, \`*italic*\`
- Links: \`[label](https://example.com)\`
- Code: \`\`\`ts\nconst x = 1\n\`\`\`

## Note Management
- Open a note card to view full content.
- Use **Edit** to update title, tags, and content.
- Use **Pin** to keep important notes on top.
- Drag and drop notes to reorder within pinned/unpinned groups.
`;

  const allTags = useMemo(() => {
    const set = new Set<string>();
    state.notes.forEach((note) => {
      note.tags.forEach((tag) => set.add(tag));
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [state.notes]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.notes
      .filter((note) => {
        const matchesQuery =
          q.length === 0 || `${note.title ?? ""} ${note.content} ${note.tags.join(" ")}`.toLowerCase().includes(q);
        const matchesTag = activeTag === "all" || note.tags.includes(activeTag);
        const matchesPin = !pinnedOnly || note.pinned;
        return matchesQuery && matchesTag && matchesPin;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return a.order - b.order;
      });
  }, [activeTag, pinnedOnly, search, state.notes]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    addNote(content.trim(), title.trim() || undefined, tags);
    setTitle("");
    setContent("");
    setTagsInput("");
    setCreateOpen(false);
    setSubmitting(false);
  };

  return (
    <div className="stack-page">
      <section className="page-intro">
        <div className="page-intro-head">
          <div>
            <h1>Notes Workspace</h1>
            <p>Capture ideas fast, keep pinned context in sight, and turn rough thoughts into clean markdown.</p>
          </div>
          <div className="notes-actions">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" size="icon" variant="outline" aria-label="Open notes help" onClick={() => setHelpOpen(true)}>
                  <CircleHelp size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open notes help</TooltipContent>
            </Tooltip>
            <Button type="button" className="notes-primary" onClick={() => setCreateOpen(true)}>
              <Plus size={14} />
              Add Note
            </Button>
          </div>
        </div>
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
          <div className="notes-actions">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={pinnedOnly ? "default" : "outline"}
                  aria-label={pinnedOnly ? "Disable pinned-only filter" : "Enable pinned-only filter"}
                  onClick={() => setPinnedOnly((current) => !current)}
                >
                  <Pin size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{pinnedOnly ? "Showing pinned only" : "Show pinned only"}</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="secondary">{filteredNotes.length} notes</Badge>
          {activeTag !== "all" ? <Badge>#{activeTag}</Badge> : null}
          {pinnedOnly ? <Badge>Pinned only</Badge> : null}
        </div>
        <NoteList notes={filteredNotes} />
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="modal-card note-create-modal !flex !h-[86vh] !w-[94vw] !max-w-[1100px] !flex-col overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <NotebookPen size={18} /> Add Note
            </DialogTitle>
            <DialogDescription>
              Capture a note with markdown support. Use tags to organize your notes.
            </DialogDescription>
          </DialogHeader>
          <form className="stack-form note-create-form" onSubmit={onSubmit}>
            <Input 
              value={title} 
              onChange={(event) => setTitle(event.target.value)} 
              placeholder="Title (optional)" 
              maxLength={200}
              aria-label="Note title"
            />
            <Input
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="tags,comma,separated"
              maxLength={200}
              aria-label="Tags"
            />
            <div className="editor-split">
              <Textarea
                rows={18}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write markdown notes..."
                maxLength={50000}
                aria-label="Note content"
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
            <div className="note-create-actions">
              <Button type="submit" disabled={submitting || !content.trim()}>Save Note</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="modal-card">
          <DialogHeader>
            <DialogTitle>
              <CircleHelp size={18} /> Notes Help
            </DialogTitle>
            <DialogDescription>Quick reference for writing and managing notes.</DialogDescription>
          </DialogHeader>
          <div className="markdown-body">
            <ReactMarkdown>{helpMarkdown}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
