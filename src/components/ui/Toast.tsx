"use client";

import { useEffect } from "react";
import { useSchedulerStore } from "@/store/useSchedulerStore";

export function Toast() {
  const toast = useSchedulerStore((s) => s.toast);
  const clearToast = useSchedulerStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(clearToast, 2600);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1a0a33] border border-[#4c1d95] text-[#c4b5fd] px-5 py-2.5 rounded-lg text-xs font-mono z-[2000] max-w-[90vw] text-center shadow-lg">
      {toast.message}
    </div>
  );
}
