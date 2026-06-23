"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Day } from "@/types";
import { VisitCard, VisitCardProps } from "./VisitCard";

interface SortableVisitCardProps extends VisitCardProps {
  containerId: Day | "backlog";
  index: number;
}

/** Drag-enabled wrapper around VisitCard. Kept separate so VisitCard stays presentational. */
export function SortableVisitCard({ client, containerId, index, selectMode, ...rest }: SortableVisitCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: client.id,
    data: { containerId, index },
    disabled: selectMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(selectMode ? {} : attributes)}
      {...(selectMode ? {} : listeners)}
      className={selectMode ? "" : "cursor-grab active:cursor-grabbing touch-none"}
    >
      <VisitCard client={client} selectMode={selectMode} {...rest} />
    </div>
  );
}
