"use client";

import { ReactNode, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSchedulerStore } from "@/store/useSchedulerStore";
import { Button } from "@/components/ui/Button";

const NCR_CITIES = [
  "Caloocan",
  "Las Piñas",
  "Makati",
  "Malabon",
  "Mandaluyong",
  "Manila",
  "Marikina",
  "Muntinlupa",
  "Navotas",
  "Parañaque",
  "Pasay",
  "Pasig",
  "Pateros",
  "Quezon City",
  "San Juan",
  "Taguig",
  "Valenzuela",
];

const OTHER_VALUE = "__other";

const INPUT_CLASS =
  "w-full bg-surface-2 border border-border text-foreground px-2.5 py-2 rounded-md text-sm outline-none focus:border-accent/65 transition-colors";

interface FormFields {
  name: string;
  address: string;
  citySelect: string;
  customCity: string;
  notes: string;
  priority: boolean;
  dateISO: string;
}

const EMPTY_FORM: FormFields = {
  name: "",
  address: "",
  citySelect: "",
  customCity: "",
  notes: "",
  priority: false,
  dateISO: "",
};

function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[10.5px] font-bold text-muted font-mono uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function ClientForm() {
  const clientForm = useSchedulerStore((s) => s.clientForm);
  const clients = useSchedulerStore((s) => s.clients);
  const confirmDialog = useSchedulerStore((s) => s.confirmDialog);
  const closeClientForm = useSchedulerStore((s) => s.closeClientForm);
  const checkDuplicates = useSchedulerStore((s) => s.checkDuplicates);
  const commitClient = useSchedulerStore((s) => s.commitClient);
  const deleteClient = useSchedulerStore((s) => s.deleteClient);
  const openConfirmDialog = useSchedulerStore((s) => s.openConfirmDialog);

  const isOpen = clientForm !== null;
  const editingClientId = clientForm?.mode === "edit" ? clientForm.clientId : undefined;
  const editingClient = editingClientId ? clients[editingClientId] : undefined;

  // Lazy-initialized from props; page.tsx remounts this component (via `key`)
  // whenever the target client changes, so this only runs once per open.
  const [fields, setFields] = useState<FormFields>(() => {
    if (editingClient) {
      const isNcr = NCR_CITIES.includes(editingClient.city);
      return {
        name: editingClient.name,
        address: editingClient.address,
        citySelect: isNcr ? editingClient.city : OTHER_VALUE,
        customCity: isNcr ? "" : editingClient.city,
        notes: editingClient.notes,
        priority: editingClient.priority,
        dateISO: editingClient.date,
      };
    }
    return EMPTY_FORM;
  });

  useEffect(() => {
    if (!isOpen || confirmDialog) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeClientForm();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, confirmDialog, closeClientForm]);

  if (!isOpen) return null;

  const city = fields.citySelect === OTHER_VALUE ? fields.customCity.trim() : fields.citySelect;
  const canSubmit = Boolean(fields.name.trim() && fields.address.trim() && city);

  function update<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    const name = fields.name.trim();
    const address = fields.address.trim();
    if (!name || !address || !city) return;

    const input = { name, address, city, notes: fields.notes.trim(), priority: fields.priority, dateISO: fields.dateISO };
    const dupes = checkDuplicates(name, editingClientId);
    if (dupes.length) {
      const word = dupes.length > 1 ? "clients" : "a client";
      openConfirmDialog({
        title: "Duplicate name",
        message: `You already have ${word} named "${name}". Add this as a separate client anyway?`,
        detailLines: dupes.map((d) => `${d.name} — ${d.where.join("; ")}`),
        okLabel: "Add anyway",
        onConfirm: () => {
          commitClient(input, editingClientId);
          closeClientForm();
        },
      });
      return;
    }
    commitClient(input, editingClientId);
    closeClientForm();
  }

  function handleDelete() {
    if (!editingClientId || !editingClient) return;
    openConfirmDialog({
      title: "Remove client?",
      message: `Remove ${editingClient.name} from the schedule? This removes them from all weeks and the backlog.`,
      okLabel: "Delete",
      danger: true,
      onConfirm: () => {
        deleteClient(editingClientId);
        closeClientForm();
      },
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeClientForm();
      }}
    >
      <div className="bg-surface border border-border rounded-xl w-full max-w-[460px] max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center px-5 py-4 border-b border-border sticky top-0 bg-surface">
          <span className="text-sm font-bold">{editingClientId ? "✎ Edit Client" : "+ Add New Client"}</span>
          <button type="button" onClick={closeClientForm} className="text-muted hover:text-foreground hover:bg-border rounded p-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="Client Name *">
            <input
              className={INPUT_CLASS}
              value={fields.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Juan dela Cruz"
              autoFocus
            />
          </Field>
          <Field label="Address *">
            <input
              className={INPUT_CLASS}
              value={fields.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="e.g. 123 Main St., Brgy. San Isidro"
            />
          </Field>
          <Field label="City *">
            <select className={INPUT_CLASS} value={fields.citySelect} onChange={(e) => update("citySelect", e.target.value)}>
              <option value="">— Select city / municipality —</option>
              <optgroup label="Metro Manila (NCR)">
                {NCR_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Outside Metro Manila">
                <option value={OTHER_VALUE}>Other / Custom location...</option>
              </optgroup>
            </select>
          </Field>
          {fields.citySelect === OTHER_VALUE && (
            <Field label="Custom City / Location">
              <input
                className={INPUT_CLASS}
                value={fields.customCity}
                onChange={(e) => update("customCity", e.target.value)}
                placeholder="e.g. Antipolo, Rizal"
              />
            </Field>
          )}
          <Field label="Notes (optional)">
            <textarea
              className={`${INPUT_CLASS} resize-y min-h-[56px]`}
              value={fields.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              placeholder="e.g. Morning visits only · Must confirm gate pass first"
            />
          </Field>
          <Field label={<span className="normal-case font-normal">Schedule for date (moves card to that day — leave blank for Backlog)</span>}>
            <input type="date" className={INPUT_CLASS} value={fields.dateISO} onChange={(e) => update("dateISO", e.target.value)} />
          </Field>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium">
            <input
              type="checkbox"
              checked={fields.priority}
              onChange={(e) => update("priority", e.target.checked)}
              className="w-4 h-4 accent-warn cursor-pointer"
            />
            <span>⭐ Mark as priority client</span>
          </label>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-border">
          <div>{editingClientId && <Button variant="danger" type="button" onClick={handleDelete}>Delete</Button>}</div>
          <div className="flex gap-2">
            <Button variant="ghost" type="button" onClick={closeClientForm}>
              Cancel
            </Button>
            <Button variant="accent" type="button" disabled={!canSubmit} onClick={handleSubmit}>
              {editingClientId ? "Save Changes" : "Add to Backlog →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
