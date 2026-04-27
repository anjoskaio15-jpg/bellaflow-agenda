import { cn } from "@/lib/utils";

interface TimeSlotsProps {
  slots: string[];
  selected?: string;
  loading?: boolean;
  onSelect: (time: string) => void;
}

export function TimeSlots({ slots, selected, loading, onSelect }: TimeSlotsProps) {
  if (loading) return <p className="rounded-md border bg-card p-4 text-sm text-muted-foreground">Buscando horarios disponiveis...</p>;
  if (!slots.length) return <p className="rounded-md border bg-card p-4 text-sm text-muted-foreground">Nenhum horario disponivel para esta data.</p>;

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSelect(slot)}
          className={cn("h-11 rounded-md border bg-card text-sm font-semibold", selected === slot && "border-primary bg-primary text-white")}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
