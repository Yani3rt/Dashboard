"use client";

import { useState, type DragEvent } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task, TaskStatus } from "@/lib/domain/models";
import { useDashboard } from "@/lib/state/dashboard-context";

const columns: { id: TaskStatus; label: string }[] = [
    { id: "todo", label: "To Do" },
    { id: "in_progress", label: "In Progress" },
    { id: "done", label: "Done" },
];

export const KanbanBoard = ({ tasks }: { tasks: Task[] }) => {
    const { updateTaskStatus, deleteTask } = useDashboard();
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

    const onDragStart = (event: DragEvent<HTMLLIElement>, taskId: string) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", taskId);
        setDraggedTaskId(taskId);
    };

    const onDragEnd = () => {
        setDraggedTaskId(null);
        setDragOverColumn(null);
    };

    const onDragOver = (event: DragEvent<HTMLDivElement>, columnId: TaskStatus) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDragOverColumn(columnId);
    };

    const onDragLeave = () => {
        setDragOverColumn(null);
    };

    const onDrop = (event: DragEvent<HTMLDivElement>, columnId: TaskStatus) => {
        event.preventDefault();
        const taskId = event.dataTransfer.getData("text/plain");
        if (taskId) {
            updateTaskStatus(taskId, columnId);
        }
        setDraggedTaskId(null);
        setDragOverColumn(null);
    };

    const onDelete = (taskId: string) => {
        if (!window.confirm("Delete this task? This cannot be undone.")) return;
        deleteTask(taskId);
    };

    const priorityVariant = (priority: string): "default" | "secondary" | "outline" => {
        switch (priority) {
            case "high": return "default";
            case "medium": return "secondary";
            default: return "outline";
        }
    };

    return (
        <div className="kanban-board">
            {columns.map((column) => {
                const columnTasks = tasks.filter((t) => t.status === column.id);
                const isOver = dragOverColumn === column.id;

                return (
                    <div
                        key={column.id}
                        className={`kanban-column ${isOver ? "kanban-column-over" : ""}`}
                        onDragOver={(e) => onDragOver(e, column.id)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, column.id)}
                    >
                        <div className="kanban-column-header">
                            <h4>{column.label}</h4>
                            <Badge variant="secondary">{columnTasks.length}</Badge>
                        </div>
                        <ul className="kanban-list">
                            {columnTasks.map((task) => (
                                <li
                                    key={task.id}
                                    className={`kanban-card ${draggedTaskId === task.id ? "kanban-card-dragging" : ""}`}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, task.id)}
                                    onDragEnd={onDragEnd}
                                >
                                    <div className="kanban-card-header">
                                        <span className="kanban-card-title">{task.title}</span>
                                        <GripVertical size={14} className="kanban-grip" />
                                    </div>
                                    <div className="kanban-card-meta">
                                        <Badge variant={priorityVariant(task.priority)}>
                                            {task.priority}
                                        </Badge>
                                        {task.dueDate ? (
                                            <span className="kanban-due">Due {task.dueDate}</span>
                                        ) : null}
                                    </div>
                                    {task.tags.length > 0 ? (
                                        <div className="kanban-tags">
                                            {task.tags.map((tag) => (
                                                <Badge key={`${task.id}-${tag}`} variant="outline">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : null}
                                    <div className="kanban-card-actions">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onDelete(task.id)}
                                            className="kanban-delete-btn"
                                        >
                                            <Trash2 size={12} />
                                            Delete
                                        </Button>
                                    </div>
                                </li>
                            ))}
                            {columnTasks.length === 0 ? (
                                <li className="kanban-empty">
                                    Drop tasks here
                                </li>
                            ) : null}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
};
