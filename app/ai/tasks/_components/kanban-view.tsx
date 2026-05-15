"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { id: "backlog", title: "Backlog", color: "slate" },
  { id: "todo", title: "To Do", color: "blue" },
  { id: "in-progress", title: "In Progress", color: "amber" },
  { id: "done", title: "Done", color: "emerald" },
];

interface KanbanViewProps {
  tasks: any[];
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onAddTask: (status: string) => void;
}

export function KanbanView({ tasks, onEdit, onDelete, onStatusChange, onAddTask }: KanbanViewProps) {
  const [activeTask, setActiveTask] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => String(t._id) === active.id);
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => String(t._id) === activeId);
    if (!activeTask) return;

    // Check if we are dragging over a task or a column
    const overTask = tasks.find((t) => String(t._id) === overId);
    const overColumn = COLUMNS.find((c) => c.id === overId);

    const destStatus = overTask ? overTask.status : overColumn?.id;

    if (destStatus && activeTask.status !== destStatus) {
      onStatusChange(activeTask._id, destStatus);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start h-full">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={tasks.filter((t) => t.status === column.id)}
            onEdit={onEdit}
            onAddTask={() => onAddTask(column.id)}
            color={column.color}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeTask ? (
          <div className="w-[calc(100%-24px)] md:w-[300px]">
             <TaskCard key={`overlay-${String(activeTask._id)}`} task={activeTask} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}


function KanbanColumn({ id, title, tasks, onEdit, onAddTask, color }: any) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className="flex flex-col gap-6 h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "size-2 rounded-full",
            color === "slate" && "bg-slate-500",
            color === "blue" && "bg-blue-500",
            color === "amber" && "bg-amber-500",
            color === "emerald" && "bg-emerald-500"
          )} />
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">{title}</h3>
          <Badge variant="outline" className="bg-white/5 border-white/10 text-white/40 rounded-full">
            {tasks.length}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-8 hover:bg-white/5 text-white/40 hover:text-white"
          onClick={onAddTask}
        >
          <Plus size={14} />
        </Button>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-4 p-3 rounded-2xl bg-white/6 border border-dashed border-white/5 transition-colors"
      >
        <SortableContext items={tasks.map((t: any) => String(t._id))} strategy={verticalListSortingStrategy}>
          {tasks?.map((task: any) => (
            <TaskCard key={String(task._id)} task={task} onEdit={onEdit} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-white/10 italic text-sm">
            No tasks here
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start rounded-full text-white/40 hover:text-white/40 hover:bg-white/5 border border-dashed border-transparent hover:border-white/5 h-10 px-3"
          onClick={onAddTask}
        >
          <Plus size={14} className="mr-2" />
          Add task
        </Button>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, isOverlay }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(task._id) });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[120px] rounded-xl bg-white/2 border border-dashed border-white/10"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit?.(task)}
      className={cn(
        "group relative p-5 rounded-2xl bg-white/3 border border-white/10 hover:border-white/20 hover:bg-white/6 transition-all cursor-grab active:cursor-grabbing backdrop-blur-md",
        isOverlay && "cursor-grabbing shadow-2xl scale-105 border-white/30 bg-white/8"
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-white capitalize group-hover:text-white/90 leading-tight">
            {task.title}
          </h4>
          <Badge
            variant="outline"
            className={cn(
              "text-xs h-5 px-1.5 capitalize border-white/10 rounded-full",
              task.priority === "urgent" && "bg-red-500/10 text-red-400 border-red-500/20",
              task.priority === "high" && "bg-orange-500/10 text-orange-400 border-orange-500/20",
              task.priority === "medium" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
              task.priority === "low" && "bg-slate-500/10 text-slate-400 border-slate-500/20"
            )}
          >
            {task.priority}
          </Badge>
        </div>

        {task?.description && (
          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          {task?.dueDate && (
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <Calendar size={12} />
              <span>{format(new Date(task.dueDate), "MMM d")}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-white/40 ml-auto">
             <Clock size={12} />
             <span>{format(new Date(task.updatedAt || task.createdAt), "HH:mm")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
