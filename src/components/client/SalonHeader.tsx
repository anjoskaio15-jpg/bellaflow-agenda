import { MessageCircle } from "lucide-react";
import type { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { buildWhatsappUrl } from "@/utils/whatsapp";

export function SalonHeader({ business }: { business: Business }) {
  return (
    <header className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Agendamento online</p>
          <h1 className="mt-1 text-3xl font-bold leading-tight">{business.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{business.description}</p>
        </div>
        <Button asChild size="icon" variant="secondary" aria-label="Abrir WhatsApp">
          <a href={buildWhatsappUrl(business.whatsapp, `Oi! Vim pelo agendamento online da ${business.name}.`)}>
            <MessageCircle className="h-5 w-5" />
          </a>
        </Button>
      </div>
      {business.address ? <p className="rounded-md bg-secondary/50 p-3 text-sm text-muted-foreground">{business.address}</p> : null}
    </header>
  );
}
