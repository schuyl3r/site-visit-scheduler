"use client";

import { useEffect } from "react";
import { useSchedulerStore } from "@/store/useSchedulerStore";
import { Button } from "./Button";

export function ConfirmDialog() {
  const confirmDialog = useSchedulerStore((s) => s.confirmDialog);
  const closeConfirmDialog = useSchedulerStore((s) => s.closeConfirmDialog);

  useEffect(() => {
    if (!confirmDialog) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeConfirmDialog();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmDialog, closeConfirmDialog]);

  if (!confirmDialog) return null;

  function handleConfirm() {
    confirmDialog?.onConfirm();
    closeConfirmDialog();
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1200] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeConfirmDialog();
      }}
    >
      <div className="bg-surface border border-border rounded-2xl w-full max-w-[400px] p-6 text-center shadow-2xl">
        <div className="text-base font-bold mb-2">{confirmDialog.title}</div>
        <div className="text-[13px] text-muted leading-relaxed">{confirmDialog.message}</div>
        {confirmDialog.detailLines && confirmDialog.detailLines.length > 0 && (
          <ul className="text-left text-[12px] text-muted bg-surface-2 border border-border rounded-md p-2.5 mt-3 space-y-1 max-h-40 overflow-y-auto">
            {confirmDialog.detailLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 justify-center mt-5">
          <Button variant="ghost" onClick={closeConfirmDialog}>
            Cancel
          </Button>
          <Button variant={confirmDialog.danger ? "danger" : "accent"} onClick={handleConfirm}>
            {confirmDialog.okLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
