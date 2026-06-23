"use client";

import { CheckSquare } from "lucide-react";
import { useSchedulerStore, useStoreHydration } from "@/store/useSchedulerStore";
import { BoardDndProvider } from "@/components/board/BoardDndProvider";
import { WeeklyBoard } from "@/components/board/WeeklyBoard";
import { Backlog } from "@/components/backlog/Backlog";
import { ClientForm } from "@/components/client/ClientForm";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { WeekSelector } from "@/components/controls/WeekSelector";
import { TrafficToggle } from "@/components/controls/TrafficToggle";
import { DayFilter } from "@/components/controls/DayFilter";
import { DataActions } from "@/components/controls/DataActions";
import { SelectionBar } from "@/components/controls/SelectionBar";

export default function Home() {
  const hydrated = useStoreHydration();
  const openAddClientForm = useSchedulerStore((s) => s.openAddClientForm);
  const clientForm = useSchedulerStore((s) => s.clientForm);
  const selectMode = useSchedulerStore((s) => s.selectMode);
  const toggleSelectMode = useSchedulerStore((s) => s.toggleSelectMode);

  return (
    <div className="flex-1 p-4 md:p-5">
      <header className="mb-3 flex justify-between items-start gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold tracking-tight">📋 Site Visit Scheduler</h1>
          <p className="text-[11px] text-muted font-mono mt-0.5">
            Base: Fairview, Quezon City · Max 4 stops/day · Window: 10:01 AM – 4:59 PM
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="accent" onClick={openAddClientForm}>
            + Add Client
          </Button>
          <Button
            variant="default"
            active={selectMode}
            onClick={toggleSelectMode}
            title="Select multiple cards to move or delete in bulk"
          >
            <CheckSquare size={14} /> {selectMode ? "Selecting" : "Select"}
          </Button>
          <DataActions />
        </div>
      </header>

      <div className="flex justify-between items-center gap-3 flex-wrap mb-3">
        <WeekSelector />
        <TrafficToggle />
      </div>

      <DayFilter />

      {hydrated ? (
        <BoardDndProvider>
          <WeeklyBoard />
          <Backlog />
        </BoardDndProvider>
      ) : null}

      {clientForm && <ClientForm key={clientForm.mode === "edit" ? clientForm.clientId : "__add"} />}
      <ConfirmDialog />
      <Toast />
      <SelectionBar />
    </div>
  );
}
