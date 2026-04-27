import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { BeautyService } from "@/types/service";
import { cn } from "@/lib/utils";

interface ServiceListProps {
  services: BeautyService[];
  selectedIds: string[];
  onToggle: (service: BeautyService) => void;
}

export function ServiceList({ services, selectedIds, onToggle }: ServiceListProps) {
  return (
    <div className="space-y-3">
      {services.map((service) => {
        const selected = selectedIds.includes(service.id);
        return (
          <button key={service.id} type="button" className="w-full text-left" onClick={() => onToggle(service)}>
            <Card className={cn("p-4 transition", selected && "border-primary ring-2 ring-primary/20")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                  <p className="mt-2 text-sm font-medium">{service.duration_minutes} min</p>
                </div>
                <div className="text-right">
                  <strong className="block">R$ {Number(service.price).toLocaleString("pt-BR")}</strong>
                  {selected ? <Check className="ml-auto mt-2 h-5 w-5 text-primary" /> : null}
                </div>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
