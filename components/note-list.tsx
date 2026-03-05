"use client";

import { FormEvent, useState } from "react";
import { Filter, GripVertical, NotebookPen, Pencil, Pin, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Note } from "@/lib/domain/models";
import { useDashboard } from "@/lib/state/dashboard-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const NoteList = ({ notes }: { notes: Note[] }) => {
  const { pinNote, updateNote, deleteNote, reorderNotes } = useDashboard();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);

  if (notes.length === 0) {
    return <p className="empty">No notes captured.</p>;
  }

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setDraftTitle(note.title ?? "");
    setDraftContent(note.content);
    setDraftTags(note.tags.join(", "));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftTitle("");
    setDraftContent("");
    setDraftTags("");
  };

  const onSubmitEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;

    const tags = draftTags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    updateNote(editingId, {
      title: draftTitle.trim() || undefined,
      content: draftContent,
      tags,
    });
    cancelEdit();
  };

  const onDelete = (noteId: string) => {
    if (!window.confirm("Delete this note? This cannot be undone.")) {
      return;
    }
    deleteNote(noteId);
    if (editingId === noteId) {
      cancelEdit();
    }
  };

  const onDragStart = (noteId: string) => {
    setDraggedNoteId(noteId);
  };

  const onDragEnd = () => {
    setDraggedNoteId(null);
  };

  const onDrop = (targetNote: Note) => {
    if (!draggedNoteId || draggedNoteId === targetNote.id) {
      return;
    }
    const dragged = notes.find((note) => note.id === draggedNoteId);
    if (!dragged || dragged.pinned !== targetNote.pinned) {
      return;
    }
    reorderNotes(
      draggedNoteId,
      targetNote.id,
      notes.filter((note) => note.pinned === targetNote.pinned).map((note) => note.id),
    );
    setDraggedNoteId(null);
  };

  const previewText = (content: string): string =>
    content
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/[#>*_~-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  return (
    <>
    <ul className="note-grid">
      {notes.map((note) => (
        <li
          key={note.id}
          className={draggedNoteId === note.id ? "note-card note-card-dragging" : "note-card"}
          draggable={!editingId}
          onDragStart={() => onDragStart(note.id)}
          onDragEnd={onDragEnd}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => onDrop(note)}
        >
          <div className="note-head">
            <h4>{note.title ?? "Inbox note"}</h4>
            <GripVertical size={14} className="text-muted-foreground" />
          </div>
          {note.tags.length > 0 ? (
            <div className="note-tags">
              {note.tags.map((tag) => (
                <Badge key={`${note.id}-${tag}`} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          ) : null}
          <div
            className="note-preview"
            role="button"
            tabIndex={0}
            onClick={() => setSelectedNote(note)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedNote(note);
              }
            }}
          >
            <p>{previewText(note.content)}</p>
          </div>
          <div className="row-actions">
            <Button type="button" variant="outline" size="sm" onClick={() => startEdit(note)}>
              <Pencil size={14} />
              Edit
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => pinNote(note.id)}>
              <Pin size={14} />
              {note.pinned ? "Unpin" : "Pin"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onDelete(note.id)}>
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
    <Dialog open={Boolean(selectedNote)} onOpenChange={(open) => !open && setSelectedNote(null)}>
      <DialogContent className="modal-card">
        <DialogHeader>
          <DialogTitle>{selectedNote?.title ?? "Inbox note"}</DialogTitle>
          <DialogDescription>
            Full note content preview.
          </DialogDescription>
        </DialogHeader>
        {selectedNote?.tags.length ? (
          <div className="note-tags">
            {selectedNote.tags.map((tag) => (
              <Badge key={`${selectedNote.id}-${tag}`} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="markdown-body">
          <ReactMarkdown
            components={{
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {selectedNote?.content ?? ""}
          </ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={Boolean(editingId)} onOpenChange={(open) => !open && cancelEdit()}>
      <DialogContent className="modal-card note-create-modal !flex !h-[86vh] !w-[94vw] !max-w-[1100px] !flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <NotebookPen size={18} /> Edit Note
          </DialogTitle>
          <DialogDescription>
            Update your note with markdown support and save when ready.
          </DialogDescription>
        </DialogHeader>
        <form className="stack-form note-create-form" onSubmit={onSubmitEdit}>
          <Input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="Title (optional)"
          />
          <Input
            value={draftTags}
            onChange={(event) => setDraftTags(event.target.value)}
            placeholder="tags,comma,separated"
          />
          <div className="editor-split">
            <Textarea
              rows={18}
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              placeholder="Write markdown notes..."
            />
            <div className="preview-panel">
              <h4>
                <Filter size={14} /> Live Preview
              </h4>
              <div className="markdown-body">
                <ReactMarkdown>{draftContent || "Start typing markdown to preview..."}</ReactMarkdown>
              </div>
            </div>
          </div>
          <div className="note-create-actions flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};
