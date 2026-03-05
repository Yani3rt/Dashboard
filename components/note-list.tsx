"use client";

import { Pin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Note } from "@/lib/domain/models";
import { useDashboard } from "@/lib/state/dashboard-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const NoteList = ({ notes }: { notes: Note[] }) => {
  const { pinNote } = useDashboard();

  if (notes.length === 0) {
    return <p className="empty">No notes captured.</p>;
  }

  return (
    <ul className="note-grid">
      {notes.map((note) => (
        <li key={note.id} className="note-card">
          <h4>{note.title ?? "Inbox note"}</h4>
          {note.tags.length > 0 ? (
            <div className="note-tags">
              {note.tags.map((tag) => (
                <Badge key={`${note.id}-${tag}`} variant="secondary">
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
              {note.content}
            </ReactMarkdown>
          </div>
          <Button type="button" variant="outline" onClick={() => pinNote(note.id)}>
            <Pin size={14} />
            {note.pinned ? "Unpin" : "Pin"}
          </Button>
        </li>
      ))}
    </ul>
  );
};
