import { CalendarCheck, MapPin, MessageCircle, Sparkles } from "lucide-react";
import type React from "react";
import type { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { buildWhatsappUrl } from "@/utils/whatsapp";

export function SalonHeader({ business }: { business: Business }) {
  return (
    <header className="space-y-5 rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Agendamento com hora marcada</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-foreground">{business.name}</h1>
          <p className="mt-2 text-base font-medium text-foreground/80">Nails, cabelo e cilios em Natal/RN</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{business.description}</p>
        </div>
        <Button asChild size="icon" variant="secondary" className="shrink-0 rounded-full" aria-label="Abrir WhatsApp">
          <a href={buildWhatsappUrl(business.whatsapp, `Oi! Vim pelo agendamento online da ${business.name}.`)}>
            <MessageCircle className="h-5 w-5" />
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Highlight icon={<Sparkles className="h-4 w-4" />} label="+ 5.000" text="atendimentos" />
        <Highlight icon={<CalendarCheck className="h-4 w-4" />} label="Desde" text="2020" />
        <Highlight icon={<MapPin className="h-4 w-4" />} label="Natal" text="RN" />
      </div>

      {business.address ? <p className="rounded-md bg-secondary/50 p-3 text-sm text-muted-foreground">{business.address}</p> : null}
    </header>
  );
}

function Highlight({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <div className="rounded-md border bg-background/80 p-3 text-center">
      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-primary">{icon}</div>
      <strong className="block text-sm leading-tight">{label}</strong>
      <span className="text-xs text-muted-foreground">{text}</span>
    </div>
  );
}
