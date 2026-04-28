import { Check, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { BeautyService } from "@/types/service";
import { cn } from "@/lib/utils";

interface ServiceListProps {
  services: BeautyService[];
  selectedIds: string[];
  onToggle: (service: BeautyService) => void;
}

export function ServiceList({ services, selectedIds, onToggle }: ServiceListProps) {
  if (!services.length) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center shadow-soft">
        <h3 className="font-semibold">Servicos em atualizacao</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A agenda esta ativa, mas os servicos ainda nao foram publicados. Fale pelo WhatsApp para consultar horarios.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => {
        const selected = selectedIds.includes(service.id);
        return (
          <button key={service.id} type="button" className="w-full text-left" onClick={() => onToggle(service)}>
            <Card className={cn("p-4 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-soft", selected && "border-primary ring-2 ring-primary/20")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold leading-snug">{service.name}</h3>
                  {service.description ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p> : null}
                  <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2.5 py-1 text-xs font-semibold text-foreground/80">
                    <Clock className="h-3.5 w-3.5" /> {service.duration_minutes} min
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <strong className="block text-primary">R$ {Number(service.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  <span className={cn("ml-auto mt-3 grid h-7 w-7 place-items-center rounded-full border", selected ? "border-primary bg-primary text-white" : "bg-background text-transparent")}>
                    <Check className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
