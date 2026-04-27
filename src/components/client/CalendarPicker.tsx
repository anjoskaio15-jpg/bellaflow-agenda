import { addDaysIso, formatShortDate } from "@/utils/dates";
import { cn } from "@/lib/utils";

interface CalendarPickerProps {
  value: string;
  onChange: (date: string) => void;
}

export function CalendarPicker({ value, onChange }: CalendarPickerProps) {
  const days = Array.from({ length: 14 }, (_, index) => addDaysIso(index));

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {days.map((date) => (
        <button
          key={date}
          type="button"
          onClick={() => onChange(date)}
          className={cn(
            "min-h-16 rounded-md border bg-card p-2 text-center text-sm transition",
            value === date && "border-primary bg-primary text-primary-foreground",
          )}
        >
          <span className="block text-xs opacity-70">{new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short" })}</span>
          <strong>{formatShortDate(date)}</strong>
        </button>
      ))}
    </div>
  );
}
