import { CalendarCheck, MapPin, MessageCircle, Sparkles } from "lucide-react";
import type React from "react";
import type { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { buildWhatsappUrl } from "@/utils/whatsapp";

export function SalonHeader({ business }: { business: Business }) {
  const subtitle = business.subtitle || [business.city, "Beleza com hora marcada"].filter(Boolean).join(" - ");
  const description = business.bio || business.description || "Escolha seu servico, selecione o melhor horario e confirme pelo WhatsApp.";
  const highlights = [
    { icon: <Sparkles className="h-4 w-4" />, label: business.highlight_1_title || "+ 5.000", text: business.highlight_1_subtitle || "atendimentos" },
    { icon: <CalendarCheck className="h-4 w-4" />, label: business.highlight_2_title || "Desde", text: business.highlight_2_subtitle || "2020" },
    { icon: <MapPin className="h-4 w-4" />, label: business.highlight_3_title || "Natal/RN", text: business.highlight_3_subtitle || "local" },
  ];

  return (
    <header className="space-y-5 rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Agendamento com hora marcada</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-foreground">{business.name}</h1>
          <p className="mt-2 text-base font-medium text-foreground/80">{subtitle}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <Button asChild size="icon" variant="secondary" className="shrink-0 rounded-full" aria-label="Abrir WhatsApp">
          <a href={buildWhatsappUrl(business.whatsapp, `Oi! Vim pelo agendamento online da ${business.name}.`)}>
            <MessageCircle className="h-5 w-5" />
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {highlights.map((highlight) => (
          <Highlight key={`${highlight.label}-${highlight.text}`} icon={highlight.icon} label={highlight.label} text={highlight.text} />
        ))}
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
