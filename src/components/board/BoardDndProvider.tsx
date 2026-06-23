"use client";

import { ReactNode, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useSchedulerStore } from "@/store/useSchedulerStore";
import { Day, DAY_ORDER } from "@/types";
import { VisitCard } from "./VisitCard";

export const CONTAINER_PREFIX = "container:";

export function containerDroppableId(containerId: Day | "backlog"): string {
  return `${CONTAINER_PREFIX}${containerId}`;
}

function isDay(value: string): value is Day {
  return (DAY_ORDER as readonly string[]).includes(value);
}

interface SortableData {
  containerId: Day | "backlog";
  index: number;
}

export function BoardDndProvider({ children }: { children: ReactNode }) {
  const clients = useSchedulerStore((s) => s.clients);
  const moveClientCard = useSchedulerStore((s) => s.moveClientCard);
  const moveClientToBacklog = useSchedulerStore((s) => s.moveClientToBacklog);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const clientId = String(active.id);
    const overId = String(over.id);

    // Dropped on a container's empty space (droppable wrapper, not a specific card) -> append to end.
    if (overId.startsWith(CONTAINER_PREFIX)) {
      const containerId = overId.slice(CONTAINER_PREFIX.length);
      if (containerId === "backlog") {
        moveClientToBacklog(clientId);
      } else if (isDay(containerId)) {
        moveClientCard(clientId, containerId, Number.MAX_SAFE_INTEGER);
      }
      return;
    }

    // Dropped on another card -> insert at that card's index within its container.
    const overData = over.data.current as SortableData | undefined;
    if (!overData) return;

    if (overData.containerId === "backlog") {
      moveClientToBacklog(clientId);
    } else {
      moveClientCard(clientId, overData.containerId, overData.index);
    }
  }

  const activeClient = activeId ? clients[activeId] : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
      <DragOverlay>{activeClient ? <VisitCard client={activeClient} /> : null}</DragOverlay>
    </DndContext>
  );
}
