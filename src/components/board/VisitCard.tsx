import { Check, Minus, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Client } from "@/types";
import { badgeStyleForCity } from "@/lib/badge";
import { formatClock, VISIT_DURATION_MAX, VISIT_DURATION_MIN } from "@/lib/timing";
import { formatCardDate } from "@/lib/week";
import { Badge } from "@/components/ui/Badge";

export interface VisitCardTiming {
  arrival: number;
  departure: number;
}

export interface VisitCardProps {
  client: Client;
  stopNumber?: number | null;
  timing?: VisitCardTiming | null;
  duration?: number | null;
  selectMode?: boolean;
  selected?: boolean;
  onSelectToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePriority?: () => void;
  onDurationChange?: (minutes: number) => void;
}

export function VisitCard({
  client,
  stopNumber,
  timing,
  duration,
  selectMode = false,
  selected = false,
  onSelectToggle,
  onEdit,
  onDelete,
  onTogglePriority,
  onDurationChange,
}: VisitCardProps) {
  const badge = badgeStyleForCity(client.cityKey);

  return (
    <div
      className={`group relative rounded-md border bg-surface-2 p-2.5 my-1 transition-colors select-none ${
        client.priority ? "border-l-[3px] border-l-accent bg-gradient-to-r from-accent/10 to-surface-2" : ""
      } ${selected ? "border-accent shadow-[0_0_0_2px_rgba(124,58,237,0.4)]" : "border-border hover:border-accent/40"} ${
        selectMode ? "cursor-pointer" : ""
      }`}
      onClick={selectMode ? onSelectToggle : undefined}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-4 h-4 rounded-full bg-surface text-[9px] font-mono font-extrabold text-muted flex items-center justify-center flex-shrink-0">
          {stopNumber ?? "·"}
        </span>
        {client.priority && <Star size={10} className="text-warn fill-warn flex-shrink-0" />}
        <span className="text-[12.5px] font-semibold leading-snug text-foreground truncate min-w-0 flex-1">{client.name}</span>

        {selectMode ? (
          <span
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
              selected ? "bg-accent border-accent text-accent-foreground" : "border-subtle bg-background/80 text-transparent"
            }`}
          >
            <Check size={12} />
          </span>
        ) : (
          <span className="relative w-[78px] h-[18px] flex-shrink-0">
            <Badge
              className="absolute inset-y-0 right-0 max-w-full truncate group-hover:opacity-0 transition-opacity"
              style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}
              title={client.city}
            >
              {client.city}
            </Badge>
            <span className="absolute inset-y-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePriority?.();
                }}
                title={client.priority ? "Priority — click to unset" : "Set as priority"}
                className={`w-5 h-5 rounded flex items-center justify-center border ${
                  client.priority ? "bg-warn/25 border-warn/50 text-warn" : "bg-warn/10 border-warn/30 text-warn"
                }`}
              >
                <Star size={11} fill={client.priority ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                title="Edit"
                className="w-5 h-5 rounded flex items-center justify-center border bg-accent/15 border-accent/30 text-accent hover:bg-accent/30"
              >
                <Pencil size={11} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                title="Remove"
                className="w-5 h-5 rounded flex items-center justify-center border bg-danger/10 border-danger/30 text-danger hover:bg-danger/30"
              >
                <Trash2 size={11} />
              </button>
            </span>
          </span>
        )}
      </div>
      <div className="text-[10px] text-muted leading-snug mb-1">{client.address}</div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9.5px] text-muted font-mono">📅 {formatCardDate(client.date)}</span>
      </div>
      {timing && (
        <div className="mt-1 flex items-center justify-between gap-2 text-[9.5px] font-mono text-subtle px-1.5 py-1 bg-foreground/[0.03] rounded">
          <span>
            ⏰ {formatClock(timing.arrival)} → {formatClock(timing.departure)}
          </span>
          {onDurationChange && duration != null && (
            <span className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onDurationChange(duration - 15)}
                disabled={duration <= VISIT_DURATION_MIN}
                title="Shorter visit"
                className="w-4 h-4 rounded flex items-center justify-center border border-border text-muted hover:text-foreground hover:border-accent/40 disabled:opacity-30"
              >
                <Minus size={9} />
              </button>
              <span className="w-7 text-center">{duration}m</span>
              <button
                type="button"
                onClick={() => onDurationChange(duration + 15)}
                disabled={duration >= VISIT_DURATION_MAX}
                title="Longer visit"
                className="w-4 h-4 rounded flex items-center justify-center border border-border text-muted hover:text-foreground hover:border-accent/40 disabled:opacity-30"
              >
                <Plus size={9} />
              </button>
            </span>
          )}
        </div>
      )}
      {client.notes && <div className="mt-1 text-[10px] text-muted/80 italic">{client.notes}</div>}
    </div>
  );
}
