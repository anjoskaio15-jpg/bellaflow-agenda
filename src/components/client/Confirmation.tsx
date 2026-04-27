import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Business } from "@/types/business";
import type { BeautyService } from "@/types/service";
import { formatLongDate } from "@/utils/dates";
import { buildClientConfirmationMessage, buildWhatsappUrl } from "@/utils/whatsapp";

interface ConfirmationProps {
  business: Business;
  name: string;
  services: BeautyService[];
  date: string;
  time: string;
}

export function Confirmation({ business, name, services, date, time }: ConfirmationProps) {
  const message = buildClientConfirmationMessage(name, services, date, time);

  return (
    <Card className="space-y-4 p-5 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
      <div>
        <h2 className="text-xl font-bold">Horario solicitado</h2>
        <p className="mt-2 text-sm text-muted-foreground">{business.confirmation_text}</p>
      </div>
      <div className="rounded-md bg-secondary/50 p-3 text-sm">
        {services.map((service) => service.name).join(", ")} em {formatLongDate(date)} as {time}
      </div>
      <Button asChild className="w-full">
        <a href={buildWhatsappUrl(business.whatsapp, message)} target="_blank" rel="noreferrer">
          Confirmar pelo WhatsApp
        </a>
      </Button>
    </Card>
  );
}
