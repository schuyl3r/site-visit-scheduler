"use client";

import { ChangeEvent, useRef } from "react";
import { Download, Upload } from "lucide-react";
import { useSchedulerStore } from "@/store/useSchedulerStore";
import { buildExportPayload, downloadJSON, InvalidBackupError, parseImportPayload } from "@/lib/exportImport";
import { Button } from "@/components/ui/Button";

export function DataActions() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showToast = useSchedulerStore((s) => s.showToast);
  const importSnapshot = useSchedulerStore((s) => s.importSnapshot);
  const openConfirmDialog = useSchedulerStore((s) => s.openConfirmDialog);

  function handleExport() {
    const payload = buildExportPayload(useSchedulerStore.getState());
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJSON(payload, `site-visits-backup-${stamp}.json`);
    showToast("Backup downloaded");
  }

  function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      let payload;
      try {
        payload = parseImportPayload(String(reader.result));
      } catch (err) {
        showToast(err instanceof InvalidBackupError ? err.message : "Import failed while loading the data.");
        return;
      }
      openConfirmDialog({
        title: "Import backup?",
        message:
          "This will REPLACE everything currently in this browser (clients, all weeks, backlog). Consider exporting your current data first if you want to keep it.",
        okLabel: "Import",
        danger: true,
        onConfirm: () => importSnapshot(payload),
      });
    };
    reader.onerror = () => showToast("Could not read that file.");
    reader.readAsText(file);
  }

  return (
    <>
      <Button variant="default" onClick={handleExport} title="Download all your data as a backup file">
        <Download size={14} /> Export Data
      </Button>
      <Button variant="default" onClick={() => fileInputRef.current?.click()} title="Load data from a backup file">
        <Upload size={14} /> Import Data
      </Button>
      <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportFile} />
    </>
  );
}
